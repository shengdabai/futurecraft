import Foundation
import StoreKit

/// In-App Purchase 管理器
/// 处理订阅和虚拟货币购买
@MainActor
class IAPManager: ObservableObject {
    static let shared = IAPManager()
    
    @Published var products: [Product] = []
    @Published var purchasedProductIDs: Set<String> = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    // MARK: - Product IDs (更新为新的 Bundle ID 前缀)
    // 需要在 App Store Connect 中创建对应的产品
    enum ProductID {
        static let monthlySubscription = "com.zturns.futurecraft.sub.monthly"
        static let yearlySubscription = "com.zturns.futurecraft.sub.yearly"
        static let points250 = "com.zturns.futurecraft.points.250"
        static let points600 = "com.zturns.futurecraft.points.600"
        static let points1400 = "com.zturns.futurecraft.points.1400"
        
        static var all: [String] {
            [monthlySubscription, yearlySubscription, points250, points600, points1400]
        }
        
        static var subscriptions: [String] {
            [monthlySubscription, yearlySubscription]
        }
        
        static var consumables: [String] {
            [points250, points600, points1400]
        }
    }
    
    private var updateListenerTask: Task<Void, Error>?
    
    private init() {
        // 启动交易监听
        updateListenerTask = listenForTransactions()
        
        // 加载产品
        Task {
            await loadProducts()
            await updatePurchasedProducts()
        }
    }
    
    deinit {
        updateListenerTask?.cancel()
    }
    
    // MARK: - Load Products
    
    /// 从 App Store 加载产品信息
    func loadProducts() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let storeProducts = try await Product.products(for: ProductID.all)
            
            // 按类型排序：订阅在前，消费品在后
            products = storeProducts.sorted { product1, product2 in
                if product1.type == .autoRenewable && product2.type != .autoRenewable {
                    return true
                }
                if product1.type != .autoRenewable && product2.type == .autoRenewable {
                    return false
                }
                return product1.price < product2.price
            }
            
            isLoading = false
        } catch {
            errorMessage = "Failed to load products: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    // MARK: - Purchase
    
    /// 购买产品
    func purchase(_ product: Product) async throws -> Transaction? {
        isLoading = true
        errorMessage = nil
        
        defer { isLoading = false }
        
        let result = try await product.purchase()
        
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            
            // 处理交易
            await handleTransaction(transaction, product: product)
            
            // 完成交易
            await transaction.finish()
            
            return transaction
            
        case .userCancelled:
            return nil
            
        case .pending:
            // 交易需要额外验证（如家长控制）
            return nil
            
        @unknown default:
            return nil
        }
    }
    
    // MARK: - Restore Purchases
    
    /// 恢复购买（用于订阅）
    func restorePurchases() async {
        isLoading = true
        
        do {
            try await AppStore.sync()
            await updatePurchasedProducts()
        } catch {
            errorMessage = "Failed to restore purchases: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
    
    // MARK: - Check Subscription Status
    
    /// 检查用户是否有有效订阅
    func hasActiveSubscription() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                if ProductID.subscriptions.contains(transaction.productID) {
                    return true
                }
            }
        }
        return false
    }
    
    // MARK: - Private Methods
    
    /// 监听交易更新
    private func listenForTransactions() -> Task<Void, Error> {
        return Task.detached {
            for await result in Transaction.updates {
                do {
                    let transaction = try await self.checkVerified(result)
                    
                    await MainActor.run {
                        self.purchasedProductIDs.insert(transaction.productID)
                    }
                    
                    await transaction.finish()
                } catch {
                    print("Transaction failed verification: \(error)")
                }
            }
        }
    }
    
    /// 验证交易
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let signedType):
            return signedType
        }
    }
    
    /// 处理交易
    private func handleTransaction(_ transaction: Transaction, product: Product) async {
        // 更新本地状态
        purchasedProductIDs.insert(transaction.productID)
        
        // 如果是消费型商品（点数），需要向后端报告
        if ProductID.consumables.contains(transaction.productID) {
            await reportConsumablePurchase(transaction: transaction, product: product)
        }
        
        // 如果是订阅，向后端同步订阅状态
        if ProductID.subscriptions.contains(transaction.productID) {
            await syncSubscriptionStatus(transaction: transaction)
        }
    }
    
    /// 向后端报告消费型购买
    private func reportConsumablePurchase(transaction: Transaction, product: Product) async {
        guard let accessToken = KeychainManager.shared.getAccessToken() else { return }
        
        // 从 product ID 提取点数
        let points: Int
        switch transaction.productID {
        case ProductID.points250: points = 250
        case ProductID.points600: points = 600
        case ProductID.points1400: points = 1400
        default: return
        }
        
        // 调用后端 API 增加点数
        // POST /iap/verify-purchase
        // Body: { transactionId, productId, points }
        do {
            guard let region = RegionManager().selectedRegion else { return }
            let url = URL(string: "\(region.baseURL)/iap/verify-purchase")!
            
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let body: [String: Any] = [
                "transactionId": String(transaction.id),
                "productId": transaction.productID,
                "points": points
            ]
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
            
            let (_, response) = try await URLSession.shared.data(for: request)
            
            if let httpResponse = response as? HTTPURLResponse,
               !(200...299).contains(httpResponse.statusCode) {
                print("Failed to report consumable purchase: \(httpResponse.statusCode)")
            }
        } catch {
            print("Error reporting consumable purchase: \(error)")
        }
    }
    
    /// 向后端同步订阅状态
    private func syncSubscriptionStatus(transaction: Transaction) async {
        guard let accessToken = KeychainManager.shared.getAccessToken() else { return }
        
        do {
            guard let region = RegionManager().selectedRegion else { return }
            let url = URL(string: "\(region.baseURL)/iap/sync-subscription")!
            
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            
            let body: [String: Any] = [
                "transactionId": String(transaction.id),
                "productId": transaction.productID,
                "originalTransactionId": String(transaction.originalID)
            ]
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
            
            let (_, _) = try await URLSession.shared.data(for: request)
        } catch {
            print("Error syncing subscription: \(error)")
        }
    }
    
    /// 更新已购买产品列表
    private func updatePurchasedProducts() async {
        var purchased: Set<String> = []
        
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result {
                purchased.insert(transaction.productID)
            }
        }
        
        await MainActor.run {
            self.purchasedProductIDs = purchased
        }
    }
}
