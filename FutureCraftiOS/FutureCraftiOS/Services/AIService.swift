import Foundation

/// AI 服务
/// 所有 AI 请求通过后端代理，不在客户端持有 API Key
class AIService {
    static let shared = AIService()
    
    private init() {}
    
    // MARK: - Soul Scan (RPG 角色分析)
    
    /// 执行灵魂扫描，生成 RPG 属性和职业推荐
    func performSoulScan(profile: RPGProfile, language: String) async throws -> SoulScanResult {
        let body: [String: Any] = [
            "playerName": profile.playerName,
            "major": profile.major,
            "hobbies": profile.hobbies,
            "hiddenTalent": profile.hiddenTalent,
            "language": language
        ]
        
        return try await request(endpoint: "/ai/soul-scan", body: body)
    }
    
    // MARK: - Career Chat
    
    /// AI 职业导师对话
    func chat(message: String, context: ChatContext) async throws -> ChatResponse {
        let body: [String: Any] = [
            "message": message,
            "jobTitle": context.jobTitle,
            "isBossMode": context.isBossMode,
            "history": context.history.map { ["role": $0.role, "content": $0.content] },
            "language": context.language
        ]
        
        return try await request(endpoint: "/ai/chat", body: body)
    }
    
    // MARK: - Simulation
    
    /// 生成模拟场景
    func generateSimulation(jobTitle: String, language: String) async throws -> SimulationScenario {
        let body: [String: Any] = [
            "jobTitle": jobTitle,
            "language": language
        ]
        
        return try await request(endpoint: "/ai/simulation", body: body)
    }
    
    /// 评估模拟选择
    func evaluateChoice(jobTitle: String, scenario: String, choice: String, language: String) async throws -> SimulationResult {
        let body: [String: Any] = [
            "jobTitle": jobTitle,
            "scenario": scenario,
            "choice": choice,
            "language": language
        ]
        
        return try await request(endpoint: "/ai/simulation/evaluate", body: body)
    }
    
    // MARK: - Skill Tree
    
    /// 生成技能树资源
    func generateSkillTree(jobTitle: String, language: String) async throws -> [SkillResource] {
        let body: [String: Any] = [
            "jobTitle": jobTitle,
            "language": language
        ]
        
        return try await request(endpoint: "/ai/skill-tree", body: body)
    }
    
    // MARK: - Private
    
    private func request<T: Decodable>(endpoint: String, body: [String: Any]) async throws -> T {
        guard let region = RegionManager().selectedRegion else {
            throw AIError.noRegion
        }
        
        guard let url = URL(string: "\(region.baseURL)\(endpoint)") else {
            throw AIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 60 // AI 请求可能较慢
        
        // 添加认证 Token
        if let accessToken = KeychainManager.shared.getAccessToken() {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIError.networkError
        }
        
        guard (200...299).contains(httpResponse.statusCode) else {
            if httpResponse.statusCode == 401 {
                throw AIError.unauthorized
            }
            if httpResponse.statusCode == 429 {
                throw AIError.rateLimited
            }
            throw AIError.serverError(httpResponse.statusCode)
        }
        
        do {
            let decoded = try JSONDecoder().decode(T.self, from: data)
            return decoded
        } catch {
            throw AIError.decodingError(error)
        }
    }
}

// MARK: - Models

struct SoulScanResult: Codable {
    let stats: RPGStats
    let archetype: String
    let careers: [CareerPath]
}

struct CareerPath: Codable, Identifiable {
    let id: String
    let category: String
    let jobs: [JobOption]
}

struct JobOption: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let skills: [String]
    let salary: String
    let dayInLife: String
    let pitfalls: String
    let matchScore: Int
}

struct ChatContext {
    let jobTitle: String
    let isBossMode: Bool
    let history: [ChatMessage]
    let language: String
}

struct ChatMessage {
    let role: String // "user" or "assistant"
    let content: String
}

struct ChatResponse: Codable {
    let message: String
}

struct SimulationScenario: Codable {
    let scenario: String
    let options: [SimulationOption]
}

struct SimulationOption: Codable, Identifiable {
    let id: String
    let text: String
}

struct SimulationResult: Codable {
    let outcome: String
    let score: Int
    let feedback: String
}

struct SkillResource: Codable, Identifiable {
    let id: String
    let title: String
    let type: String // "Book", "Video", "GitHub", "Mission"
    let description: String
    let xp: Int
    let url: String?
}

// MARK: - Errors

enum AIError: Error, LocalizedError {
    case noRegion
    case invalidURL
    case networkError
    case unauthorized
    case rateLimited
    case serverError(Int)
    case decodingError(Error)
    
    var errorDescription: String? {
        switch self {
        case .noRegion:
            return "Please select a region first"
        case .invalidURL:
            return "Invalid API URL"
        case .networkError:
            return "Network error occurred"
        case .unauthorized:
            return "Please login again"
        case .rateLimited:
            return "Too many requests, please wait"
        case .serverError(let code):
            return "Server error: \(code)"
        case .decodingError(let error):
            return "Data error: \(error.localizedDescription)"
        }
    }
}
