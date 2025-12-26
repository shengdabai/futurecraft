import Foundation
import Combine

class RegionManager: ObservableObject {
    @Published var selectedRegion: Region? {
        didSet {
            if let region = selectedRegion {
                UserDefaults.standard.set(region.rawValue, forKey: Constants.Keys.region)
                // In a real app, we might need to reset networking stack or clear tokens here
            }
        }
    }
    
    init() {
        if let savedRegion = UserDefaults.standard.string(forKey: Constants.Keys.region),
           let region = Region(rawValue: savedRegion) {
            self.selectedRegion = region
        }
    }
    
    func selectRegion(_ region: Region) {
        self.selectedRegion = region
    }
}
