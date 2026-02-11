import SwiftUI

struct TaskListView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var dataManager = DataManager.shared
    @State private var selectedFilter: TaskFilter = .all
    @State private var showingAddTask = false
    @State private var searchText = ""
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    enum TaskFilter: String, CaseIterable {
        case all = "All"
        case today = "Today"
        case upcoming = "Upcoming"
        case overdue = "Overdue"
        case completed = "Completed"
    }
    
    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $searchText)
                    .padding(.horizontal)
                    .padding(.top, 8)
                
                // Filter Tabs
                filterTabs
                
                // Task List
                if filteredTasks.isEmpty {
                    emptyStateView
                } else {
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(filteredTasks) { task in
                                TaskRowView(task: task)
                            }
                        }
                        .padding()
                    }
                }
            }
            
            // Floating Add Button
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Button(action: { showingAddTask = true }) {
                        Image(systemName: "plus")
                            .font(.system(size: 24, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 60, height: 60)
                            .background(
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [theme.primaryColor.color, theme.secondaryColor.color],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .shadow(color: theme.primaryColor.color.opacity(0.4), radius: 8, x: 0, y: 4)
                            )
                    }
                    .padding(.trailing, 20)
                    .padding(.bottom, 20)
                }
            }
        }
        .sheet(isPresented: $showingAddTask) {
            AddTaskView()
        }
    }
    
    // MARK: - Filter Tabs
    private var filterTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(TaskFilter.allCases, id: \.self) { filter in
                    filterButton(for: filter)
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
    }
    
    private func filterButton(for filter: TaskFilter) -> some View {
        Button(action: { selectedFilter = filter }) {
            Text(filter.rawValue)
                .font(.system(size: 14, weight: selectedFilter == filter ? .semibold : .regular))
                .foregroundColor(selectedFilter == filter ? .white : .primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    selectedFilter == filter 
                        ? LinearGradient(
                            colors: [theme.primaryColor.color, theme.secondaryColor.color],
                            startPoint: .leading,
                            endPoint: .trailing
                          )
                        : LinearGradient(
                            colors: [Color(.systemGray6), Color(.systemGray6)],
                            startPoint: .leading,
                            endPoint: .trailing
                          )
                )
                .cornerRadius(20)
        }
    }
    
    // MARK: - Empty State
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Tasks")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Tap the + button to add a new task")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Filtered Tasks
    private var filteredTasks: [Task] {
        var tasks: [Task] = []
        
        switch selectedFilter {
        case .all:
            tasks = dataManager.incompleteTasks()
        case .today:
            tasks = dataManager.tasksForToday()
        case .upcoming:
            tasks = dataManager.upcomingTasks()
        case .overdue:
            tasks = dataManager.overdueTasks()
        case .completed:
            tasks = dataManager.tasks.filter { $0.completed }
        }
        
        // Apply search filter
        if !searchText.isEmpty {
            tasks = tasks.filter { task in
                task.title.localizedCaseInsensitiveContains(searchText) ||
                (task.description?.localizedCaseInsensitiveContains(searchText) ?? false)
            }
        }
        
        return tasks.sorted { ($0.dueDate ?? Date.distantFuture) < ($1.dueDate ?? Date.distantFuture) }
    }
}

// MARK: - Task Row View
struct TaskRowView: View {
    let task: Task
    @StateObject private var dataManager = DataManager.shared
    @State private var showingDetail = false
    
    var body: some View {
        Button(action: { showingDetail = true }) {
            HStack(spacing: 12) {
                // Checkbox
                Button(action: { dataManager.toggleTaskCompletion(task) }) {
                    Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 24))
                        .foregroundColor(task.completed ? .green : .gray)
                }
                .buttonStyle(PlainButtonStyle())
                
                // Task Content
                VStack(alignment: .leading, spacing: 6) {
                    Text(task.title)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(task.completed ? .secondary : .primary)
                        .strikethrough(task.completed)
                    
                    HStack(spacing: 8) {
                        // Priority Badge
                        HStack(spacing: 4) {
                            Circle()
                                .fill(task.priority.color)
                                .frame(width: 8, height: 8)
                            Text(task.priority.rawValue.capitalized)
                                .font(.system(size: 12))
                                .foregroundColor(.secondary)
                        }
                        
                        // Category
                        if let category = task.category {
                            Text(category)
                                .font(.system(size: 12))
                                .foregroundColor(.secondary)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(Color(.systemGray6))
                                .cornerRadius(4)
                        }
                        
                        // Due Date
                        if let dueDate = task.dueDate {
                            Text(formatDate(dueDate))
                                .font(.system(size: 12))
                                .foregroundColor(isOverdue(dueDate) ? .red : .secondary)
                        }
                    }
                }
                
                Spacer()
                
                // Chevron
                Image(systemName: "chevron.right")
                    .font(.system(size: 14))
                    .foregroundColor(.gray)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
        .sheet(isPresented: $showingDetail) {
            TaskDetailView(task: task)
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let calendar = Calendar.current
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
    
    private func isOverdue(_ date: Date) -> Bool {
        return date < Date() && !task.completed
    }
}

// MARK: - Preview
struct TaskListView_Previews: PreviewProvider {
    static var previews: some View {
        TaskListView()
    }
}
