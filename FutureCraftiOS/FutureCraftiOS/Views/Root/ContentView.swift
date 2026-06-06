import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var regionManager: RegionManager
    
    var body: some View {
        Group {
            if appState.isRestoringSession {
                // 正在恢复会话，显示启动画面
                LaunchScreenView()
            } else if regionManager.selectedRegion == nil {
                // 未选择地区
                RegionSelectionView()
            } else if !appState.isAuthenticated {
                // 未登录
                LoginView()
            } else {
                // 已登录，显示主界面
                MainTabView()
            }
        }
        .preferredColorScheme(.dark)
        .animation(.easeInOut(duration: 0.3), value: appState.isAuthenticated)
        .animation(.easeInOut(duration: 0.3), value: regionManager.selectedRegion != nil)
    }
}

/// 启动画面
struct LaunchScreenView: View {
    @State private var isAnimating = false
    
    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 20) {
                // Logo with animation
                Circle()
                    .fill(LinearGradient(
                        gradient: Gradient(colors: [.blue, .purple]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(width: 120, height: 120)
                    .overlay(
                        Text("FC")
                            .font(.system(size: 44, weight: .bold))
                            .foregroundColor(.white)
                    )
                    .shadow(color: .purple.opacity(0.6), radius: isAnimating ? 30 : 15)
                    .scaleEffect(isAnimating ? 1.05 : 1.0)
                
                Text("FutureCraft")
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.2)
                    .padding(.top, 30)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
                isAnimating = true
            }
        }
    }
}
