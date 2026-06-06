import SwiftUI

struct PostDetailView: View {
    let post: Post
    @State private var comments: [Comment] = []
    @State private var newCommentText: String = ""
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        VStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Author Header
                    HStack {
                        Circle()
                            .fill(Color.gray)
                            .frame(width: 50, height: 50)
                            .overlay(Text(post.author.nickname?.prefix(1) ?? "?").foregroundColor(.white))
                        
                        VStack(alignment: .leading) {
                            Text(post.author.nickname ?? "Unknown")
                                .font(.headline)
                                .foregroundColor(.white)
                            Text(post.createdAt) // Should format date
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                    }
                    
                    // Post Content
                    Text(post.text)
                        .font(.body)
                        .foregroundColor(.white)
                        .lineSpacing(6)
                    
                    // Stats
                    HStack(spacing: 20) {
                        Label("\(post.likeCount)", systemImage: "heart")
                        Label("\(post.commentCount)", systemImage: "bubble.right")
                        Spacer()
                    }
                    .foregroundColor(.gray)
                    .padding(.vertical)
                    
                    Divider().background(Color.white.opacity(0.2))
                    
                    // Comments Section
                    Text("Comments")
                        .font(.headline)
                        .foregroundColor(.gray)
                        .padding(.top)
                    
                    if comments.isEmpty {
                        Text("No comments yet. Be the first to share your thoughts!")
                            .font(.caption)
                            .foregroundColor(.gray)
                            .padding(.top)
                    } else {
                        ForEach(comments) { comment in
                            CommentRow(comment: comment)
                        }
                    }
                }
                .padding()
            }
            
            // Comment Input
            VStack {
                Divider().background(Color.white.opacity(0.2))
                HStack {
                    TextField("Write a comment...", text: $newCommentText)
                        .padding(10)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(20)
                        .foregroundColor(.white)
                    
                    Button(action: postComment) {
                        Image(systemName: "paperplane.fill")
                            .font(.title2)
                            .foregroundColor(newCommentText.isEmpty ? .gray : .blue)
                    }
                    .disabled(newCommentText.isEmpty)
                }
                .padding()
            }
            .background(Color.black.opacity(0.8))
        }
        .navigationBarTitleDisplayMode(.inline)
        .background(Color.black.edgesIgnoringSafeArea(.all))
        .onAppear {
            loadComments()
        }
    }
    
    func loadComments() {
        // Mock Comments
        let author = UserAuthor(id: "2", nickname: "TechGuru", avatarUrl: nil)
        comments = [
            Comment(id: "c1", author: author, text: "Totally agree! The simulation matches real world scenarios perfectly.", parentId: nil, createdAt: "2025-12-18T12:00:00Z", replies: [])
        ]
    }
    
    func postComment() {
        guard !newCommentText.isEmpty else { return }
        
        let newComment = Comment(
            id: UUID().uuidString,
            author: UserAuthor(id: "me", nickname: "Me", avatarUrl: nil),
            text: newCommentText,
            parentId: nil,
            createdAt: "Just now",
            replies: []
        )
        
        withAnimation {
            comments.insert(newComment, at: 0)
            newCommentText = ""
        }
    }
}

struct CommentRow: View {
    let comment: Comment
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Circle()
                .fill(Color.gray)
                .frame(width: 30, height: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(comment.author.nickname ?? "User")
                        .font(.subheadline)
                        .bold()
                        .foregroundColor(.white)
                    Spacer()
                    Text("1h ago") 
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
                
                Text(comment.text)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.9))
            }
        }
        .padding(.vertical, 8)
    }
}
