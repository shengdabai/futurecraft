import Foundation

struct Post: Codable, Identifiable {
    let id: String
    let author: UserAuthor
    let text: String
    let media: [PostMedia]
    let likeCount: Int
    let commentCount: Int
    let createdAt: String
    let status: String
    
    // For local state
    var isLiked: Bool?
    var isBookmarked: Bool?
}

struct UserAuthor: Codable {
    let id: String
    let nickname: String?
    let avatarUrl: String?
}

struct PostMedia: Codable, Identifiable {
    let id: String
    let type: String // "IMAGE", "VIDEO"
    let url: String
    let width: Int?
    let height: Int?
}

struct Comment: Codable, Identifiable {
    let id: String
    let author: UserAuthor
    let text: String
    let parentId: String?
    let createdAt: String
    let replies: [Comment]?
}

struct Topic: Codable, Identifiable {
    let id: String
    let name: String
    let slug: String
}
