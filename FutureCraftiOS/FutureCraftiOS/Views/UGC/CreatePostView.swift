import SwiftUI

struct CreatePostView: View {
    @Environment(\.presentationMode) var presentationMode
    @State private var text: String = "Share your thoughts on FutureCraft..."
    @State private var selectedTopic: Int = 0
    
    // Mock Topics
    let topics = ["General", "Career Advice", "Tech Trends", "Simulations"]
    
    var body: some View {
        NavigationView {
            VStack {
                // Topic Selector
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(0..<topics.count, id: \.self) { index in
                            Text(topics[index])
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                                .background(selectedTopic == index ? Color.blue : Color.white.opacity(0.1))
                                .foregroundColor(.white)
                                .cornerRadius(20)
                                .onTapGesture {
                                    selectedTopic = index
                                }
                        }
                    }
                    .padding()
                }
                
                // Text Editor
                TextEditor(text: $text)
                    .foregroundColor(text == "Share your thoughts on FutureCraft..." ? .gray : .white)
                    .background(Color.clear) // TextEditor has issues with background usually
                    .padding()
                    .onTapGesture {
                        if text == "Share your thoughts on FutureCraft..." {
                            text = ""
                        }
                    }
                
                Spacer()
                
                // Media Toolbar
                HStack(spacing: 20) {
                    Button(action: {
                        // Open Photo Picker stub
                    }) {
                        Image(systemName: "photo")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                    
                    Button(action: {
                        // Open Camera stub
                    }) {
                        Image(systemName: "camera")
                            .font(.title2)
                            .foregroundColor(.blue)
                    }
                    
                    Spacer()
                    
                    Text("0/500")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                .padding()
                .background(Color.white.opacity(0.05))
            }
            .background(Color.black.edgesIgnoringSafeArea(.all))
            .navigationTitle("New Post")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("Post") {
                    // Submit post logic
                    presentationMode.wrappedValue.dismiss()
                }
                .disabled(text.isEmpty || text == "Share your thoughts on FutureCraft...")
            )
        }
    }
}
