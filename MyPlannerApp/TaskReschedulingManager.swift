import SwiftUI
import Foundation

// MARK: - Task Rescheduling Manager
class TaskReschedulingManager: ObservableObject {
    @Published var missedTasks: [Task] = []
    @Published var rescheduleSuggestions: [UUID: Date] = [:]
    
    private let dataManager = DataManager.shared
    
    // MARK: - Detect Missed Tasks
    func detectMissedTasks() -> [Task] {
        let now = Date()
        let calendar = Calendar.current
        
        missedTasks = dataManager.tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return !task.completed && dueDate < now && !calendar.isDateInToday(dueDate)
        }
        
        // Generate smart suggestions
        generateRescheduleSuggestions()
        
        return missedTasks
    }
    
    // MARK: - Smart Rescheduling Suggestions
    private func generateRescheduleSuggestions() {
        let calendar = Calendar.current
        let now = Date()
        
        for task in missedTasks {
            guard let dueDate = task.dueDate else { continue }
            
            // Calculate how overdue
            let daysOverdue = calendar.dateComponents([.day], from: dueDate, to: now).day ?? 0
            
            // Smart suggestion based on task priority and how overdue
            var suggestedDate: Date
            
            switch task.priority {
            case .high:
                // High priority: suggest today or tomorrow
                if daysOverdue <= 7 {
                    suggestedDate = now
                } else {
                    suggestedDate = calendar.date(byAdding: .day, value: 1, to: now) ?? now
                }
                
            case .medium:
                // Medium priority: suggest within next few days
                if daysOverdue <= 3 {
                    suggestedDate = calendar.date(byAdding: .day, value: 1, to: now) ?? now
                } else if daysOverdue <= 14 {
                    suggestedDate = calendar.date(byAdding: .day, value: 2, to: now) ?? now
                } else {
                    suggestedDate = calendar.date(byAdding: .day, value: 7, to: now) ?? now
                }
                
            case .low:
                // Low priority: suggest next week
                if daysOverdue <= 7 {
                    suggestedDate = calendar.date(byAdding: .day, value: 3, to: now) ?? now
                } else {
                    suggestedDate = calendar.date(byAdding: .weekOfYear, value: 1, to: now) ?? now
                }
            }
            
            // Consider recurring pattern
            if task.recurring != .none {
                suggestedDate = getNextRecurringDate(for: task, from: now)
            }
            
            rescheduleSuggestions[task.id] = suggestedDate
        }
    }
    
    private func getNextRecurringDate(for task: Task, from date: Date) -> Date {
        let calendar = Calendar.current
        
        switch task.recurring {
        case .daily:
            return calendar.date(byAdding: .day, value: 1, to: date) ?? date
        case .weekly:
            return calendar.date(byAdding: .weekOfYear, value: 1, to: date) ?? date
        case .biweekly:
            return calendar.date(byAdding: .weekOfYear, value: 2, to: date) ?? date
        case .monthly:
            return calendar.date(byAdding: .month, value: 1, to: date) ?? date
        case .none:
            return date
        }
    }
    
    // MARK: - Reschedule Tasks
    func rescheduleTask(_ task: Task, to date: Date) {
        var updatedTask = task
        updatedTask.dueDate = date
        dataManager.updateTask(updatedTask)
        
        // Remove from missed tasks
        missedTasks.removeAll { $0.id == task.id }
        rescheduleSuggestions.removeValue(forKey: task.id)
    }
    
    func rescheduleTasks(_ tasks: [Task], to date: Date) {
        for task in tasks {
            rescheduleTask(task, to: date)
        }
    }
    
    func rescheduleAllToSuggested() {
        for task in missedTasks {
            if let suggestedDate = rescheduleSuggestions[task.id] {
                rescheduleTask(task, to: suggestedDate)
            }
        }
    }
    
    // MARK: - Bulk Actions
    func deleteAllMissedTasks() {
        for task in missedTasks {
            dataManager.deleteTask(task)
        }
        missedTasks.removeAll()
        rescheduleSuggestions.removeAll()
    }
    
    func completeAllMissedTasks() {
        for task in missedTasks {
            dataManager.toggleTaskCompletion(task)
        }
        missedTasks.removeAll()
        rescheduleSuggestions.removeAll()
    }
}

// MARK: - Missed Tasks View
struct MissedTasksView: View {
    @StateObject private var reschedulingManager = TaskReschedulingManager()
    @Environment(\.dismiss) var dismiss
    @State private var selectedTasks: Set<UUID> = []
    @State private var showingBulkReschedule = false
    @State private var bulkRescheduleDate = Date()
    
    var body: some View {
        NavigationView {
            Group {
                if reschedulingManager.missedTasks.isEmpty {
                    emptyStateView
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Summary Card
                            summaryCard
                            
                            // Bulk Actions
                            bulkActionsCard
                            
                            // Missed Tasks List
                            ForEach(reschedulingManager.missedTasks) { task in
                                MissedTaskCard(
                                    task: task,
                                    suggestedDate: reschedulingManager.rescheduleSuggestions[task.id],
                                    isSelected: selectedTasks.contains(task.id),
                                    onToggleSelection: { toggleSelection(task.id) },
                                    onReschedule: { date in
                                        reschedulingManager.rescheduleTask(task, to: date)
                                    }
                                )
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Missed Tasks")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                }
                
                if !reschedulingManager.missedTasks.isEmpty {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Menu {
                            Button(action: { reschedulingManager.rescheduleAllToSuggested() }) {
                                Label("Reschedule All (Smart)", systemImage: "calendar.badge.clock")
                            }
                            
                            Button(action: { reschedulingManager.completeAllMissedTasks() }) {
                                Label("Mark All Complete", systemImage: "checkmark.circle")
                            }
                            
                            Button(role: .destructive, action: { reschedulingManager.deleteAllMissedTasks() }) {
                                Label("Delete All", systemImage: "trash")
                            }
                        } label: {
                            Image(systemName: "ellipsis.circle")
                        }
                    }
                }
            }
            .onAppear {
                _ = reschedulingManager.detectMissedTasks()
            }
            .sheet(isPresented: $showingBulkReschedule) {
                BulkRescheduleView(
                    selectedCount: selectedTasks.count,
                    rescheduleDate: $bulkRescheduleDate,
                    onReschedule: {
                        let tasks = reschedulingManager.missedTasks.filter { selectedTasks.contains($0.id) }
                        reschedulingManager.rescheduleTasks(tasks, to: bulkRescheduleDate)
                        selectedTasks.removeAll()
                        showingBulkReschedule = false
                    }
                )
            }
        }
    }
    
    // MARK: - Summary Card
    private var summaryCard: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.title2)
                    .foregroundColor(.orange)
                
                VStack(alignment: .leading) {
                    Text("\(reschedulingManager.missedTasks.count) Missed Tasks")
                        .font(.headline)
                    Text("Tasks that are overdue")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            
            // Priority breakdown
            HStack(spacing: 16) {
                PriorityBadge(
                    priority: .high,
                    count: reschedulingManager.missedTasks.filter { $0.priority == .high }.count
                )
                PriorityBadge(
                    priority: .medium,
                    count: reschedulingManager.missedTasks.filter { $0.priority == .medium }.count
                )
                PriorityBadge(
                    priority: .low,
                    count: reschedulingManager.missedTasks.filter { $0.priority == .low }.count
                )
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5)
    }
    
    // MARK: - Bulk Actions Card
    private var bulkActionsCard: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Bulk Actions")
                    .font(.headline)
                Spacer()
                if !selectedTasks.isEmpty {
                    Text("\(selectedTasks.count) selected")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack(spacing: 12) {
                Button(action: selectAll) {
                    Label(selectedTasks.count == reschedulingManager.missedTasks.count ? "Deselect All" : "Select All",
                          systemImage: "checkmark.circle")
                    .font(.caption)
                }
                .buttonStyle(.bordered)
                
                Button(action: { showingBulkReschedule = true }) {
                    Label("Reschedule Selected", systemImage: "calendar")
                        .font(.caption)
                }
                .buttonStyle(.borderedProminent)
                .disabled(selectedTasks.isEmpty)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)
            
            Text("All Caught Up!")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("You have no missed tasks")
                .font(.body)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private func toggleSelection(_ id: UUID) {
        if selectedTasks.contains(id) {
            selectedTasks.remove(id)
        } else {
            selectedTasks.insert(id)
        }
    }
    
    private func selectAll() {
        if selectedTasks.count == reschedulingManager.missedTasks.count {
            selectedTasks.removeAll()
        } else {
            selectedTasks = Set(reschedulingManager.missedTasks.map { $0.id })
        }
    }
}

// MARK: - Missed Task Card
struct MissedTaskCard: View {
    let task: Task
    let suggestedDate: Date?
    let isSelected: Bool
    let onToggleSelection: () -> Void
    let onReschedule: (Date) -> Void
    
    @State private var showingCustomDate = false
    @State private var customDate = Date()
    
    var daysOverdue: Int {
        guard let dueDate = task.dueDate else { return 0 }
        return Calendar.current.dateComponents([.day], from: dueDate, to: Date()).day ?? 0
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Button(action: onToggleSelection) {
                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(isSelected ? .accentColor : .gray)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.title)
                        .font(.headline)
                    
                    HStack(spacing: 8) {
                        Circle()
                            .fill(task.priority.color)
                            .frame(width: 8, height: 8)
                        
                        if let dueDate = task.dueDate {
                            Text("Due: \(formatDate(dueDate))")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Text("\(daysOverdue) days overdue")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
                
                Spacer()
            }
            
            Divider()
            
            // Quick Actions
            HStack(spacing: 8) {
                if let suggested = suggestedDate {
                    Button(action: { onReschedule(suggested) }) {
                        HStack(spacing: 4) {
                            Image(systemName: "sparkles")
                                .font(.caption)
                            Text(formatSuggestion(suggested))
                                .font(.caption)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.accentColor.opacity(0.1))
                        .foregroundColor(.accentColor)
                        .cornerRadius(8)
                    }
                }
                
                Button(action: { showingCustomDate = true }) {
                    Text("Custom")
                        .font(.caption)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
        )
        .shadow(color: Color.black.opacity(0.05), radius: 5)
        .sheet(isPresented: $showingCustomDate) {
            CustomRescheduleView(
                taskTitle: task.title,
                selectedDate: $customDate,
                onReschedule: {
                    onReschedule(customDate)
                    showingCustomDate = false
                }
            )
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: date)
    }
    
    private func formatSuggestion(_ date: Date) -> String {
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
}


// MARK: - Custom Reschedule View
struct CustomRescheduleView: View {
    let taskTitle: String
    @Binding var selectedDate: Date
    let onReschedule: () -> Void
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack {
                DatePicker("New Due Date",
                          selection: $selectedDate,
                          in: Date()...,
                          displayedComponents: [.date, .hourAndMinute])
                    .datePickerStyle(.graphical)
                    .padding()
                
                Spacer()
            }
            .navigationTitle("Reschedule")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Reschedule") {
                        onReschedule()
                    }
                }
            }
        }
    }
}

// MARK: - Bulk Reschedule View
struct BulkRescheduleView: View {
    let selectedCount: Int
    @Binding var rescheduleDate: Date
    let onReschedule: () -> Void
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack {
                Text("Reschedule \(selectedCount) tasks")
                    .font(.headline)
                    .padding()
                
                DatePicker("New Due Date",
                          selection: $rescheduleDate,
                          in: Date()...,
                          displayedComponents: [.date, .hourAndMinute])
                    .datePickerStyle(.graphical)
                    .padding()
                
                Spacer()
            }
            .navigationTitle("Bulk Reschedule")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Reschedule") {
                        onReschedule()
                    }
                }
            }
        }
    }
}

// MARK: - Preview
struct MissedTasksView_Previews: PreviewProvider {
    static var previews: some View {
        MissedTasksView()
    }
}
