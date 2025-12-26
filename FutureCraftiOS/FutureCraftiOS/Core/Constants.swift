import Foundation

struct Constants {
    struct API {
        static let globalBaseURL = "https://api.futurecraft.world"
        static let chinaBaseURL = "https://api.futurecraft.cn"
        static let timeout: TimeInterval = 30.0
    }
    
    struct Keys {
        static let region = "selectedRegion"
        static let guestId = "guestId"
        static let accessToken = "accessToken"
        static let refreshToken = "refreshToken"
    }
}

enum Region: String, CaseIterable, Codable {
    case global = "GLOBAL"
    case china = "CN"
    
    var baseURL: String {
        switch self {
        case .global: return Constants.API.globalBaseURL
        case .china: return Constants.API.chinaBaseURL
        }
    }
    
    var displayName: String {
        switch self {
        case .global: return "Global / International"
        case .china: return "China Mainland / 中国大陆"
        }
    }
}
