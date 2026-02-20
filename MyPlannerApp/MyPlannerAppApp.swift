import SwiftUI
import UserNotifications

@main
struct MyPlannerAppApp: App {
    @StateObject private var dataManager = DataManager.shared
    @StateObject private var themeManager = ThemeManager.shared
    @AppStorage("isDarkMode") private var isDarkMode = false
    
    var body: some Scene {
        WindowGroup {
            ThemedContentView()
                .environmentObject(dataManager)
                .environmentObject(themeManager)
                .preferredColorScheme(isDarkMode ? .dark : .light)
                .onAppear {
                    setupApp()
                }
        }
    }
    
    private func setupApp() {
        // Request notification permissions
        requestNotificationPermissions()
        
        // Configure appearance
        configureAppearance()
    }
    
    private func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                print("Notification permission granted")
            } else if let error = error {
                print("Notification permission error: \(error.localizedDescription)")
            }
        }
    }
    
    private func configureAppearance() {
        // Configure navigation bar appearance
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
    }
}

// Wrapper that provides theme to child views
struct ThemedContentView: View {
    @EnvironmentObject var themeManager: ThemeManager
    
    var body: some View {
        PlannerContainer()
            .tint(themeManager.currentTheme.accentColor.color)
            .id(themeManager.currentTheme.id) // Force rebuild when theme changes
    }
}
