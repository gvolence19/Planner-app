import SwiftUI

// MARK: - Clean Calendar View (No Black Background)
// Strips out the background from PageFlipCalendarView for use in planner pages

struct CleanCalendarView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var dataManager = DataManager.shared
    @State private var currentDate = Date()
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Just the content, no background
            TabView(selection: $currentDate) {
                ForEach(generateDates(), id: \.self) { date in
                    DayPageView(date: date)
                        .tag(date)
                        .environmentObject(themeManager)
                        .background(Color.white)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .background(Color.white)
        }
        .background(Color.white)
    }
    
    private func generateDates() -> [Date] {
        let calendar = Calendar.current
        let today = Date()
        var dates: [Date] = []
        
        // Generate 60 days (30 before, current, 29 after)
        for i in -30...29 {
            if let date = calendar.date(byAdding: .day, value: i, to: today) {
                dates.append(date)
            }
        }
        
        return dates
    }
}
