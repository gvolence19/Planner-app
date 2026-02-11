import SwiftUI

struct WidgetGalleryView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var dataManager = DataManager.shared
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                if !dataManager.isPremium {
                    // Premium Lock Banner
                    premiumBanner
                }
                
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "square.grid.2x2.fill")
                        .font(.system(size: 48))
                        .foregroundColor(theme.primaryColor.color)
                    
                    Text("Home Screen Widgets")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(theme.primaryColor.color)
                    
                    Text("Stay on top of your tasks without opening the app")
                        .font(.system(size: 16))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                .padding(.top)
                
                // Widget Previews
                VStack(spacing: 32) {
                    // Small Widget
                    widgetCard(
                        title: "Small Widget",
                        subtitle: "Task Count",
                        description: "See your daily task count at a glance",
                        size: .small
                    )
                    
                    // Medium Widget
                    widgetCard(
                        title: "Medium Widget",
                        subtitle: "Task List",
                        description: "View your top 3 tasks for today",
                        size: .medium
                    )
                    
                    // Large Widget
                    widgetCard(
                        title: "Large Widget",
                        subtitle: "Tasks & Events",
                        description: "See tasks and upcoming events together",
                        size: .large
                    )
                }
                .padding(.horizontal)
                
                // How to Add
                if dataManager.isPremium {
                    howToAddSection
                }
                
                Spacer(minLength: 32)
            }
        }
        .navigationTitle("Widgets")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private var premiumBanner: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Image(systemName: "lock.fill")
                    .font(.system(size: 24))
                    .foregroundColor(.white)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Premium Feature")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Unlock widgets to access your tasks from your home screen")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.9))
                }
                
                Spacer()
            }
            .padding()
            .background(
                LinearGradient(
                    colors: [theme.primaryColor.color, theme.secondaryColor.color],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(16)
            
            Button(action: {
                // Upgrade action
                dataManager.isPremium = true
            }) {
                Text("Upgrade to Premium")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(theme.primaryColor.color)
                    .cornerRadius(12)
            }
        }
        .padding(.horizontal)
    }
    
    private func widgetCard(title: String, subtitle: String, description: String, size: WidgetSize) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Title
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(theme.primaryColor.color)
                
                Text(subtitle)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary)
            }
            
            // Widget Preview
            widgetPreview(size: size)
                .opacity(dataManager.isPremium ? 1.0 : 0.5)
                .overlay {
                    if !dataManager.isPremium {
                        Image(systemName: "lock.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.white)
                            .shadow(radius: 4)
                    }
                }
            
            // Description
            Text(description)
                .font(.system(size: 14))
                .foregroundColor(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: theme.primaryColor.color.opacity(0.1), radius: 8, x: 0, y: 4)
    }
    
    @ViewBuilder
    private func widgetPreview(size: WidgetSize) -> some View {
        switch size {
        case .small:
            smallWidgetPreview
        case .medium:
            mediumWidgetPreview
        case .large:
            largeWidgetPreview
        }
    }
    
    private var smallWidgetPreview: some View {
        ZStack {
            LinearGradient(
                colors: [theme.primaryColor.color, theme.secondaryColor.color],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 8) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(.white)
                
                Text("5")
                    .font(.system(size: 36, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Tasks Today")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
            }
        }
        .frame(height: 160)
        .cornerRadius(20)
    }
    
    private var mediumWidgetPreview: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(theme.primaryColor.color)
                Text("Today's Tasks")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(theme.primaryColor.color)
                Spacer()
                Text("2/5")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal)
            .padding(.top, 12)
            .padding(.bottom, 8)
            
            Divider()
                .background(theme.primaryColor.color.opacity(0.2))
            
            // Tasks
            VStack(alignment: .leading, spacing: 8) {
                taskRow(title: "Buy groceries", completed: true)
                taskRow(title: "Finish report", completed: false)
                taskRow(title: "Call dentist", completed: false)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
        .frame(height: 160)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(20)
    }
    
    private var largeWidgetPreview: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Tasks Header
            HStack {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(theme.primaryColor.color)
                Text("Today's Tasks")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(theme.primaryColor.color)
                Spacer()
                Text("2/5")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal)
            .padding(.top, 12)
            .padding(.bottom, 8)
            
            Divider()
                .background(theme.primaryColor.color.opacity(0.2))
            
            // Tasks
            VStack(alignment: .leading, spacing: 6) {
                taskRow(title: "Buy groceries", completed: true, compact: true)
                taskRow(title: "Finish report", completed: false, compact: true)
                taskRow(title: "Call dentist", completed: false, compact: true)
                taskRow(title: "Team meeting", completed: false, compact: true)
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
            
            // Events Header
            Divider()
                .background(theme.primaryColor.color.opacity(0.2))
            
            HStack {
                Image(systemName: "calendar")
                    .foregroundColor(theme.secondaryColor.color)
                Text("Upcoming Events")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(theme.secondaryColor.color)
                Spacer()
            }
            .padding(.horizontal)
            .padding(.top, 8)
            .padding(.bottom, 6)
            
            // Events
            VStack(alignment: .leading, spacing: 6) {
                eventRow(icon: "birthday.cake.fill", title: "Mom's Birthday", date: "Tomorrow")
                eventRow(icon: "airplane", title: "Vacation Trip", date: "Mar 15")
                eventRow(icon: "heart.fill", title: "Anniversary", date: "Apr 2")
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
        .frame(height: 360)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(20)
    }
    
    private func taskRow(title: String, completed: Bool, compact: Bool = false) -> some View {
        HStack(spacing: 8) {
            Image(systemName: completed ? "checkmark.circle.fill" : "circle")
                .font(.system(size: compact ? 14 : 16))
                .foregroundColor(completed ? theme.primaryColor.color : .gray)
            
            Text(title)
                .font(.system(size: compact ? 12 : 13))
                .foregroundColor(completed ? .secondary : .primary)
                .strikethrough(completed)
            
            Spacer()
        }
    }
    
    private func eventRow(icon: String, title: String, date: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(theme.secondaryColor.color)
                .frame(width: 16)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.primary)
                
                Text(date)
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
    
    private var howToAddSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("How to Add Widgets")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(theme.primaryColor.color)
            
            VStack(alignment: .leading, spacing: 12) {
                howToStep(number: "1", text: "Long press on your Home Screen")
                howToStep(number: "2", text: "Tap the '+' button in the top left")
                howToStep(number: "3", text: "Search for 'Plannio'")
                howToStep(number: "4", text: "Choose your widget size")
                howToStep(number: "5", text: "Tap 'Add Widget' and position it")
            }
            
            HStack(spacing: 8) {
                Image(systemName: "lightbulb.fill")
                    .foregroundColor(theme.primaryColor.color)
                
                Text("Tip: Widgets update automatically every 15 minutes!")
                    .font(.system(size: 13))
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(theme.primaryColor.color.opacity(0.1))
            .cornerRadius(12)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
        .padding(.horizontal)
    }
    
    private func howToStep(number: String, text: String) -> some View {
        HStack(spacing: 12) {
            Text(number)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
                .frame(width: 32, height: 32)
                .background(
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [theme.primaryColor.color, theme.secondaryColor.color],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                )
            
            Text(text)
                .font(.system(size: 15))
                .foregroundColor(.primary)
        }
    }
    
    enum WidgetSize {
        case small, medium, large
    }
}

struct WidgetGalleryView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            WidgetGalleryView()
                .environmentObject(ThemeManager.shared)
        }
    }
}
