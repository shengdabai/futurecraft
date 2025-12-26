import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var regionManager: RegionManager
    
    var body: some View {
        List {
            if let user = appState.currentUser {
                Section {
                    HStack {
                        Circle()
                            .fill(Color.gray)
                            .frame(width: 60, height: 60)
                        VStack(alignment: .leading) {
                            Text(user.username ?? "User")
                                .font(.title2)
                                .bold()
                            Text("ID: \(user.id)")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }
                    .padding(.vertical)
                }
                
                Section(header: Text("Status")) {
                    HStack {
                        Text("Subscription")
                        Spacer()
                        Text(user.subscriptionTier)
                            .foregroundColor(user.subscriptionTier == "PRO" ? .purple : .gray)
                    }
                    
                    HStack {
                        Text("Credits")
                        Spacer()
                        Text("\(user.creditBalance)")
                    }
                }
                
                Section(header: Text("Settings")) {
                    NavigationLink("Region: \(user.region)", destination: EmptyView()) // Placeholder
                    NavigationLink("Privacy", destination: EmptyView())
                }
                
                Section {
                    Button("Logout") {
                        appState.logout()
                        // Reset region if needed or just go back to login
                    }
                    .foregroundColor(.red)
                }
            } else {
                Text("Not logged in")
            }
        }
        .navigationTitle("Profile")
    }
}
