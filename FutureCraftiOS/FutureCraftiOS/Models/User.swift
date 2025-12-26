import Foundation

struct User: Codable, Identifiable {
    let id: String
    let isGuest: Bool
    let region: String
    let username: String?
    let avatarUrl: String?
    let creditBalance: Int
    let subscriptionTier: String // "FREE", "PRO"
    
    // RPG Profile specific
    var rpgProfile: RPGProfile?
}

struct RPGProfile: Codable {
    let playerName: String
    let major: String
    let hobbies: [String]
    let hiddenTalent: String
    let archetype: String?
    let stats: RPGStats?
}

struct RPGStats: Codable {
    let intelligence: Int
    let creativity: Int
    let charisma: Int
    let stamina: Int
    let tech: Int
}
