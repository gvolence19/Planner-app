import SwiftUI

struct CalendarView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var dataManager = DataManager.shared
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    @State private var selectedDate = Date()
    @State private var showingAddTask = false
    @State private var currentMonth = Date()
    
    private let calendar = Calendar.current
    private let daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    
    var body: some View {
        VStack(spacing: 0) {
            // Month Navigation
            monthNavigationView
            
            // Calendar Grid
            calendarGrid
            
            // Tasks for Selected Date
            tasksForSelectedDate
        }
        .sheet(isPresented: $showingAddTask) {
            AddTaskView()
        }
    }
    
    // MARK: - Month Navigation
    private var monthNavigationView: some View {
        HStack {
            Button(action: { changeMonth(by: -1) }) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(theme.primaryColor.color)
            }
            
            Spacer()
            
            Text(monthYearString())
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(theme.primaryColor.color)
            
            Spacer()
            
            Button(action: { changeMonth(by: 1) }) {
                Image(systemName: "chevron.right")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(theme.primaryColor.color)
            }
        }
        .padding()
    }
    
    // MARK: - Calendar Grid
    private var calendarGrid: some View {
        VStack(spacing: 0) {
            // Days of week header
            HStack(spacing: 0) {
                ForEach(daysOfWeek, id: \.self) { day in
                    Text(day)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity)
                }
            }
            .padding(.vertical, 8)
            
            Divider()
            
            // Calendar days
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 0) {
                ForEach(getDaysInMonth(), id: \.self) { date in
                    if let date = date {
                        dayCell(for: date)
                    } else {
                        Color.clear
                            .frame(height: 50)
                    }
                }
            }
        }
        .background(Color(.systemBackground))
    }
    
    private func dayCell(for date: Date) -> some View {
        let isSelected = calendar.isDate(date, inSameDayAs: selectedDate)
        let isToday = calendar.isDateInToday(date)
        let taskCount = tasksForDate(date).count
        
        return Button(action: { selectedDate = date }) {
            VStack(spacing: 4) {
                Text("\(calendar.component(.day, from: date))")
                    .font(.system(size: 16, weight: isToday ? .bold : .regular))
                    .foregroundColor(
                        isSelected ? .white :
                        isToday ? theme.primaryColor.color :
                        calendar.isDate(date, equalTo: currentMonth, toGranularity: .month) ? .primary : .secondary
                    )
                
                if taskCount > 0 {
                    Circle()
                        .fill(isSelected ? Color.white : theme.primaryColor.color)
                        .frame(width: 6, height: 6)
                }
            }
            .frame(height: 50)
            .frame(maxWidth: .infinity)
            .background(
                isSelected 
                    ? LinearGradient(
                        colors: [theme.primaryColor.color, theme.secondaryColor.color],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                      )
                    : LinearGradient(colors: [Color.clear, Color.clear], startPoint: .top, endPoint: .bottom)
            )
            .cornerRadius(8)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    // MARK: - Tasks for Selected Date
    private var tasksForSelectedDate: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(selectedDateString())
                    .font(.system(size: 18, weight: .semibold))
                
                Spacer()
                
                Button(action: { showingAddTask = true }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.accentColor)
                }
            }
            .padding(.horizontal)
            .padding(.top)
            
            ScrollView {
                if tasksForDate(selectedDate).isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.circle")
                            .font(.system(size: 40))
                            .foregroundColor(.gray)
                        
                        Text("No tasks for this day")
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, 40)
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(tasksForDate(selectedDate)) { task in
                            CalendarTaskRow(task: task)
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .background(Color(.systemGroupedBackground))
    }
    
    // MARK: - Helper Methods
    private func getDaysInMonth() -> [Date?] {
        var days: [Date?] = []
        
        guard let monthInterval = calendar.dateInterval(of: .month, for: currentMonth),
              let monthFirstWeek = calendar.dateInterval(of: .weekOfMonth, for: monthInterval.start) else {
            return days
        }
        
        var date = monthFirstWeek.start
        
        while days.count < 42 { // 6 weeks
            days.append(date)
            date = calendar.date(byAdding: .day, value: 1, to: date)!
        }
        
        return days
    }
    
    private func tasksForDate(_ date: Date) -> [Task] {
        dataManager.tasks.filter { task in
            guard let taskDate = task.dueDate else { return false }
            return calendar.isDate(taskDate, inSameDayAs: date)
        }
        .sorted { ($0.startTime ?? "") < ($1.startTime ?? "") }
    }
    
    private func changeMonth(by value: Int) {
        if let newMonth = calendar.date(byAdding: .month, value: value, to: currentMonth) {
            currentMonth = newMonth
        }
    }
    
    private func monthYearString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: currentMonth)
    }
    
    private func selectedDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d"
        return formatter.string(from: selectedDate)
    }
}

// MARK: - Calendar Task Row
struct CalendarTaskRow: View {
    let task: Task
    @StateObject private var dataManager = DataManager.shared
    @State private var showingDetail = false
    
    var body: some View {
        Button(action: { showingDetail = true }) {
            HStack(spacing: 12) {
                // Time indicator
                if let startTime = task.startTime {
                    Text(startTime)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.secondary)
                        .frame(width: 50, alignment: .leading)
                }
                
                // Task info
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.title)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(.primary)
                        .strikethrough(task.completed)
                    
                    HStack(spacing: 6) {
                        Circle()
                            .fill(task.priority.color)
                            .frame(width: 8, height: 8)
                        
                        if let category = task.category {
                            Text(category)
                                .font(.system(size: 12))
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
                
                Button(action: { dataManager.toggleTaskCompletion(task) }) {
                    Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 20))
                        .foregroundColor(task.completed ? .green : .gray)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(10)
        }
        .buttonStyle(PlainButtonStyle())
        .sheet(isPresented: $showingDetail) {
            TaskDetailView(task: task)
        }
    }
}

// MARK: - Preview
struct CalendarView_Previews: PreviewProvider {
    static var previews: some View {
        CalendarView()
    }
}
