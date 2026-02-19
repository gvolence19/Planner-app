import WidgetKit
import SwiftUI

// MARK: - Widget Entry
struct PlannioEntry: TimelineEntry {
    let date: Date
    let tasks: [Task]
    let todayTaskCount: Int
    let completedCount: Int
    // let upcomingEvents: [EventItem] // Commented out - not used in main app yet
    let theme: AppTheme
    let isPremium: Bool
}

// MARK: - Widget Timeline Provider
struct PlannioProvider: TimelineProvider {
    func placeholder(in context: Context) -> PlannioEntry {
        PlannioEntry(
            date: Date(),
            tasks: [],
            todayTaskCount: 0,
            completedCount: 0,
            // upcomingEvents: [], // Commented out
            theme: .classicBlue,
            isPremium: false
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (PlannioEntry) -> Void) {
        let dataManager = DataManager.shared
        let themeManager = ThemeManager.shared
        
        let entry = PlannioEntry(
            date: Date(),
            tasks: dataManager.tasksForToday().prefix(5).map { $0 },
            todayTaskCount: dataManager.tasksForToday().count,
            completedCount: dataManager.tasks.filter { $0.completed }.count,
            // upcomingEvents: dataManager.upcomingEvents().prefix(3).map { $0 }, // Commented out
            theme: themeManager.currentTheme,
            isPremium: dataManager.isPremium
        )
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<PlannioEntry>) -> Void) {
        let dataManager = DataManager.shared
        let themeManager = ThemeManager.shared
        
        let currentDate = Date()
        let entry = PlannioEntry(
            date: currentDate,
            tasks: dataManager.tasksForToday().prefix(5).map { $0 },
            todayTaskCount: dataManager.tasksForToday().count,
            completedCount: dataManager.tasks.filter { $0.completed }.count,
            // upcomingEvents: dataManager.upcomingEvents().prefix(3).map { $0 }, // Commented out
            theme: themeManager.currentTheme,
            isPremium: dataManager.isPremium
        )
        
        // Update every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        
        completion(timeline)
    }
}

// MARK: - Small Widget (Tasks Count)
struct SmallTaskWidget: View {
    let entry: PlannioEntry
    
    var body: some View {
        if !entry.isPremium {
            PremiumLockedWidgetView(size: "Small")
        } else {
            ZStack {
                LinearGradient(
                    colors: [entry.theme.primaryColor.color, entry.theme.secondaryColor.color],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                
                VStack(spacing: 8) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 32))
                        .foregroundColor(.white)
                    
                    Text("\(entry.todayTaskCount)")
                        .font(.system(size: 36, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Tasks Today")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                }
            }
        }
    }
}

// MARK: - Medium Widget (Task List)
struct MediumTaskWidget: View {
    let entry: PlannioEntry
    
    var body: some View {
        if !entry.isPremium {
            PremiumLockedWidgetView(size: "Medium")
        } else {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(entry.theme.primaryColor.color)
                    Text("Today's Tasks")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(entry.theme.primaryColor.color)
                    Spacer()
                    Text("\(entry.completedCount)/\(entry.todayTaskCount)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
                .padding(.top, 12)
                .padding(.bottom, 8)
                
                Divider()
                    .background(entry.theme.primaryColor.color.opacity(0.2))
                
                // Task List
                if entry.tasks.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "checkmark.circle")
                            .font(.system(size: 32))
                            .foregroundColor(entry.theme.primaryColor.color.opacity(0.5))
                        Text("No tasks today!")
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(entry.tasks.prefix(3)) { task in
                            HStack(spacing: 8) {
                                Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                                    .font(.system(size: 16))
                                    .foregroundColor(task.completed ? entry.theme.primaryColor.color : .gray)
                                
                                Text(task.title)
                                    .font(.system(size: 13))
                                    .foregroundColor(task.completed ? .secondary : .primary)
                                    .strikethrough(task.completed)
                                    .lineLimit(1)
                                
                                Spacer()
                            }
                        }
                        
                        if entry.tasks.count > 3 {
                            Text("+\(entry.tasks.count - 3) more")
                                .font(.system(size: 12))
                                .foregroundColor(.secondary)
                                .padding(.leading, 24)
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
            }
            .background(Color(.systemBackground))
        }
    }
}

// MARK: - Large Widget (Tasks + Events)
struct LargeTaskWidget: View {
    let entry: PlannioEntry
    
    var body: some View {
        if !entry.isPremium {
            PremiumLockedWidgetView(size: "Large")
        } else {
            VStack(alignment: .leading, spacing: 0) {
                // Tasks Section
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(entry.theme.primaryColor.color)
                    Text("Today's Tasks")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(entry.theme.primaryColor.color)
                    Spacer()
                    Text("\(entry.completedCount)/\(entry.todayTaskCount)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)
                .padding(.top, 12)
                .padding(.bottom, 8)
                
                Divider()
                    .background(entry.theme.primaryColor.color.opacity(0.2))
                
                // Task List
                if entry.tasks.isEmpty {
                    HStack {
                        Spacer()
                        VStack(spacing: 4) {
                            Image(systemName: "checkmark.circle")
                                .font(.system(size: 24))
                                .foregroundColor(entry.theme.primaryColor.color.opacity(0.5))
                            Text("All done!")
                                .font(.system(size: 12))
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.vertical, 8)
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(entry.tasks.prefix(4)) { task in
                            HStack(spacing: 8) {
                                Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                                    .font(.system(size: 14))
                                    .foregroundColor(task.completed ? entry.theme.primaryColor.color : .gray)
                                
                                Text(task.title)
                                    .font(.system(size: 12))
                                    .foregroundColor(task.completed ? .secondary : .primary)
                                    .strikethrough(task.completed)
                                    .lineLimit(1)
                                
                                Spacer()
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }
                
                // Events Section
                Divider()
                    .background(entry.theme.primaryColor.color.opacity(0.2))
                
                HStack {
                    Image(systemName: "calendar")
                        .foregroundColor(entry.theme.secondaryColor.color)
                    Text("Upcoming Events")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(entry.theme.secondaryColor.color)
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.top, 8)
                .padding(.bottom, 6)
                
                if entry.upcomingEvents.isEmpty {
                    HStack {
                        Spacer()
                        Text("No upcoming events")
                            .font(.system(size: 11))
                            .foregroundColor(.secondary)
                        Spacer()
                    }
                    .padding(.bottom, 8)
                } else {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(entry.upcomingEvents.prefix(3)) { event in
                            HStack(spacing: 8) {
                                Image(systemName: event.icon)
                                    .font(.system(size: 12))
                                    .foregroundColor(entry.theme.secondaryColor.color)
                                    .frame(width: 16)
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(event.title)
                                        .font(.system(size: 11, weight: .medium))
                                        .foregroundColor(.primary)
                                        .lineLimit(1)
                                    
                                    if let date = event.date {
                                        Text(formatEventDate(date))
                                            .font(.system(size: 10))
                                            .foregroundColor(.secondary)
                                    }
                                }
                                
                                Spacer()
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 8)
                }
                
                Spacer()
            }
            .background(Color(.systemBackground))
        }
    }
    
    private func formatEventDate(_ date: Date) -> String {
        let calendar = Calendar.current
        let now = Date()
        
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInTomorrow(date) {
            return "Tomorrow"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM d"
            return formatter.string(from: date)
        }
    }
}

// MARK: - Premium Locked Widget View
struct PremiumLockedWidgetView: View {
    let size: String
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.gray.opacity(0.3), Color.gray.opacity(0.2)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            VStack(spacing: 12) {
                Image(systemName: "lock.fill")
                    .font(.system(size: size == "Small" ? 24 : 32))
                    .foregroundColor(.white.opacity(0.9))
                
                if size != "Small" {
                    VStack(spacing: 4) {
                        Text("Premium Feature")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("Unlock widgets in Plannio")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.8))
                            .multilineTextAlignment(.center)
                    }
                }
            }
            .padding()
        }
    }
}

// MARK: - Widget Configurations
struct SmallPlannioWidget: Widget {
    let kind: String = "SmallPlannioWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PlannioProvider()) { entry in
            SmallTaskWidget(entry: entry)
        }
        .configurationDisplayName("Task Count")
        .description("See your task count at a glance")
        .supportedFamilies([.systemSmall])
    }
}

struct MediumPlannioWidget: Widget {
    let kind: String = "MediumPlannioWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PlannioProvider()) { entry in
            MediumTaskWidget(entry: entry)
        }
        .configurationDisplayName("Task List")
        .description("View your today's tasks")
        .supportedFamilies([.systemMedium])
    }
}

struct LargePlannioWidget: Widget {
    let kind: String = "LargePlannioWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PlannioProvider()) { entry in
            LargeTaskWidget(entry: entry)
        }
        .configurationDisplayName("Tasks & Events")
        .description("See tasks and upcoming events")
        .supportedFamilies([.systemLarge])
    }
}

// MARK: - Widget Bundle
// Note: @main is in MyPlannerAppApp.swift
// Widgets are registered there, not here
struct PlannioWidgets: WidgetBundle {
    var body: some Widget {
        SmallPlannioWidget()
        MediumPlannioWidget()
        LargePlannioWidget()
    }
}
