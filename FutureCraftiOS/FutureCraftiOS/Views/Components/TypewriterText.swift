import SwiftUI

struct TypewriterText: View {
    let text: String
    let speed: TimeInterval = 0.05
    
    @State private var displayedText: String = ""
    @State private var timer: Timer?
    
    var body: some View {
        Text(displayedText)
            .font(.body)
            .onAppear {
                startTyping()
            }
            .onDisappear {
                timer?.invalidate()
            }
    }
    
    func startTyping() {
        displayedText = ""
        var currentIndex = 0
        let chars = Array(text)
        
        timer = Timer.scheduledTimer(withTimeInterval: speed, repeats: true) { t in
            if currentIndex < chars.count {
                displayedText.append(chars[currentIndex])
                currentIndex += 1
            } else {
                t.invalidate()
            }
        }
    }
}
