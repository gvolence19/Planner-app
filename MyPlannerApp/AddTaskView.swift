import SwiftUI

struct AddTaskView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    
    @State private var title = ""
    @State private var description = ""
    @State private var selectedCategory: TaskCategory?
    @State private var priority: Priority = .medium
    @State private var dueDate = Date()
    @State private var hasDueDate = false
    @State private var startTime = ""
    @State private var duration = ""
    @State private var recurring: RecurringOption = .none
    @State private var location = ""
    
    var body: some View {
        NavigationView {
            Form {
                // Title Section
                Section(header: Text("Task Details")) {
                    TextField("Task title", text: $title)
                    
                    TextEditor(text: $description)
                        .frame(minHeight: 80)
                        .overlay(
                            Group {
                                if description.isEmpty {
                                    Text("Description (optional)")
                                        .foregroundColor(.gray)
                                        .padding(.top, 8)
                                        .padding(.leading, 5)
                                }
                            },
                            alignment: .topLeading
                        )
                }
                
                // Category Section
                Section(header: Text("Category")) {
                    Picker("Category", selection: $selectedCategory) {
                        Text("None").tag(nil as TaskCategory?)
                        ForEach(dataManager.categories) { category in
                            HStack {
                                Text(category.icon)
                                Text(category.name)
                            }
                            .tag(category as TaskCategory?)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                // Priority Section
                Section(header: Text("Priority")) {
                    Picker("Priority", selection: $priority) {
                        ForEach(Priority.allCases, id: \.self) { priority in
                            HStack {
                                Text(priority.emoji)
                                Text(priority.rawValue.capitalized)
                            }
                            .tag(priority)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                // Due Date Section
                Section(header: Text("Due Date")) {
                    Toggle("Set due date", isOn: $hasDueDate)
                    
                    if hasDueDate {
                        DatePicker("Date", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                    }
                }
                
                // Time and Duration Section
                Section(header: Text("Time & Duration")) {
                    TextField("Start time (e.g., 09:00)", text: $startTime)
                        .keyboardType(.numbersAndPunctuation)
                    
                    TextField("Duration (minutes)", text: $duration)
                        .keyboardType(.numberPad)
                }
                
                // Recurring Section
                Section(header: Text("Recurring")) {
                    Picker("Repeat", selection: $recurring) {
                        ForEach(RecurringOption.allCases, id: \.self) { option in
                            Text(option.displayName).tag(option)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                // Location Section
                Section(header: Text("Location")) {
                    TextField("Add location (optional)", text: $location)
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveTask()
                    }
                    .disabled(title.isEmpty)
                }
            }
        }
    }
    
    private func saveTask() {
        let newTask = Task(
            title: title,
            description: description.isEmpty ? nil : description,
            dueDate: hasDueDate ? dueDate : nil,
            category: selectedCategory?.name,
            priority: priority,
            recurring: recurring,
            location: location.isEmpty ? nil : location,
            startTime: startTime.isEmpty ? nil : startTime,
            duration: duration.isEmpty ? nil : duration
        )
        
        dataManager.addTask(newTask)
        dismiss()
    }
}

// MARK: - Task Detail View
struct TaskDetailView: View {
    let task: Task
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    @State private var isEditing = false
    @State private var showingDeleteAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Title
                    HStack {
                        Button(action: { dataManager.toggleTaskCompletion(task) }) {
                            Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                                .font(.system(size: 32))
                                .foregroundColor(task.completed ? .green : .gray)
                        }
                        
                        Text(task.title)
                            .font(.title2)
                            .fontWeight(.bold)
                            .strikethrough(task.completed)
                    }
                    .padding(.horizontal)
                    
                    Divider()
                    
                    // Details
                    VStack(alignment: .leading, spacing: 16) {
                        if let description = task.description, !description.isEmpty {
                            DetailRow(icon: "text.alignleft", title: "Description", value: description)
                        }
                        
                        if let category = task.category {
                            DetailRow(icon: "tag", title: "Category", value: category)
                        }
                        
                        DetailRow(icon: "exclamationmark.circle", title: "Priority", 
                                value: task.priority.rawValue.capitalized, 
                                color: task.priority.color)
                        
                        if let dueDate = task.dueDate {
                            DetailRow(icon: "calendar", title: "Due Date", 
                                    value: formatFullDate(dueDate))
                        }
                        
                        if let startTime = task.startTime {
                            DetailRow(icon: "clock", title: "Start Time", value: startTime)
                        }
                        
                        if let duration = task.duration {
                            DetailRow(icon: "timer", title: "Duration", value: "\(duration) minutes")
                        }
                        
                        if task.recurring != .none {
                            DetailRow(icon: "repeat", title: "Recurring", value: task.recurring.displayName)
                        }
                        
                        if let location = task.location {
                            DetailRow(icon: "mappin.circle", title: "Location", value: location)
                        }
                        
                        DetailRow(icon: "calendar.badge.clock", title: "Created", 
                                value: formatFullDate(task.createdAt))
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .navigationTitle("Task Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { isEditing = true }) {
                            Label("Edit", systemImage: "pencil")
                        }
                        
                        Button(role: .destructive, action: { showingDeleteAlert = true }) {
                            Label("Delete", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
        .sheet(isPresented: $isEditing) {
            EditTaskView(task: task)
        }
        .alert("Delete Task", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                dataManager.deleteTask(task)
                dismiss()
            }
        } message: {
            Text("Are you sure you want to delete this task?")
        }
    }
    
    private func formatFullDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Detail Row
struct DetailRow: View {
    let icon: String
    let title: String
    let value: String
    var color: Color?
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color ?? .accentColor)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text(value)
                    .font(.body)
            }
        }
    }
}

// MARK: - Edit Task View
struct EditTaskView: View {
    let task: Task
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    
    @State private var title: String
    @State private var description: String
    @State private var selectedCategory: TaskCategory?
    @State private var priority: Priority
    @State private var dueDate: Date
    @State private var hasDueDate: Bool
    @State private var startTime: String
    @State private var duration: String
    @State private var recurring: RecurringOption
    @State private var location: String
    
    init(task: Task) {
        self.task = task
        _title = State(initialValue: task.title)
        _description = State(initialValue: task.description ?? "")
        _priority = State(initialValue: task.priority)
        _dueDate = State(initialValue: task.dueDate ?? Date())
        _hasDueDate = State(initialValue: task.dueDate != nil)
        _startTime = State(initialValue: task.startTime ?? "")
        _duration = State(initialValue: task.duration ?? "")
        _recurring = State(initialValue: task.recurring)
        _location = State(initialValue: task.location ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Task Details")) {
                    TextField("Task title", text: $title)
                    TextEditor(text: $description)
                        .frame(minHeight: 80)
                }
                
                Section(header: Text("Category")) {
                    Picker("Category", selection: $selectedCategory) {
                        Text("None").tag(nil as TaskCategory?)
                        ForEach(dataManager.categories) { category in
                            HStack {
                                Text(category.icon)
                                Text(category.name)
                            }
                            .tag(category as TaskCategory?)
                        }
                    }
                }
                
                Section(header: Text("Priority")) {
                    Picker("Priority", selection: $priority) {
                        ForEach(Priority.allCases, id: \.self) { priority in
                            HStack {
                                Text(priority.emoji)
                                Text(priority.rawValue.capitalized)
                            }
                            .tag(priority)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section(header: Text("Due Date")) {
                    Toggle("Set due date", isOn: $hasDueDate)
                    if hasDueDate {
                        DatePicker("Date", selection: $dueDate, displayedComponents: [.date, .hourAndMinute])
                    }
                }
                
                Section(header: Text("Time & Duration")) {
                    TextField("Start time (e.g., 09:00)", text: $startTime)
                    TextField("Duration (minutes)", text: $duration)
                        .keyboardType(.numberPad)
                }
                
                Section(header: Text("Recurring")) {
                    Picker("Repeat", selection: $recurring) {
                        ForEach(RecurringOption.allCases, id: \.self) { option in
                            Text(option.displayName).tag(option)
                        }
                    }
                }
                
                Section(header: Text("Location")) {
                    TextField("Add location (optional)", text: $location)
                }
            }
            .navigationTitle("Edit Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") { saveChanges() }
                        .disabled(title.isEmpty)
                }
            }
        }
        .onAppear {
            if let categoryName = task.category {
                selectedCategory = dataManager.categories.first { $0.name == categoryName }
            }
        }
    }
    
    private func saveChanges() {
        let updatedTask = Task(
            id: task.id,
            title: title,
            description: description.isEmpty ? nil : description,
            completed: task.completed,
            dueDate: hasDueDate ? dueDate : nil,
            category: selectedCategory?.name,
            priority: priority,
            createdAt: task.createdAt,
            recurring: recurring,
            location: location.isEmpty ? nil : location,
            startTime: startTime.isEmpty ? nil : startTime,
            duration: duration.isEmpty ? nil : duration
        )
        
        dataManager.updateTask(updatedTask)
        dismiss()
    }
}

// MARK: - Preview
struct AddTaskView_Previews: PreviewProvider {
    static var previews: some View {
        AddTaskView()
    }
}
