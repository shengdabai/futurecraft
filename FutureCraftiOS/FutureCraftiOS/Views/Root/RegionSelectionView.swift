import SwiftUI

struct RegionSelectionView: View {
    @EnvironmentObject var regionManager: RegionManager
    
    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 40) {
                // Logo Placeholder
                Circle()
                    .fill(LinearGradient(gradient: Gradient(colors: [.blue, .purple]), startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 120, height: 120)
                    .overlay(Text("FC").font(.system(size: 40, weight: .bold)).foregroundColor(.white))
                    .shadow(color: .purple.opacity(0.5), radius: 20, x: 0, y: 0)
                
                VStack(spacing: 16) {
                    Text("FUTURE CRAFT")
                        .font(.largeTitle)
                        .fontWeight(.heavy)
                        .foregroundColor(.white)
                    
                    Text("Select Your Region / 请选择地区")
                        .font(.body)
                        .foregroundColor(.gray)
                }
                
                VStack(spacing: 20) {
                    Button(action: {
                        regionManager.selectRegion(.global)
                    }) {
                        HStack {
                            Text("🌏")
                                .font(.title)
                            VStack(alignment: .leading) {
                                Text("Global / International")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                Text("Apple / Google / Email")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                        .padding()
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                    }
                    
                    Button(action: {
                        regionManager.selectRegion(.china)
                    }) {
                        HStack {
                            Text("🇨🇳")
                                .font(.title)
                            VStack(alignment: .leading) {
                                Text("China Mainland / 中国大陆")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                Text("WeChat / Apple / Mobile")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                        .padding()
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                    }
                }
                .padding(.horizontal)
                
                Spacer()
            }
            .padding(.top, 60)
        }
    }
}
