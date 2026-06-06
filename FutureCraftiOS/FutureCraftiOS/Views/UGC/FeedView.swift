import SwiftUI

struct FeedView: View {
    @State private var selectedTab: Int = 0
    @State private var posts: [Post] = []
    @State private var showCreatePost: Bool = false
    
    var body: some View {
        VStack {
            // Header
            Picker("", selection: $selectedTab) {
                Text("Latest").tag(0)
                Text("Featured").tag(1)
                Text("Topics").tag(2)
            }
            .pickerStyle(SegmentedPickerStyle())
            .padding()
            
            // Feed
            ScrollView {
                LazyVStack(spacing: 16) {
                    if posts.isEmpty {
                        Text("Loading community feed...")
                            .foregroundColor(.gray)
                            .padding(.top, 40)
                    } else {
                        ForEach(posts) { post in
                            NavigationLink(destination: PostDetailView(post: post)) {
                                PostCardView(post: post)
                            }
                        }
                    }
                }
                .padding()
            }
        }
        .navigationTitle("Community")
        .background(Color.black.edgesIgnoringSafeArea(.all))
        .navigationBarItems(trailing: Button(action: {
            showCreatePost = true
        }) {
            Image(systemName: "plus.circle.fill")
                .font(.title2)
                .foregroundColor(.purple)
        })
        .sheet(isPresented: $showCreatePost) {
            CreatePostView()
        }
        .onAppear {
            loadPosts()
        }
    }
    
    func loadPosts() {
        // Mock Data
        let author = UserAuthor(id: "1", nickname: "CyberPunk_007", avatarUrl: nil)
        let post1 = Post(id: "p1", author: author, text: "Just finished the Data Mercenary simulation! It was intense. The final boss really grilled me on ethics.", media: [], likeCount: 24, commentCount: 5, createdAt: "2025-12-18T10:00:00Z", status: "PUBLISHED")
        let post2 = Post(id: "p2", author: UserAuthor(id: "2", nickname: "NeonArtist", avatarUrl: nil), text: "Anyone else exploring the Bio-Hacker path? The biology prerequisites are tougher than I thought.", media: [], likeCount: 12, commentCount: 2, createdAt: "2025-12-18T09:30:00Z", status: "PUBLISHED")
        self.posts = [post1, post2]
    }
}

struct PostCardView: View {
    let post: Post
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Circle()
                    .fill(Color.gray)
                    .frame(width: 40, height: 40)
                    .overlay(Text(post.author.nickname?.prefix(1) ?? "?").foregroundColor(.white))
                
                VStack(alignment: .leading) {
                    Text(post.author.nickname ?? "Unknown")
                        .font(.headline)
                        .foregroundColor(.white)
                    Text("2 hours ago")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
                Image(systemName: "ellipsis")
                    .foregroundColor(.gray)
            }
            
            Text(post.text)
                .font(.body)
                .foregroundColor(.white)
                .lineLimit(3)
            
            HStack(spacing: 20) {
                HStack {
                    Image(systemName: "heart")
                    Text("\(post.likeCount)")
                }
                HStack {
                    Image(systemName: "bubble.right")
                    Text("\(post.commentCount)")
                }
                Spacer()
                Image(systemName: "bookmark")
            }
            .foregroundColor(.gray)
            .padding(.top, 4)
        }
        .padding()
        .background(LinearGradient(gradient: Gradient(colors: [Color.white.opacity(0.1), Color.white.opacity(0.05)]), startPoint: .topLeading, endPoint: .bottomTrailing))
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
    }
}
