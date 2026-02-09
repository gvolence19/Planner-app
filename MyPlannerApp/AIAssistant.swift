import SwiftUI

// MARK: - AI Assistant Message Model
struct AIMessage: Identifiable, Codable {
    let id: UUID
    let content: String
    let isUser: Bool
    let timestamp: Date
    
    init(id: UUID = UUID(), content: String, isUser: Bool, timestamp: Date = Date()) {
        self.id = id
        self.content = content
        self.isUser = isUser
        self.timestamp = timestamp
    }
}

// MARK: - AI Assistant Manager
class AIAssistantManager: ObservableObject {
    @Published var messages: [AIMessage] = []
    @Published var isProcessing = false
    
    private let dataManager = DataManager.shared
    
    init() {
        // Welcome message
        addAssistantMessage("👋 Hi! I'm your AI planning assistant. I can help you:\n\n• Summarize your day or week\n• Analyze your tasks\n• Create new tasks\n• Provide productivity insights\n\nHow can I help you today?")
    }
    
    // MARK: - Message Handling
    func sendMessage(_ content: String) {
        // Add user message
        let userMessage = AIMessage(content: content, isUser: true)
        messages.append(userMessage)
        
        // Process and respond
        isProcessing = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.processUserMessage(content)
            self.isProcessing = false
        }
    }
    
    private func addAssistantMessage(_ content: String) {
        let assistantMessage = AIMessage(content: content, isUser: false)
        messages.append(assistantMessage)
    }
    
    // MARK: - AI Processing
    private func processUserMessage(_ message: String) {
        let lowercased = message.lowercased()
        
        // Detect intent and respond
        if lowercased.contains("summarize") || lowercased.contains("summary") {
            if lowercased.contains("week") {
                summarizeWeek()
            } else if lowercased.contains("today") || lowercased.contains("day") {
                summarizeToday()
            } else {
                summarizeToday()
            }
        } else if lowercased.contains("create") || lowercased.contains("add") || lowercased.contains("make") {
            handleTaskCreation(message)
        } else if lowercased.contains("help") || lowercased.contains("what can you") {
            showHelp()
        } else if lowercased.contains("analyze") || lowercased.contains("insight") {
            analyzeProductivity()
        } else if lowercased.contains("upcoming") || lowercased.contains("next") || lowercased.contains("schedule") {
            showUpcoming()
        } else if lowercased.contains("overdue") {
            showOverdue()
        } else if lowercased.contains("completed") || lowercased.contains("done") {
            showCompleted()
        } else {
            // General response
            provideGeneralResponse(message)
        }
    }
    
    // MARK: - Summary Functions
    private func summarizeToday() {
        let today = Date()
        let calendar = Calendar.current
        
        let todayTasks = dataManager.tasks.filter { task in
            if let dueDate = task.dueDate {
                return calendar.isDateInToday(dueDate)
            }
            return false
        }
        
        let completed = todayTasks.filter { $0.completed }.count
        let pending = todayTasks.filter { !$0.completed }.count
        let high = todayTasks.filter { $0.priority == .high && !$0.completed }.count
        
        var response = "📅 **Today's Summary**\n\n"
        response += "You have \(todayTasks.count) tasks scheduled for today:\n"
        response += "• ✅ Completed: \(completed)\n"
        response += "• ⏳ Pending: \(pending)\n"
        
        if high > 0 {
            response += "• 🔴 High Priority: \(high)\n"
        }
        
        if pending > 0 {
            response += "\n**Pending Tasks:**\n"
            let pendingTasks = todayTasks.filter { !$0.completed }.prefix(5)
            for task in pendingTasks {
                let emoji = task.priority == .high ? "🔴" : task.priority == .medium ? "🟡" : "🟢"
                response += "\(emoji) \(task.title)\n"
            }
        } else if completed > 0 {
            response += "\n🎉 Great job! All tasks for today are complete!"
        } else {
            response += "\nYou have no tasks scheduled for today. Enjoy your free time! 😊"
        }
        
        addAssistantMessage(response)
    }
    
    private func summarizeWeek() {
        let calendar = Calendar.current
        let today = Date()
        let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        let weekEnd = calendar.date(byAdding: .day, value: 7, to: weekStart)!
        
        let weekTasks = dataManager.tasks.filter { task in
            if let dueDate = task.dueDate {
                return dueDate >= weekStart && dueDate < weekEnd
            }
            return false
        }
        
        let completed = weekTasks.filter { $0.completed }.count
        let pending = weekTasks.filter { !$0.completed }.count
        
        var response = "📊 **This Week's Summary**\n\n"
        response += "Total tasks: \(weekTasks.count)\n"
        response += "• ✅ Completed: \(completed)\n"
        response += "• ⏳ Pending: \(pending)\n"
        
        // Group by day
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "EEEE"
        
        var tasksByDay: [String: [Task]] = [:]
        for task in weekTasks.filter({ !$0.completed }) {
            if let dueDate = task.dueDate {
                let dayName = dateFormatter.string(from: dueDate)
                tasksByDay[dayName, default: []].append(task)
            }
        }
        
        if !tasksByDay.isEmpty {
            response += "\n**Upcoming by Day:**\n"
            let weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            for day in weekdays {
                if let tasks = tasksByDay[day], !tasks.isEmpty {
                    response += "\n**\(day)** (\(tasks.count)):\n"
                    for task in tasks.prefix(3) {
                        response += "  • \(task.title)\n"
                    }
                }
            }
        }
        
        addAssistantMessage(response)
    }
    
    // MARK: - Task Analysis
    private func analyzeProductivity() {
        let allTasks = dataManager.tasks
        let completed = allTasks.filter { $0.completed }.count
        let total = allTasks.count
        let completionRate = total > 0 ? (Double(completed) / Double(total)) * 100 : 0
        
        let highPriority = allTasks.filter { $0.priority == .high }.count
        let overdue = dataManager.overdueTasks().count
        
        var response = "📈 **Productivity Analysis**\n\n"
        response += "**Overall Stats:**\n"
        response += "• Total tasks: \(total)\n"
        response += "• Completed: \(completed)\n"
        response += "• Completion rate: \(Int(completionRate))%\n"
        response += "• High priority tasks: \(highPriority)\n"
        response += "• Overdue tasks: \(overdue)\n\n"
        
        // Insights
        response += "**Insights:**\n"
        if completionRate >= 80 {
            response += "🌟 Excellent! You're completing most of your tasks.\n"
        } else if completionRate >= 60 {
            response += "👍 Good work! Keep up the momentum.\n"
        } else if completionRate >= 40 {
            response += "💪 You're making progress. Try focusing on high-priority items.\n"
        } else {
            response += "🎯 Consider breaking tasks into smaller, manageable steps.\n"
        }
        
        if overdue > 5 {
            response += "⚠️ You have several overdue tasks. Consider rescheduling or delegating.\n"
        } else if overdue > 0 {
            response += "📌 You have a few overdue tasks. Try tackling them today!\n"
        }
        
        if highPriority > 10 {
            response += "🔴 Lots of high-priority tasks. Focus on the most critical 3 first.\n"
        }
        
        addAssistantMessage(response)
    }
    
    // MARK: - Show Functions
    private func showUpcoming() {
        let upcoming = dataManager.upcomingTasks().prefix(10)
        
        var response = "📅 **Upcoming Tasks**\n\n"
        
        if upcoming.isEmpty {
            response += "You have no upcoming tasks with due dates. Great job staying on top of things! 🎉"
        } else {
            let dateFormatter = DateFormatter()
            dateFormatter.dateStyle = .medium
            dateFormatter.timeStyle = .short
            
            for task in upcoming {
                let emoji = task.priority == .high ? "🔴" : task.priority == .medium ? "🟡" : "🟢"
                if let dueDate = task.dueDate {
                    response += "\(emoji) **\(task.title)**\n"
                    response += "   Due: \(dateFormatter.string(from: dueDate))\n\n"
                }
            }
        }
        
        addAssistantMessage(response)
    }
    
    private func showOverdue() {
        let overdue = dataManager.overdueTasks()
        
        var response = "⚠️ **Overdue Tasks**\n\n"
        
        if overdue.isEmpty {
            response += "Excellent! You have no overdue tasks. 🎉"
        } else {
            response += "You have \(overdue.count) overdue task(s):\n\n"
            
            for task in overdue.prefix(10) {
                let emoji = task.priority == .high ? "🔴" : "🟡"
                response += "\(emoji) \(task.title)\n"
                if let category = task.category {
                    response += "   Category: \(category)\n"
                }
            }
            
            response += "\n💡 Tip: Consider rescheduling these or breaking them into smaller tasks."
        }
        
        addAssistantMessage(response)
    }
    
    private func showCompleted() {
        let completed = dataManager.tasks.filter { $0.completed }.prefix(10)
        
        var response = "✅ **Recently Completed**\n\n"
        
        if completed.isEmpty {
            response += "No completed tasks yet. You got this! 💪"
        } else {
            response += "Great work! Here are your recent completions:\n\n"
            
            for task in completed {
                response += "✓ \(task.title)\n"
            }
            
            response += "\n🌟 Keep up the excellent work!"
        }
        
        addAssistantMessage(response)
    }
    
    // MARK: - Task Creation
    private func handleTaskCreation(_ message: String) {
        // Extract task details from message
        var taskTitle = message
            .replacingOccurrences(of: "create task", with: "", options: .caseInsensitive)
            .replacingOccurrences(of: "add task", with: "", options: .caseInsensitive)
            .replacingOccurrences(of: "make task", with: "", options: .caseInsensitive)
            .replacingOccurrences(of: "create", with: "", options: .caseInsensitive)
            .replacingOccurrences(of: "add", with: "", options: .caseInsensitive)
            .trimmingCharacters(in: .whitespaces)
        
        if taskTitle.isEmpty {
            addAssistantMessage("I'd love to help you create a task! What would you like the task to be called?\n\nFor example: \"Create task: Review quarterly report\"")
            return
        }
        
        // Detect priority keywords
        var priority: Priority = .medium
        if taskTitle.lowercased().contains("urgent") || taskTitle.lowercased().contains("important") || taskTitle.lowercased().contains("asap") {
            priority = .high
            taskTitle = taskTitle
                .replacingOccurrences(of: "urgent", with: "", options: .caseInsensitive)
                .replacingOccurrences(of: "important", with: "", options: .caseInsensitive)
                .replacingOccurrences(of: "asap", with: "", options: .caseInsensitive)
                .trimmingCharacters(in: .whitespaces)
        }
        
        // Create the task
        let newTask = Task(
            title: taskTitle,
            category: "General",
            priority: priority
        )
        
        dataManager.addTask(newTask)
        
        let priorityText = priority == .high ? "high priority" : "medium priority"
        addAssistantMessage("✅ Great! I've created a new \(priorityText) task:\n\n**\(taskTitle)**\n\nYou can find it in your task list. Would you like me to help with anything else?")
    }
    
    // MARK: - Help
    private func showHelp() {
        let response = """
        🤖 **I'm here to help!**
        
        Here's what I can do for you:
        
        **Summaries:**
        • "Summarize my day"
        • "Summarize this week"
        
        **Task Management:**
        • "Create task: [task name]"
        • "Show upcoming tasks"
        • "Show overdue tasks"
        • "Show completed tasks"
        
        **Analysis:**
        • "Analyze my productivity"
        • "Give me insights"
        
        **Examples:**
        • "What do I have scheduled today?"
        • "Create task: Buy groceries"
        • "Show me my upcoming tasks"
        • "How am I doing this week?"
        
        Just ask me anything! 😊
        """
        
        addAssistantMessage(response)
    }
    
    // MARK: - General Response
    private func provideGeneralResponse(_ message: String) {
        let responses = [
            "I'm not sure I understand. Try asking me to:\n• Summarize your day or week\n• Show upcoming/overdue tasks\n• Create a new task\n• Analyze your productivity",
            "Hmm, I didn't quite catch that. You can ask me about your tasks, schedule, or to create new tasks. Type 'help' to see what I can do!",
            "I'm here to help with your planning! Try asking me about your tasks for today, this week, or ask me to create a new task for you."
        ]
        
        addAssistantMessage(responses.randomElement() ?? responses[0])
    }
}

// MARK: - AI Assistant View
struct AIAssistantView: View {
    @StateObject private var assistant = AIAssistantManager()
    @State private var messageText = ""
    @FocusState private var isInputFocused: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("🤖 AI Assistant")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("Your smart planning companion")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            .padding()
            .background(Color(.systemBackground))
            .shadow(color: Color.black.opacity(0.05), radius: 2, y: 2)
            
            // Messages
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(assistant.messages) { message in
                            MessageBubble(message: message)
                                .id(message.id)
                        }
                        
                        if assistant.isProcessing {
                            HStack {
                                TypingIndicator()
                                Spacer()
                            }
                            .padding(.horizontal)
                        }
                    }
                    .padding()
                }
                .onChange(of: assistant.messages.count) { _ in
                    if let lastMessage = assistant.messages.last {
                        withAnimation {
                            proxy.scrollTo(lastMessage.id, anchor: .bottom)
                        }
                    }
                }
            }
            
            // Quick Actions
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    QuickActionButton(title: "Today", icon: "calendar") {
                        assistant.sendMessage("Summarize my day")
                    }
                    
                    QuickActionButton(title: "This Week", icon: "calendar.badge.clock") {
                        assistant.sendMessage("Summarize this week")
                    }
                    
                    QuickActionButton(title: "Upcoming", icon: "arrow.right.circle") {
                        assistant.sendMessage("Show upcoming tasks")
                    }
                    
                    QuickActionButton(title: "Insights", icon: "chart.bar") {
                        assistant.sendMessage("Analyze my productivity")
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            
            // Input Bar
            HStack(spacing: 12) {
                TextField("Ask me anything...", text: $messageText)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .focused($isInputFocused)
                    .submitLabel(.send)
                    .onSubmit {
                        sendMessage()
                    }
                
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 32))
                        .foregroundColor(messageText.isEmpty ? .gray : .accentColor)
                }
                .disabled(messageText.isEmpty)
            }
            .padding()
            .background(Color(.systemBackground))
        }
    }
    
    private func sendMessage() {
        guard !messageText.isEmpty else { return }
        assistant.sendMessage(messageText)
        messageText = ""
        isInputFocused = false
    }
}

// MARK: - Message Bubble
struct MessageBubble: View {
    let message: AIMessage
    
    var body: some View {
        HStack {
            if message.isUser {
                Spacer()
            }
            
            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .padding(12)
                    .background(message.isUser ? Color.accentColor : Color(.systemGray5))
                    .foregroundColor(message.isUser ? .white : .primary)
                    .cornerRadius(16)
                
                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: 280, alignment: message.isUser ? .trailing : .leading)
            
            if !message.isUser {
                Spacer()
            }
        }
    }
}

// MARK: - Typing Indicator
struct TypingIndicator: View {
    @State private var animating = false
    
    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(Color.gray)
                .frame(width: 8, height: 8)
                .scaleEffect(animating ? 1.0 : 0.5)
                .animation(Animation.easeInOut(duration: 0.6).repeatForever().delay(0), value: animating)
            
            Circle()
                .fill(Color.gray)
                .frame(width: 8, height: 8)
                .scaleEffect(animating ? 1.0 : 0.5)
                .animation(Animation.easeInOut(duration: 0.6).repeatForever().delay(0.2), value: animating)
            
            Circle()
                .fill(Color.gray)
                .frame(width: 8, height: 8)
                .scaleEffect(animating ? 1.0 : 0.5)
                .animation(Animation.easeInOut(duration: 0.6).repeatForever().delay(0.4), value: animating)
        }
        .padding(12)
        .background(Color(.systemGray5))
        .cornerRadius(16)
        .onAppear {
            animating = true
        }
    }
}

// MARK: - Quick Action Button
struct QuickActionButton: View {
    let title: String
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.caption)
                Text(title)
                    .font(.subheadline)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color(.systemBackground))
            .cornerRadius(20)
            .shadow(color: Color.black.opacity(0.1), radius: 2)
        }
        .foregroundColor(.primary)
    }
}
