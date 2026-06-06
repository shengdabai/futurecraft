import SwiftUI

struct SimulationGameView: View {
    let scenarioTitle: String
    @State private var currentStep: Int = 0
    @State private var score: Int = 100
    @State private var gameOutcome: String? = nil
    
    // Mock Scenario Data
    struct ScenarioStep {
        let text: String
        let options: [Option]
    }
    
    struct Option {
        let text: String
        let effect: Int // Score impact
        let response: String
    }
    
    let scenarioSteps = [
        ScenarioStep(
            text: "It's your first day as a Data Mercenary. Your client asks you to decrypt a secure drive found in a rival corp's trash. It might contain illegal data. What do you do?",
            options: [
                Option(text: "Decrypt it immediately. The contract is king.", effect: 10, response: "Client is impressed by your speed. But you feel a bit dirty."),
                Option(text: "Scan it for malware first, then decrypt.", effect: 5, response: "Smart move. You found a tracker and disabled it. Client is safe."),
                Option(text: "Refuse. It violates the unspoken code.", effect: -20, response: "Client is furious. You lose reputation, but your conscience is clear.")
            ]
        ),
        ScenarioStep(
            text: "A rival hacker contacts you. They offer double the pay to leak the data to them instead.",
            options: [
                Option(text: "Take the double pay.", effect: -50, response: "You get paid, but your original client puts a bounty on you. GAME OVER."),
                Option(text: "Stick to the original contract.", effect: 20, response: "Loyalty pays off. You gain a long-term contact."),
                Option(text: "Feed the rival fake data.", effect: 30, response: "Brilliant. You get paid by both and the rival is confused.")
            ]
        )
    ]
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(gradient: Gradient(colors: [.black, .purple.opacity(0.3)]), startPoint: .top, endPoint: .bottom)
                .edgesIgnoringSafeArea(.all)
            
            VStack {
                // Header
                HStack {
                    Text(scenarioTitle)
                        .font(.headline)
                        .foregroundColor(.white)
                    Spacer()
                    Text("Score: \(score)")
                        .font(.monospacedDigit(.body)())
                        .foregroundColor(score > 50 ? .green : .red)
                }
                .padding()
                
                Spacer()
                
                if let outcome = gameOutcome {
                    // Game Over / Result
                    VStack(spacing: 20) {
                        Image(systemName: score > 0 ? "trophy.fill" : "hand.thumbsdown.fill")
                            .font(.system(size: 60))
                            .foregroundColor(score > 0 ? .yellow : .gray)
                        
                        Text(outcome)
                            .font(.title)
                            .bold()
                            .foregroundColor(.white)
                        
                        Text("Final Score: \(score)")
                            .foregroundColor(.gray)
                        
                        if score > 50 {
                            ConfettiView()
                        }
                    }
                } else {
                    // Game Step
                    VStack(spacing: 24) {
                        TypewriterText(text: scenarioSteps[currentStep].text)
                            .foregroundColor(.white)
                            .font(.title3)
                            .padding()
                            .background(Color.white.opacity(0.1))
                            .cornerRadius(12)
                            .frame(maxWidth: .infinity)
                        
                        ForEach(scenarioSteps[currentStep].options, id: \.text) { option in
                            Button(action: {
                                chooseOption(option)
                            }) {
                                Text(option.text)
                                    .fontWeight(.medium)
                                    .foregroundColor(.white)
                                    .padding()
                                    .frame(maxWidth: .infinity)
                                    .background(LinearGradient(gradient: Gradient(colors: [.blue.opacity(0.6), .purple.opacity(0.6)]), startPoint: .leading, endPoint: .trailing))
                                    .cornerRadius(25)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 25)
                                            .stroke(Color.white.opacity(0.5), lineWidth: 1)
                                    )
                            }
                        }
                    }
                    .padding()
                }
                
                Spacer()
            }
        }
    }
    
    func chooseOption(_ option: Option) {
        score += option.effect
        
        // Simple check for Game Over based on the hardcoded scenario
        if option.text.contains("Take the double pay") {
            gameOutcome = "MISSION FAILED"
            score = 0
            return
        }
        
        if currentStep < scenarioSteps.count - 1 {
            currentStep += 1
        } else {
            gameOutcome = "MISSION ACCOMPLISHED"
        }
    }
}
