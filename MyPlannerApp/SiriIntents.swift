import AppIntents
import SwiftUI

// MARK: - Add Task Intent
@available(iOS 16.0, *)
struct AddTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Task"
    static var description = IntentDescription("Add a new task to Plannio")
    static var openAppWhenRun: Bool = false
    
    @Parameter(title: "Task Title", description: "What do you want to add?")
    var taskTitle: String
    
    @Parameter(title: "Category", description: "Task category", default: "Personal")
    var category: String?
    
    @Parameter(title: "Priority", description: "Task priority", default: "Medium")
    var priority: String?
    
    @Parameter(title: "Due Date", description: "When is it due?")
    var dueDate: Date?
    
    static var parameterSummary: some ParameterSummary {
        Summary("Add \(\.$taskTitle) to Plannio") {
            \.$category
            \.$priority
            \.$dueDate
        }
    }
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let dataManager = DataManager.shared
        
        // Map priority string to Priority enum
        let taskPriority: Priority
        switch priority?.lowercased() {
        case "high":
            taskPriority = .high
        case "low":
            taskPriority = .low
        default:
            taskPriority = .medium
        }
        
        // Create the task
        let newTask = Task(
            title: taskTitle,
            dueDate: dueDate,
            category: category ?? "Personal",
            priority: taskPriority
        )
        
        // Add to data manager
        await MainActor.run {
            dataManager.addTask(newTask)
        }
        
        // Build response message
        var message = "Added '\(taskTitle)' to your tasks"
        if let dueDate = dueDate {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            message += " due \(formatter.string(from: dueDate))"
        }
        
        return .result(dialog: IntentDialog(stringLiteral: message))
    }
}

// MARK: - Quick Add Task Intent (Simplified)
@available(iOS 16.0, *)
struct QuickAddTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Quick Add Task"
    static var description = IntentDescription("Quickly add a task with just a title")
    static var openAppWhenRun: Bool = false
    
    @Parameter(title: "Task", description: "What do you want to add?")
    var taskTitle: String
    
    static var parameterSummary: some ParameterSummary {
        Summary("Add \(\.$taskTitle)")
    }
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let dataManager = DataManager.shared
        
        // Create simple task
        let newTask = Task(
            title: taskTitle,
            category: "Personal",
            priority: .medium
        )
        
        // Add to data manager
        await MainActor.run {
            dataManager.addTask(newTask)
        }
        
        return .result(dialog: IntentDialog(stringLiteral: "Added '\(taskTitle)' to your tasks"))
    }
}

// MARK: - View Tasks Intent
@available(iOS 16.0, *)
struct ViewTasksIntent: AppIntent {
    static var title: LocalizedStringResource = "View My Tasks"
    static var description = IntentDescription("See your upcoming tasks")
    static var openAppWhenRun: Bool = true
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let dataManager = DataManager.shared
        
        let incompleteTasks = await MainActor.run {
            dataManager.incompleteTasks()
        }
        
        let taskCount = incompleteTasks.count
        
        if taskCount == 0 {
            return .result(dialog: IntentDialog(stringLiteral: "You have no tasks. Great job!"))
        } else if taskCount == 1 {
            return .result(dialog: IntentDialog(stringLiteral: "You have 1 task pending"))
        } else {
            return .result(dialog: IntentDialog(stringLiteral: "You have \(taskCount) tasks pending"))
        }
    }
}

// MARK: - Complete Task Intent
@available(iOS 16.0, *)
struct CompleteTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Complete Task"
    static var description = IntentDescription("Mark a task as complete")
    static var openAppWhenRun: Bool = false
    
    @Parameter(title: "Task Title", description: "Which task did you complete?")
    var taskTitle: String
    
    static var parameterSummary: some ParameterSummary {
        Summary("Complete \(\.$taskTitle)")
    }
    
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let dataManager = DataManager.shared
        
        let completed = await MainActor.run { () -> Bool in
            // Find the task
            if let task = dataManager.tasks.first(where: { 
                $0.title.lowercased().contains(taskTitle.lowercased()) && !$0.completed 
            }) {
                // Mark as complete
                var updatedTask = task
                updatedTask.completed = true
                dataManager.updateTask(updatedTask)
                return true
            }
            return false
        }
        
        if completed {
            return .result(dialog: IntentDialog(stringLiteral: "Great! Marked '\(taskTitle)' as complete"))
        } else {
            return .result(dialog: IntentDialog(stringLiteral: "Sorry, I couldn't find a task matching '\(taskTitle)'"))
        }
    }
}

// MARK: - App Shortcuts Provider
@available(iOS 16.0, *)
struct MyPlannerShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: QuickAddTaskIntent(),
            phrases: [
                "Add a task in \(.applicationName)",
                "Quick add in \(.applicationName)"
            ],
            shortTitle: "Add Task",
            systemImageName: "plus.circle"
        )
        
        AppShortcut(
            intent: ViewTasksIntent(),
            phrases: [
                "Show my tasks in \(.applicationName)",
                "Check my tasks in \(.applicationName)"
            ],
            shortTitle: "View Tasks",
            systemImageName: "list.bullet"
        )
    }
}

// MARK: - Siri Tips View (Optional - shows in app)
@available(iOS 16.0, *)
struct SiriTipsView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Siri Shortcuts")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("You can use Siri to manage your tasks! Try saying:")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            VStack(alignment: .leading, spacing: 12) {
                SiriTipRow(icon: "plus.circle", phrase: "Add a task in Plannio")
                SiriTipRow(icon: "list.bullet", phrase: "Show my tasks")
                SiriTipRow(icon: "checkmark.circle", phrase: "Complete [task name]")
                SiriTipRow(icon: "plus.app", phrase: "Add buy milk to Plannio")
            }
            
            Divider()
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Examples:")
                    .font(.caption)
                    .fontWeight(.semibold)
                
                Text("\"Hey Siri, add buy groceries to Plannio\"")
                    .font(.caption)
                    .italic()
                
                Text("\"Hey Siri, what are my tasks?\"")
                    .font(.caption)
                    .italic()
                
                Text("\"Hey Siri, complete team meeting\"")
                    .font(.caption)
                    .italic()
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(8)
        }
        .padding()
    }
}

struct SiriTipRow: View {
    let icon: String
    let phrase: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.accentColor)
                .frame(width: 24)
            
            Text(phrase)
                .font(.subheadline)
            
            Spacer()
        }
    }
}
