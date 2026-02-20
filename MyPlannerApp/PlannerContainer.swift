import SwiftUI

// MARK: - Main Planner Container
// Unified planner aesthetic across all screens with customizable styles

struct PlannerContainer: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var selectedTab = 0
    @State private var currentPage = 1
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Enhanced paper background
            EnhancedPaperBackground(theme: theme, style: styleManager.currentStyle)
                .ignoresSafeArea()
            
            // Main content
            TabView(selection: $selectedTab) {
                // Tab 0: Calendar (Page-Flip)
                PageFlipCalendarView()
                    .tag(0)
                    .onChange(of: selectedTab) { _ in currentPage = 1 }
                
                // Tab 1: Tasks List
                PlannerTasksView()
                    .tag(1)
                    .onChange(of: selectedTab) { _ in currentPage = 2 }
                
                // Tab 2: Grocery List
                PlannerGroceryView()
                    .tag(2)
                    .onChange(of: selectedTab) { _ in currentPage = 3 }
                
                // Tab 3: Sleep & Wellness
                PlannerSleepView()
                    .tag(3)
                    .onChange(of: selectedTab) { _ in currentPage = 4 }
                
                // Tab 4: Settings
                PlannerSettingsView()
                    .tag(4)
                    .onChange(of: selectedTab) { _ in currentPage = 5 }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            
            // Page decorations
            if styleManager.showPageEdges {
                PageEdgeDecoration(theme: theme, style: styleManager.currentStyle)
                    .padding(.bottom, 65)
            }
            
            if styleManager.showPageNumbers {
                PageNumber(number: currentPage, theme: theme, style: styleManager.currentStyle)
                    .padding(.bottom, 65)
            }
            
            // Custom planner-style tab bar
            PlannerTabBar(selectedTab: $selectedTab)
        }
    }
}

// MARK: - Tasks View (Planner Style)
struct PlannerTasksView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var showingAddTask = false
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ZStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Enhanced page header
                    EnhancedPageHeader(
                        title: "My Tasks",
                        icon: "list.bullet.clipboard",
                        theme: theme,
                        style: styleManager.currentStyle,
                        showSpiral: styleManager.showSpiralBinding
                    )
                    
                    // Content
                    VStack(spacing: 16) {
                        // Today's tasks
                        taskSection(
                            title: "Today",
                            tasks: todayTasks,
                            theme: theme
                        )
                        
                        // Upcoming tasks
                        if !upcomingTasks.isEmpty {
                            taskSection(
                                title: "Upcoming",
                                tasks: upcomingTasks,
                                theme: theme
                            )
                        }
                        
                        // Completed tasks
                        if !completedTasks.isEmpty {
                            taskSection(
                                title: "Completed",
                                tasks: completedTasks,
                                theme: theme
                            )
                        }
                    }
                    .padding(16)
                    
                    Spacer(minLength: 100)
                }
            }
            
            // Floating add button (styled)
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Button {
                        showingAddTask = true
                    } label: {
                        Image(systemName: "plus")
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(width: 68, height: 68)
                            .background(
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [theme.primaryColor.color, theme.secondaryColor.color],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .shadow(
                                        color: theme.primaryColor.color.opacity(0.4),
                                        radius: 12,
                                        x: 0,
                                        y: 6
                                    )
                            )
                    }
                    .padding(.trailing, 28)
                    .padding(.bottom, 100)
                }
            }
        }
        .sheet(isPresented: $showingAddTask) {
            AddTaskView()
        }
    }
    
    private var todayTasks: [Task] {
        dataManager.tasksForToday().filter { !$0.completed }
    }
    
    private var upcomingTasks: [Task] {
        dataManager.upcomingTasks().prefix(5).map { $0 }
    }
    
    private var completedTasks: [Task] {
        dataManager.tasks.filter { $0.completed }.prefix(5).map { $0 }
    }
    
    private func taskSection(title: String, tasks: [Task], theme: AppTheme) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Section header
            HStack {
                Text(title)
                    .plannerHeadline()
                    .foregroundColor(theme.primaryColor.color)
                Spacer()
                Text("\(tasks.count)")
                    .plannerCaption()
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(
                        Capsule()
                            .fill(theme.primaryColor.color.opacity(0.12))
                    )
            }
            
            Rectangle()
                .fill(theme.primaryColor.color.opacity(0.3))
                .frame(height: 1)
            
            // Tasks
            if tasks.isEmpty {
                StyledPlannerCard(theme: theme, style: styleManager.currentStyle) {
                    HStack {
                        Image(systemName: "checkmark.circle")
                            .font(.system(size: 40))
                            .foregroundColor(theme.secondaryColor.color.opacity(0.3))
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("All done!")
                                .font(.system(size: 16, weight: .semibold))
                            Text("No tasks in this section")
                                .font(.system(size: 14))
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    }
                    .padding(.vertical, 8)
                }
            } else {
                ForEach(tasks) { task in
                    StyledTaskCard(task: task, theme: theme, style: styleManager.currentStyle)
                }
            }
        }
    }
}

// MARK: - Task Card (Planner Style)
struct StyledTaskCard: View {
    let task: Task
    let theme: AppTheme
    let style: PlannerStyle
    @EnvironmentObject var dataManager: DataManager
    
    var body: some View {
        StyledPlannerCard(theme: theme, style: style) {
            HStack(spacing: 12) {
                // Checkbox
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        var updatedTask = task
                        updatedTask.completed.toggle()
                        dataManager.updateTask(updatedTask)
                    }
                } label: {
                    ZStack {
                        Circle()
                            .stroke(priorityColor, lineWidth: 2.5)
                            .frame(width: 28, height: 28)
                        
                        if task.completed {
                            Image(systemName: "checkmark")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(priorityColor)
                        }
                    }
                }
                
                // Content
                VStack(alignment: .leading, spacing: 6) {
                    Text(task.title)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.primary)
                        .strikethrough(task.completed)
                    
                    HStack(spacing: 8) {
                        // Priority
                        HStack(spacing: 4) {
                            Circle()
                                .fill(priorityColor)
                                .frame(width: 6, height: 6)
                            Text(task.priority.rawValue.uppercased())
                                .font(.system(size: 11, weight: .semibold))
                                .foregroundColor(priorityColor)
                        }
                        
                        // Category
                        if let category = task.category {
                            Text(category)
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(theme.secondaryColor.color)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(
                                    Capsule()
                                        .fill(theme.secondaryColor.color.opacity(0.12))
                                )
                        }
                        
                        // Time
                        if let dueDate = task.dueDate {
                            Text(formatTime(dueDate))
                                .font(.system(size: 11))
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
                
                // Priority stripe
                Rectangle()
                    .fill(priorityColor)
                    .frame(width: 4)
                    .cornerRadius(2)
            }
        }
    }
    
    private var priorityColor: Color {
        switch task.priority {
        case .high: return .red
        case .medium: return .orange
        case .low: return .blue
        }
    }
    
    private func formatTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        return formatter.string(from: date)
    }
}

// MARK: - Grocery View (Planner Style)
struct PlannerGroceryView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                EnhancedPageHeader(
                    title: "Grocery List",
                    icon: "cart.fill",
                    theme: theme,
                    style: styleManager.currentStyle,
                    showSpiral: styleManager.showSpiralBinding
                )
                
                // Original grocery list content
                GroceryListView()
                    .padding(.top, 16)
                
                Spacer(minLength: 100)
            }
        }
    }
}

// MARK: - Sleep View (Planner Style)
struct PlannerSleepView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                EnhancedPageHeader(
                    title: "Sleep & Wellness",
                    icon: "moon.zzz.fill",
                    theme: theme,
                    style: styleManager.currentStyle,
                    showSpiral: styleManager.showSpiralBinding
                )
                
                // Original sleep content
                MealsAndSleepViews()
                    .padding(.top, 16)
                
                Spacer(minLength: 100)
            }
        }
    }
}

// MARK: - Settings View (Planner Style)
struct PlannerSettingsView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var showingCustomization = false
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                EnhancedPageHeader(
                    title: "Settings",
                    icon: "gearshape.fill",
                    theme: theme,
                    style: styleManager.currentStyle,
                    showSpiral: styleManager.showSpiralBinding
                )
                
                VStack(spacing: 16) {
                    // Planner Customization Button
                    Button {
                        showingCustomization = true
                    } label: {
                        StyledPlannerCard(theme: theme, style: styleManager.currentStyle) {
                            HStack(spacing: 16) {
                                ZStack {
                                    Circle()
                                        .fill(
                                            LinearGradient(
                                                colors: [theme.primaryColor.color, theme.secondaryColor.color],
                                                startPoint: .topLeading,
                                                endPoint: .bottomTrailing
                                            )
                                        )
                                        .frame(width: 56, height: 56)
                                    
                                    Image(systemName: "paintbrush.fill")
                                        .font(.system(size: 24))
                                        .foregroundColor(.white)
                                }
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Customize Your Planner")
                                        .font(.system(size: 18, weight: .semibold))
                                        .foregroundColor(.primary)
                                    Text("Change colors, styles & options")
                                        .font(.system(size: 14))
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(theme.primaryColor.color)
                            }
                            .padding(.vertical, 8)
                        }
                    }
                    .buttonStyle(.plain)
                    
                    // Original settings content
                    SettingsView()
                }
                .padding(16)
                .padding(.bottom, 100)
            }
        }
        .sheet(isPresented: $showingCustomization) {
            PlannerCustomizationView()
        }
    }
}
