import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @EnvironmentObject var appState: AppState
    @EnvironmentObject var regionManager: RegionManager
    @StateObject private var authManager = AuthManager.shared
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showError = false
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [Color.black, Color(red: 0.1, green: 0.05, blue: 0.2)]),
                startPoint: .top,
                endPoint: .bottom
            )
            .edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 30) {
                Spacer()
                
                // Logo
                Circle()
                    .fill(LinearGradient(
                        gradient: Gradient(colors: [.blue, .purple]),
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(width: 100, height: 100)
                    .overlay(
                        Text("FC")
                            .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.white)
                    )
                    .shadow(color: .purple.opacity(0.5), radius: 20)
                
                // Title
                VStack(spacing: 8) {
                    Text("FutureCraft")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text(regionManager.selectedRegion == .global ? "Craft Your Future Career" : "打造你的未来职业")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                // Login Buttons
                VStack(spacing: 16) {
                    // Sign in with Apple (Required for App Store)
                    SignInWithAppleButton(
                        onRequest: { request in
                            request.requestedScopes = [.email, .fullName]
                        },
                        onCompletion: { result in
                            handleAppleSignIn(result)
                        }
                    )
                    .signInWithAppleButtonStyle(.white)
                    .frame(height: 50)
                    .cornerRadius(10)
                    .padding(.horizontal)
                
                    // Guest Mode
                    Button(action: {
                        Task {
                            await loginAsGuest()
                        }
                    }) {
                        Text(regionManager.selectedRegion == .global ? "Continue as Guest" : "游客模式")
                            .font(.body)
                        .foregroundColor(.gray)
                    }
                    .disabled(isLoading)
                }
                .padding(.bottom, 50)
            }
            
            // Loading overlay
            if isLoading {
                Color.black.opacity(0.5)
                    .edgesIgnoringSafeArea(.all)
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.5)
            }
        }
        .alert("Login Error", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage ?? "An unknown error occurred")
        }
    }
    
    // MARK: - Actions
    
    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
                  let identityTokenData = credential.identityToken,
                  let identityToken = String(data: identityTokenData, encoding: .utf8),
                  let authCodeData = credential.authorizationCode,
                  let authCode = String(data: authCodeData, encoding: .utf8) else {
                showError(message: "Failed to get Apple credentials")
                return
            }
            
            let fullName: String?
            if let nameComponents = credential.fullName {
                fullName = [nameComponents.givenName, nameComponents.familyName]
                    .compactMap { $0 }
                    .joined(separator: " ")
            } else {
                fullName = nil
            }
            
            let appleResult = AppleLoginResult(
                identityToken: identityToken,
                authorizationCode: authCode,
                email: credential.email,
                fullName: fullName?.isEmpty == true ? nil : fullName,
                userIdentifier: credential.user
            )
            
            Task {
                await authenticateWithApple(appleResult)
            }
            
        case .failure(let error):
            // User cancelled is not an error to show
            if (error as NSError).code != ASAuthorizationError.canceled.rawValue {
                showError(message: error.localizedDescription)
            }
        }
    }
    
    private func authenticateWithApple(_ appleResult: AppleLoginResult) async {
        guard let region = regionManager.selectedRegion else { return }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            let authResponse = try await authManager.authenticateWithBackend(appleResult: appleResult, region: region)
            await MainActor.run {
                appState.login(user: authResponse.user)
            }
        } catch {
            await MainActor.run {
                showError(message: "Authentication failed: \(error.localizedDescription)")
            }
        }
    }
    
    private func loginAsGuest() async {
        guard let region = regionManager.selectedRegion else { return }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            let authResponse = try await authManager.loginAsGuest(region: region)
            await MainActor.run {
                appState.login(user: authResponse.user)
            }
        } catch {
            await MainActor.run {
                // Fallback: create local guest user for demo
                let guestUser = User(
                    id: UUID().uuidString,
                    isGuest: true,
                    region: region.rawValue,
                    username: "Guest",
                    avatarUrl: nil,
                    creditBalance: 0,
                    subscriptionTier: "FREE",
                    rpgProfile: nil
                )
                appState.login(user: guestUser)
            }
        }
    }
    
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}
