import Foundation
import Security

/// Keychain 安全存储管理器
/// 用于安全存储 Token、用户凭证等敏感信息
class KeychainManager {
    static let shared = KeychainManager()
    
    private let service = "com.zturns.futurecraft"
    
    private init() {}
    
    // MARK: - Token Keys
    private enum Keys {
        static let accessToken = "accessToken"
        static let refreshToken = "refreshToken"
        static let userId = "userId"
    }
    
    // MARK: - Save
    
    /// 保存 Access Token
    func saveAccessToken(_ token: String) -> Bool {
        return save(key: Keys.accessToken, value: token)
    }
    
    /// 保存 Refresh Token
    func saveRefreshToken(_ token: String) -> Bool {
        return save(key: Keys.refreshToken, value: token)
    }
    
    /// 保存用户 ID
    func saveUserId(_ userId: String) -> Bool {
        return save(key: Keys.userId, value: userId)
    }
    
    // MARK: - Read
    
    /// 获取 Access Token
    func getAccessToken() -> String? {
        return read(key: Keys.accessToken)
    }
    
    /// 获取 Refresh Token
    func getRefreshToken() -> String? {
        return read(key: Keys.refreshToken)
    }
    
    /// 获取用户 ID
    func getUserId() -> String? {
        return read(key: Keys.userId)
    }
    
    // MARK: - Delete
    
    /// 清除所有认证信息（登出时调用）
    func clearAllTokens() {
        delete(key: Keys.accessToken)
        delete(key: Keys.refreshToken)
        delete(key: Keys.userId)
    }
    
    // MARK: - Private Methods
    
    private func save(key: String, value: String) -> Bool {
        guard let data = value.data(using: .utf8) else { return false }
        
        // 先删除旧值
        delete(key: key)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }
    
    private func read(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let string = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return string
    }
    
    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
}

