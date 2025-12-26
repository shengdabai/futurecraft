import SwiftUI

struct SoulScanView: View {
    @State private var major: String = ""
    @State private var hobbies: String = ""
    @State private var talent: String = ""
    @State private var isAnalyzing: Bool = false
    @EnvironmentObject var appState: AppState
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        Form {
            Section(header: Text("Identify Protocol")) {
                TextField("Major / Specialization", text: $major)
                TextField("Hobbies & Interests", text: $hobbies)
                TextField("Hidden Talent", text: $talent)
            }
            
            Section {
                Button(action: startScan) {
                    if isAnalyzing {
                        HStack {
                            ProgressView()
                            Text("AI Analysis in Progress...")
                        }
                    } else {
                        Text("Initiate Soul Scan")
                    }
                }
                .disabled(major.isEmpty || isAnalyzing)
            }
        }
        .navigationTitle("Soul Scan")
    }
    
    func startScan() {
        isAnalyzing = true
        // Simulate API call delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            // Mock Result
            let newProfile = RPGProfile(
                playerName: appState.currentUser?.username ?? "Player",
                major: major,
                hobbies: [hobbies],
                hiddenTalent: talent,
                archetype: "Cyber Mystic",
                stats: RPGStats(intelligence: 85, creativity: 90, charisma: 60, stamina: 70, tech: 80)
            )
            
            var user = appState.currentUser
            user?.rpgProfile = newProfile
            appState.currentUser = user
            
            isAnalyzing = false
            presentationMode.wrappedValue.dismiss()
        }
    }
}
