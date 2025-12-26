import SwiftUI

@main
struct FutureCraftApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .environmentObject(appState.regionManager)
        }
    }
}
