import Foundation
import Swift
import Combine

/// App 全局状态管理
class AppState: ObservableObject {
    @Published var currentUser: User?
    @Published var isAuthenticated: Bool = false
    @Published var isLoading: Bool = false
    @Published var isRestoringSession: Bool = true
    
    let regionManager = RegionManager()
    
    init() {
        // 启动时尝试恢复会话
        Task {
            await restoreSessionIfNeeded()
        }
    }
    
    /// 尝试恢复已保存的会话
    @MainActor
    func restoreSessionIfNeeded() async {
        // 只有在已选择 region 时才尝试恢复
        guard let region = regionManager.selectedRegion else {
            isRestoringSession = false
            return
        }
        
        isRestoringSession = true
        
        if let user = await AuthManager.shared.tryRestoreSession(region: region) {
            self.currentUser = user
            self.isAuthenticated = true
        }
        
        isRestoringSession = false
    }
    
    /// 登录
    func login(user: User) {
        self.currentUser = user
        self.isAuthenticated = true
    }
    
    /// 登出
    func logout() {
        AuthManager.shared.logout()
        self.currentUser = nil
        self.isAuthenticated = false
    }
    
    /// 获取当前 Access Token
    func getAccessToken() -> String? {
        return KeychainManager.shared.getAccessToken()
    }
}
