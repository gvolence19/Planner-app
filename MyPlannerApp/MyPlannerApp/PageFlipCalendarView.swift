import SwiftUI

// MARK: - Page Flip Calendar View (Planmore Style)
struct PageFlipCalendarView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var dataManager = DataManager.shared
    @State private var currentDate = Date()
    @State private var showingAddTask = false
    @State private var showingSettings = false
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ZStack {
            // Subtle paper texture background
            Color(.systemBackground)
                .overlay(
                    LinearGradient(
                        colors: [
                            theme.primaryColor.color.opacity(0.03),
                            Color.clear
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Notebook-style header
                notebookHeader
                
                // Page flip view
                TabView(selection: $currentDate) {
                    ForEach(generateDates(), id: \.self) { date in
                        DayPageView(date: date)
                            .tag(date)
                            .environmentObject(themeManager)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            
            // Floating add button
            floatingActionButton
        }
        .sheet(isPresented: $showingAddTask) {
            AddTaskView()
                .environmentObject(themeManager)
        }
        .sheet(isPresented: $showingSettings) {
            SettingsView()
                .environmentObject(themeManager)
        }
    }
    
    // MARK: - Notebook Header
    private var notebookHeader: some View {
        VStack(spacing: 0) {
            HStack {
                Text(monthYearString())
                    .font(.system(size: 32, weight: .bold))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [theme.primaryColor.color, theme.secondaryColor.color],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                
                Spacer()
                
                Button(action: { withAnimation { currentDate = Date() } }) {
                    HStack(spacing: 4) {
                        Image(systemName: "calendar.circle.fill")
                        Text("Today")
                    }
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(theme.primaryColor.color)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Capsule().fill(theme.primaryColor.color.opacity(0.12)))
                }
                
                Button(action: { showingSettings = true }) {
                    Image(systemName: "gearshape.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.secondary)
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 12)
            .padding(.bottom, 16)
            
            // Spiral binding effect
            HStack(spacing: 12) {
                ForEach(0..<8) { _ in
                    Circle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.bottom, 8)
            
            Divider()
        }
        .background(Color(.systemBackground))
        .shadow(color: .black.opacity(0.08), radius: 4, y: 2)
    }
    
    // MARK: - Floating Action Button
    private var floatingActionButton: some View {
        VStack {
            Spacer()
            HStack {
                Spacer()
                Button(action: { showingAddTask = true }) {
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [theme.primaryColor.color, theme.secondaryColor.color],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 68, height: 68)
                            .shadow(color: theme.primaryColor.color.opacity(0.4), radius: 12, x: 0, y: 6)
                        
                        Image(systemName: "plus")
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundColor(.white)
                    }
                }
                .padding(.trailing, 28)
                .padding(.bottom, 28)
            }
        }
    }
    
    private func generateDates() -> [Date] {
        let calendar = Calendar.current
        return (-30...30).compactMap { calendar.date(byAdding: .day, value: $0, to: Date()) }
    }
    
    private func monthYearString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: currentDate)
    }
}

// MARK: - Day Page View
struct DayPageView: View {
    let date: Date
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var dataManager = DataManager.shared
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                dateHeader
                
                if tasksForDate().isEmpty {
                    emptyDayView
                } else {
                    taskTimeline
                }
                
                Color.clear.frame(height: 100)
            }
            .padding(.horizontal, 24)
            .padding(.top, 20)
        }
    }
    
    // MARK: - Date Header
    private var dateHeader: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 8) {
                Text(dayOfWeek())
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.secondary)
                    .textCase(.uppercase)
                    .tracking(1)
                
                Text(dayNumber())
                    .font(.system(size: 72, weight: .bold))
                    .foregroundColor(theme.primaryColor.color)
                    .shadow(color: theme.primaryColor.color.opacity(0.2), radius: 8, x: 0, y: 4)
            }
            
            Spacer()
            
            if !tasksForDate().isEmpty {
                VStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                            .frame(width: 80, height: 80)
                        
                        Circle()
                            .trim(from: 0, to: completionRatio())
                            .stroke(
                                LinearGradient(
                                    colors: [theme.primaryColor.color, theme.secondaryColor.color],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                style: StrokeStyle(lineWidth: 8, lineCap: .round)
                            )
                            .frame(width: 80, height: 80)
                            .rotationEffect(.degrees(-90))
                            .animation(.spring(response: 0.6), value: completionRatio())
                        
                        VStack(spacing: 2) {
                            Text("\(Int(completionRatio() * 100))%")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(theme.primaryColor.color)
                            
                            Text("done")
                                .font(.system(size: 11))
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 12))
                            .foregroundColor(.green)
                        Text("\(completedCount())/\(tasksForDate().count)")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .padding(.bottom, 8)
    }
    
    // MARK: - Task Timeline
    private var taskTimeline: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(0..<24) { hour in
                if let tasks = tasksForHour(hour), !tasks.isEmpty {
                    hourSection(hour: hour, tasks: tasks)
                }
            }
        }
    }
    
    private func hourSection(hour: Int, tasks: [Task]) -> some View {
        HStack(alignment: .top, spacing: 16) {
            VStack(spacing: 4) {
                Text(formatHour(hour))
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.secondary)
                    .frame(width: 60, alignment: .trailing)
                
                Circle()
                    .fill(theme.primaryColor.color)
                    .frame(width: 8, height: 8)
            }
            
            Rectangle()
                .fill(theme.primaryColor.color.opacity(0.3))
                .frame(width: 2)
            
            VStack(alignment: .leading, spacing: 12) {
                ForEach(tasks) { task in
                    TaskCardCompact(task: task)
                        .environmentObject(themeManager)
                }
            }
            .padding(.bottom, 24)
        }
    }
    
    // MARK: - Empty Day
    private var emptyDayView: some View {
        VStack(spacing: 20) {
            Image(systemName: "sun.horizon")
                .font(.system(size: 60))
                .foregroundColor(theme.primaryColor.color.opacity(0.4))
                .padding(.top, 60)
            
            Text("No tasks scheduled")
                .font(.system(size: 22, weight: .semibold))
                .foregroundColor(.primary)
            
            Text("Enjoy your free day!\nTap + to add a task")
                .font(.system(size: 15))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .lineSpacing(6)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 80)
    }
    
    // MARK: - Helpers
    private func dayOfWeek() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        return formatter.string(from: date)
    }
    
    private func dayNumber() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: date)
    }
    
    private func tasksForDate() -> [Task] {
        let calendar = Calendar.current
        return dataManager.tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return calendar.isDate(dueDate, inSameDayAs: date)
        }
        .sorted { ($0.dueDate ?? Date()) < ($1.dueDate ?? Date()) }
    }
    
    private func tasksForHour(_ hour: Int) -> [Task]? {
        let calendar = Calendar.current
        let tasks = tasksForDate().filter { task in
            guard let dueDate = task.dueDate else { return false }
            return calendar.component(.hour, from: dueDate) == hour
        }
        return tasks.isEmpty ? nil : tasks
    }
    
    private func formatHour(_ hour: Int) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h a"
        var components = Calendar.current.dateComponents([.year, .month, .day], from: date)
        components.hour = hour
        if let date = Calendar.current.date(from: components) {
            return formatter.string(from: date)
        }
        return "\(hour):00"
    }
    
    private func completionRatio() -> CGFloat {
        let tasks = tasksForDate()
        guard !tasks.isEmpty else { return 0 }
        return CGFloat(completedCount()) / CGFloat(tasks.count)
    }
    
    private func completedCount() -> Int {
        tasksForDate().filter { $0.completed }.count
    }
}

// MARK: - Task Card Compact
struct TaskCardCompact: View {
    let task: Task
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var dataManager = DataManager.shared
    @State private var showingDetail = false
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        Button(action: { showingDetail = true }) {
            HStack(spacing: 14) {
                Button(action: {
                    withAnimation(.spring(response: 0.3)) {
                        dataManager.toggleTaskCompletion(task)
                    }
                }) {
                    ZStack {
                        Circle()
                            .stroke(task.completed ? theme.primaryColor.color : Color.gray.opacity(0.4), lineWidth: 2.5)
                            .frame(width: 28, height: 28)
                        
                        if task.completed {
                            Image(systemName: "checkmark")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(theme.primaryColor.color)
                        }
                    }
                }
                .buttonStyle(PlainButtonStyle())
                
                VStack(alignment: .leading, spacing: 6) {
                    Text(task.title)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(task.completed ? .secondary : .primary)
                        .strikethrough(task.completed, color: .secondary)
                        .lineLimit(2)
                    
                    HStack(spacing: 10) {
                        HStack(spacing: 4) {
                            Circle()
                                .fill(task.priority.color)
                                .frame(width: 6, height: 6)
                            Text(task.priority.rawValue)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.secondary)
                                .textCase(.uppercase)
                        }
                        
                        if let category = task.category {
                            Text(category)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(theme.primaryColor.color)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Capsule().fill(theme.primaryColor.color.opacity(0.12)))
                        }
                        
                        if let dueDate = task.dueDate {
                            Text(formatTime(dueDate))
                                .font(.system(size: 12))
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
                
                RoundedRectangle(cornerRadius: 2)
                    .fill(task.priority.color)
                    .frame(width: 4, height: 50)
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.secondarySystemBackground))
                    .shadow(color: .black.opacity(0.04), radius: 8, x: 0, y: 2)
            )
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(task.priority.color.opacity(0.2), lineWidth: 1))
        }
        .sheet(isPresented: $showingDetail) {
            TaskDetailView(task: task)
                .environmentObject(themeManager)
        }
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }
}
