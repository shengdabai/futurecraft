import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationView {
                FeedView()
            }
            .tabItem {
                Label("Community", systemImage: "bubble.left.and.bubble.right.fill")
            }
            
            NavigationView {
                RPGHomeView()
            }
            .tabItem {
                Label("Career RPG", systemImage: "gamecontroller.fill")
            }
            
            NavigationView {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.crop.circle.fill")
            }
        }
        .accentColor(.purple)
    }
}
