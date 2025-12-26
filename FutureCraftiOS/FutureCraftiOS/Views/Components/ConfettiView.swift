import SwiftUI

struct ConfettiView: View {
    @State private var confetti: [Confetti] = []
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                ForEach(confetti) { particle in
                    Circle()
                        .fill(particle.color)
                        .frame(width: particle.size, height: particle.size)
                        .position(particle.position)
                        .opacity(particle.opacity)
                }
            }
            .onAppear {
                createConfetti(in: geometry.size)
            }
        }
        .ignoresSafeArea()
    }
    
    func createConfetti(in size: CGSize) {
        for _ in 0..<50 {
            confetti.append(Confetti(
                id: UUID(),
                position: CGPoint(x: CGFloat.random(in: 0...size.width), y: -10),
                color: [.red, .blue, .green, .yellow, .purple].randomElement()!,
                size: CGFloat.random(in: 5...10),
                opacity: 1.0
            ))
        }
        
        withAnimation(.easeOut(duration: 2.0)) {
            // Animate falling
        }
    }
}

struct Confetti: Identifiable {
    let id: UUID
    var position: CGPoint
    let color: Color
    let size: CGFloat
    var opacity: Double
}
