import SwiftUI
import Charts

// MARK: - Analytics Manager
class AnalyticsManager: ObservableObject {
    @Published var stats = UsageStats()
    
    private let dataManager = DataManager.shared
    
    func calculateStats() {
        let tasks = dataManager.tasks
        
        // Basic stats
        stats.totalTasks = tasks.count
        stats.completedTasks = tasks.filter { $0.completed }.count
        stats.activeTasks = tasks.filter { !$0.completed }.count
        stats.overdueTasks = tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return !task.completed && dueDate < Date()
        }.count
        
        // Completion rate
        stats.completionRate = tasks.isEmpty ? 0 : Double(stats.completedTasks) / Double(stats.totalTasks)
        
        // Category breakdown
        stats.tasksByCategory = Dictionary(grouping: tasks) { $0.category ?? "Uncategorized" }
            .mapValues { $0.count }
        
        // Priority breakdown
        stats.tasksByPriority = [
            "High": tasks.filter { $0.priority == .high }.count,
            "Medium": tasks.filter { $0.priority == .medium }.count,
            "Low": tasks.filter { $0.priority == .low }.count
        ]
        
        // Time analysis
        stats.averageTasksPerDay = calculateAverageTasksPerDay(tasks: tasks)
        stats.mostProductiveDay = findMostProductiveDay(tasks: tasks)
        stats.mostUsedCategory = stats.tasksByCategory.max(by: { $0.value < $1.value })?.key ?? "None"
        
        // Streak calculation
        stats.currentStreak = calculateCurrentStreak(tasks: tasks)
        stats.longestStreak = calculateLongestStreak(tasks: tasks)
        
        // Upcoming analysis
        stats.tasksDueToday = tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return Calendar.current.isDateInToday(dueDate) && !task.completed
        }.count
        
        stats.tasksDueThisWeek = tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return Calendar.current.isDate(dueDate, equalTo: Date(), toGranularity: .weekOfYear) && !task.completed
        }.count
        
        // Performance metrics
        calculatePerformanceMetrics(tasks: tasks)
    }
    
    private func calculateAverageTasksPerDay(tasks: [Task]) -> Double {
        guard !tasks.isEmpty else { return 0 }
        
        let calendar = Calendar.current
        let sortedTasks = tasks.sorted { $0.createdAt < $1.createdAt }
        
        guard let firstDate = sortedTasks.first?.createdAt,
              let lastDate = sortedTasks.last?.createdAt else { return 0 }
        
        let days = calendar.dateComponents([.day], from: firstDate, to: lastDate).day ?? 1
        return Double(tasks.count) / Double(max(days, 1))
    }
    
    private func findMostProductiveDay(tasks: [Task]) -> String {
        let completedTasks = tasks.filter { $0.completed }
        guard !completedTasks.isEmpty else { return "N/A" }
        
        var dayCount: [Int: Int] = [:]
        let calendar = Calendar.current
        
        for task in completedTasks {
            let weekday = calendar.component(.weekday, from: task.createdAt)
            dayCount[weekday, default: 0] += 1
        }
        
        let maxDay = dayCount.max(by: { $0.value < $1.value })?.key ?? 1
        let formatter = DateFormatter()
        return formatter.weekdaySymbols[maxDay - 1]
    }
    
    private func calculateCurrentStreak(tasks: [Task]) -> Int {
        let completedTasks = tasks.filter { $0.completed }.sorted { $0.createdAt > $1.createdAt }
        guard !completedTasks.isEmpty else { return 0 }
        
        let calendar = Calendar.current
        var streak = 0
        var currentDate = Date()
        
        for task in completedTasks {
            if calendar.isDate(task.createdAt, inSameDayAs: currentDate) ||
               calendar.isDate(task.createdAt, inSameDayAs: calendar.date(byAdding: .day, value: -1, to: currentDate)!) {
                streak += 1
                currentDate = task.createdAt
            } else {
                break
            }
        }
        
        return streak
    }
    
    private func calculateLongestStreak(tasks: [Task]) -> Int {
        let completedTasks = tasks.filter { $0.completed }.sorted { $0.createdAt < $1.createdAt }
        guard !completedTasks.isEmpty else { return 0 }
        
        var longestStreak = 1
        var currentStreak = 1
        let calendar = Calendar.current
        
        for i in 1..<completedTasks.count {
            let previousDate = completedTasks[i - 1].createdAt
            let currentDate = completedTasks[i].createdAt
            
            if calendar.isDate(currentDate, inSameDayAs: calendar.date(byAdding: .day, value: 1, to: previousDate)!) {
                currentStreak += 1
                longestStreak = max(longestStreak, currentStreak)
            } else if !calendar.isDate(currentDate, inSameDayAs: previousDate) {
                currentStreak = 1
            }
        }
        
        return longestStreak
    }
    
    private func calculatePerformanceMetrics(tasks: [Task]) {
        // Task completion by hour
        var hourlyCompletion: [Int: Int] = [:]
        let calendar = Calendar.current
        
        for task in tasks.filter({ $0.completed }) {
            let hour = calendar.component(.hour, from: task.createdAt)
            hourlyCompletion[hour, default: 0] += 1
        }
        
        stats.peakProductivityHours = hourlyCompletion.sorted { $0.value > $1.value }
            .prefix(3)
            .map { "\($0.key):00" }
        
        // Weekly trends
        calculateWeeklyTrends(tasks: tasks)
    }
    
    private func calculateWeeklyTrends(tasks: [Task]) {
        let calendar = Calendar.current
        let today = Date()
        
        for weekOffset in 0..<4 {
            guard let weekStart = calendar.date(byAdding: .weekOfYear, value: -weekOffset, to: today) else { continue }
            guard let weekEnd = calendar.date(byAdding: .day, value: 7, to: weekStart) else { continue }
            
            let weekTasks = tasks.filter { task in
                task.createdAt >= weekStart && task.createdAt < weekEnd
            }
            
            let completed = weekTasks.filter { $0.completed }.count
            
            stats.weeklyTrends.append(WeeklyData(
                week: "Week \(weekOffset + 1)",
                tasksCreated: weekTasks.count,
                tasksCompleted: completed,
                completionRate: weekTasks.isEmpty ? 0 : Double(completed) / Double(weekTasks.count)
            ))
        }
        
        stats.weeklyTrends.reverse()
    }
    
    // MARK: - Track Events
    func trackEvent(_ event: AnalyticsEvent) {
        // Store events for analytics
        let eventKey = "analytics_events"
        var events = UserDefaults.standard.array(forKey: eventKey) as? [[String: Any]] ?? []
        
        let eventData: [String: Any] = [
            "type": event.type.rawValue,
            "timestamp": Date(),
            "metadata": event.metadata
        ]
        
        events.append(eventData)
        
        // Keep only last 1000 events
        if events.count > 1000 {
            events = Array(events.suffix(1000))
        }
        
        UserDefaults.standard.set(events, forKey: eventKey)
    }
}

// MARK: - Usage Stats
struct UsageStats {
    var totalTasks: Int = 0
    var completedTasks: Int = 0
    var activeTasks: Int = 0
    var overdueTasks: Int = 0
    var completionRate: Double = 0
    var averageTasksPerDay: Double = 0
    var mostProductiveDay: String = ""
    var mostUsedCategory: String = ""
    var currentStreak: Int = 0
    var longestStreak: Int = 0
    var tasksDueToday: Int = 0
    var tasksDueThisWeek: Int = 0
    var tasksByCategory: [String: Int] = [:]
    var tasksByPriority: [String: Int] = [:]
    var peakProductivityHours: [String] = []
    var weeklyTrends: [WeeklyData] = []
}

struct WeeklyData: Identifiable {
    let id = UUID()
    let week: String
    let tasksCreated: Int
    let tasksCompleted: Int
    let completionRate: Double
}

// MARK: - Analytics Event
struct AnalyticsEvent {
    enum EventType: String {
        case taskCreated
        case taskCompleted
        case taskDeleted
        case taskEdited
        case categoryCreated
        case projectCreated
        case templateUsed
        case voiceCommandUsed
        case calendarSynced
    }
    
    let type: EventType
    let metadata: [String: String]
}

// MARK: - Analytics View
struct AnalyticsView: View {
    @StateObject private var analyticsManager = AnalyticsManager()
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Overview Cards
                overviewSection
                
                // Completion Rate
                completionRateSection
                
                // Category Breakdown
                categoryBreakdownSection
                
                // Productivity Insights
                productivityInsights
                
                // Weekly Trends
                weeklyTrendsSection
            }
            .padding()
        }
        .navigationTitle("Analytics")
        .onAppear {
            analyticsManager.calculateStats()
        }
    }
    
    // MARK: - Overview Section
    private var overviewSection: some View {
        VStack(spacing: 12) {
            Text("Overview")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                StatCard(
                    title: "Total Tasks",
                    value: "\(analyticsManager.stats.totalTasks)",
                    icon: "checkmark.circle",
                    color: .blue
                )
                
                StatCard(
                    title: "Completed",
                    value: "\(analyticsManager.stats.completedTasks)",
                    icon: "checkmark.circle.fill",
                    color: .green
                )
                
                StatCard(
                    title: "Active",
                    value: "\(analyticsManager.stats.activeTasks)",
                    icon: "circle.dashed",
                    color: .orange
                )
                
                StatCard(
                    title: "Overdue",
                    value: "\(analyticsManager.stats.overdueTasks)",
                    icon: "exclamationmark.circle",
                    color: .red
                )
            }
        }
    }
    
    // MARK: - Completion Rate
    private var completionRateSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Completion Rate")
                .font(.headline)
            
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 20)
                
                Circle()
                    .trim(from: 0, to: analyticsManager.stats.completionRate)
                    .stroke(Color.green, style: StrokeStyle(lineWidth: 20, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                
                VStack {
                    Text("\(Int(analyticsManager.stats.completionRate * 100))%")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    Text("Complete")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .frame(height: 200)
            .padding()
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    // MARK: - Category Breakdown
    private var categoryBreakdownSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Tasks by Category")
                .font(.headline)
            
            ForEach(Array(analyticsManager.stats.tasksByCategory.sorted(by: { $0.value > $1.value })), id: \.key) { category, count in
                HStack {
                    Text(category)
                        .font(.subheadline)
                    
                    Spacer()
                    
                    Text("\(count)")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    GeometryReader { geometry in
                        Rectangle()
                            .fill(Color.accentColor.opacity(0.3))
                            .frame(width: geometry.size.width * (Double(count) / Double(max(analyticsManager.stats.totalTasks, 1))))
                    }
                    .frame(height: 8)
                    .frame(width: 100)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    // MARK: - Productivity Insights
    private var productivityInsights: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Productivity Insights")
                .font(.headline)
            
            InsightRow(
                icon: "flame.fill",
                title: "Current Streak",
                value: "\(analyticsManager.stats.currentStreak) days",
                color: .orange
            )
            
            InsightRow(
                icon: "star.fill",
                title: "Longest Streak",
                value: "\(analyticsManager.stats.longestStreak) days",
                color: .yellow
            )
            
            InsightRow(
                icon: "calendar",
                title: "Most Productive Day",
                value: analyticsManager.stats.mostProductiveDay,
                color: .green
            )
            
            InsightRow(
                icon: "tag.fill",
                title: "Most Used Category",
                value: analyticsManager.stats.mostUsedCategory,
                color: .blue
            )
            
            InsightRow(
                icon: "chart.bar.fill",
                title: "Avg Tasks Per Day",
                value: String(format: "%.1f", analyticsManager.stats.averageTasksPerDay),
                color: .purple
            )
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    // MARK: - Weekly Trends
    private var weeklyTrendsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Weekly Trends")
                .font(.headline)
            
            ForEach(analyticsManager.stats.weeklyTrends) { week in
                VStack(alignment: .leading, spacing: 8) {
                    Text(week.week)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    HStack {
                        Label("\(week.tasksCreated) created", systemImage: "plus.circle")
                            .font(.caption)
                        Label("\(week.tasksCompleted) completed", systemImage: "checkmark.circle")
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                    
                    ProgressView(value: week.completionRate)
                        .tint(.green)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

// MARK: - Performance Monitor
class PerformanceMonitor {
    static let shared = PerformanceMonitor()
    
    private var startTime: Date?
    private var metrics: [String: TimeInterval] = [:]
    
    func startMeasuring(_ operation: String) {
        startTime = Date()
        metrics[operation] = 0
    }
    
    func endMeasuring(_ operation: String) {
        guard let start = startTime else { return }
        let duration = Date().timeIntervalSince(start)
        metrics[operation] = duration
        
        // Log if operation took too long
        if duration > 1.0 {
            print("⚠️ Performance Warning: \(operation) took \(duration)s")
        }
    }
    
    func getMetrics() -> [String: TimeInterval] {
        return metrics
    }
}

// MARK: - Preview
struct AnalyticsView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            AnalyticsView()
        }
    }
}
