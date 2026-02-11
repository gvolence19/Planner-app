import SwiftUI

struct ContentView: View {
    @StateObject private var dataManager = DataManager.shared
    @Environment(\.appTheme) var theme
    @AppStorage("isDarkMode") private var isDarkMode = false
    @State private var selectedTab: ViewType = .list
    @State private var showingAddTask = false
    @State private var showingSettings = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header
                headerView
                
                // Main Content
                ZStack {
                    switch selectedTab {
                    case .list:
                        TaskListView()
                    case .calendar:
                        CalendarView()
                    case .grocery:
                        GroceryListView()
                    case .meals:
                        if dataManager.isPremium {
                            MealsView()
                        } else {
                            PremiumLockedView(feature: "Meal Planning")
                        }
                    case .sleep:
                        if dataManager.isPremium {
                            SleepTrackingView()
                        } else {
                            PremiumLockedView(feature: "Sleep Tracking")
                        }
                    case .water:
                        if dataManager.isPremium {
                            WaterTrackerView()
                        } else {
                            PremiumLockedView(feature: "Water Tracker")
                        }
                    case .events:
                        EventsAndMilestonesView()
                    case .aiAssistant:
                        if dataManager.isPremium {
                            AIAssistantView()
                        } else {
                            PremiumLockedView(feature: "AI Assistant")
                        }
                    }
                }
                
                // Bottom Tab Bar
                ModernTabBar(selectedTab: $selectedTab, isPremium: dataManager.isPremium)
                    .padding(.horizontal, 8)
            }
            .navigationBarHidden(true)
        }
        .preferredColorScheme(isDarkMode ? .dark : .light)
        .sheet(isPresented: $showingAddTask) {
            AddTaskView()
        }
        .sheet(isPresented: $showingSettings) {
            SettingsView()
        }
    }
    
    // MARK: - Header View
    private var headerView: some View {
        HStack {
            // App Title
            VStack(alignment: .leading, spacing: 4) {
                Text("My Planner")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(theme.primaryColor.color)
                
                Text(todayDateString())
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            // Action Buttons
            HStack(spacing: 12) {
                // Settings Button
                Button(action: { showingSettings = true }) {
                    Image(systemName: "gearshape")
                        .font(.system(size: 20))
                        .foregroundColor(theme.accentColor.color)
                        .frame(width: 44, height: 44)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 12)
        .background(Color(.systemBackground))
        .shadow(color: Color.black.opacity(0.05), radius: 2, y: 2)
    }
    
    // MARK: - Tab Bar
    private var tabBar: some View {
        HStack(spacing: 0) {
            ForEach(tabItems, id: \.self) { tab in
                tabButton(for: tab)
            }
        }
        .padding(.vertical, 8)
        .background(Color(.systemBackground))
        .shadow(color: Color.black.opacity(0.1), radius: 5, y: -2)
    }
    
    private var tabItems: [ViewType] {
        if dataManager.isPremium {
            return ViewType.allCases
        } else {
            return [.list, .calendar, .grocery]
        }
    }
    
    private func tabButton(for tab: ViewType) -> some View {
        Button(action: { selectedTab = tab }) {
            VStack(spacing: 4) {
                Image(systemName: tab.icon)
                    .font(.system(size: 22))
                    .foregroundColor(selectedTab == tab ? .accentColor : .gray)
                
                Text(tab.displayName)
                    .font(.system(size: 11))
                    .foregroundColor(selectedTab == tab ? .accentColor : .gray)
            }
            .frame(maxWidth: .infinity)
        }
    }
    
    // MARK: - Helper Methods
    private func todayDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: Date())
    }
}

// MARK: - Premium Locked View
struct PremiumLockedView: View {
    let feature: String
    @StateObject private var dataManager = DataManager.shared
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "lock.fill")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("\(feature) is a Premium Feature")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Upgrade to Premium to unlock this feature and many more!")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: {
                // Simulate premium purchase
                dataManager.isPremium = true
                dataManager.savePremiumStatus()
            }) {
                Text("Upgrade to Premium")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 30)
                    .padding(.vertical, 15)
                    .background(Color.accentColor)
                    .cornerRadius(10)
            }
            .padding(.top, 10)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemGroupedBackground))
    }
}

// MARK: - Preview
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(ThemeManager.shared)
    }
}
