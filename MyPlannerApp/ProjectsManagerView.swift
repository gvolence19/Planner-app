import SwiftUI

// MARK: - Projects Manager View
struct ProjectsManagerView: View {
    @StateObject private var dataManager = DataManager.shared
    @Environment(\.dismiss) var dismiss
    @State private var showingAddProject = false
    @State private var selectedProject: Project?
    @State private var showingProjectDetail = false
    
    var body: some View {
        NavigationView {
            ZStack {
                if dataManager.projects.isEmpty {
                    emptyStateView
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(dataManager.projects) { project in
                                ProjectCard(project: project) {
                                    selectedProject = project
                                    showingProjectDetail = true
                                }
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Projects")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddProject = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddProject) {
                AddProjectView()
            }
            .sheet(item: $selectedProject) { project in
                ProjectDetailView(project: project)
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "folder.badge.plus")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Projects")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Create projects to organize related tasks")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: { showingAddProject = true }) {
                Text("Create Project")
                    .font(.headline)
                    .foregroundColor(.white)
                    .padding(.horizontal, 30)
                    .padding(.vertical, 15)
                    .background(Color.accentColor)
                    .cornerRadius(10)
            }
        }
    }
}

// MARK: - Project Card
struct ProjectCard: View {
    let project: Project
    let onTap: () -> Void
    @StateObject private var dataManager = DataManager.shared
    
    var projectTasks: [Task] {
        dataManager.tasks.filter { project.tasks.contains($0.id) }
    }
    
    var completedTasksCount: Int {
        projectTasks.filter { $0.completed }.count
    }
    
    var progress: Double {
        guard !projectTasks.isEmpty else { return 0 }
        return Double(completedTasksCount) / Double(projectTasks.count)
    }
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Circle()
                        .fill(projectColor)
                        .frame(width: 12, height: 12)
                    
                    Text(project.name)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                if let description = project.description, !description.isEmpty {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                
                HStack(spacing: 16) {
                    Label("\(projectTasks.count) tasks", systemImage: "checklist")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Label("\(completedTasksCount) completed", systemImage: "checkmark.circle")
                        .font(.caption)
                        .foregroundColor(.green)
                }
                
                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        Rectangle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 6)
                            .cornerRadius(3)
                        
                        Rectangle()
                            .fill(projectColor)
                            .frame(width: geometry.size.width * progress, height: 6)
                            .cornerRadius(3)
                    }
                }
                .frame(height: 6)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private var projectColor: Color {
        switch project.color {
        case "bg-blue-500": return .blue
        case "bg-green-500": return .green
        case "bg-red-500": return .red
        case "bg-purple-500": return .purple
        case "bg-orange-500": return .orange
        case "bg-pink-500": return .pink
        default: return .blue
        }
    }
}

// MARK: - Add Project View
struct AddProjectView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    
    @State private var name = ""
    @State private var description = ""
    @State private var selectedColor = "bg-blue-500"
    
    private let colors = [
        ("Blue", "bg-blue-500", Color.blue),
        ("Green", "bg-green-500", Color.green),
        ("Red", "bg-red-500", Color.red),
        ("Purple", "bg-purple-500", Color.purple),
        ("Orange", "bg-orange-500", Color.orange),
        ("Pink", "bg-pink-500", Color.pink)
    ]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Project Details")) {
                    TextField("Project name", text: $name)
                    
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
                
                Section(header: Text("Color")) {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 12) {
                        ForEach(colors, id: \.1) { colorName, colorValue, color in
                            Button(action: { selectedColor = colorValue }) {
                                VStack(spacing: 8) {
                                    Circle()
                                        .fill(color)
                                        .frame(width: 50, height: 50)
                                        .overlay(
                                            Circle()
                                                .stroke(selectedColor == colorValue ? Color.primary : Color.clear, lineWidth: 3)
                                        )
                                    
                                    Text(colorName)
                                        .font(.caption)
                                        .foregroundColor(.primary)
                                }
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            .navigationTitle("New Project")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createProject()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
    
    private func createProject() {
        let project = Project(
            name: name,
            description: description.isEmpty ? nil : description,
            color: selectedColor
        )
        
        dataManager.addProject(project)
        dismiss()
    }
}

// MARK: - Project Detail View
struct ProjectDetailView: View {
    let project: Project
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    @State private var showingEditProject = false
    @State private var showingDeleteAlert = false
    @State private var showingAddTask = false
    
    var projectTasks: [Task] {
        dataManager.tasks.filter { project.tasks.contains($0.id) }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Project Header
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Circle()
                                .fill(projectColor)
                                .frame(width: 20, height: 20)
                            
                            Text(project.name)
                                .font(.title2)
                                .fontWeight(.bold)
                        }
                        
                        if let description = project.description, !description.isEmpty {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                        
                        HStack(spacing: 20) {
                            StatCard(
                                icon: "checklist",
                                title: "Total Tasks",
                                value: "\(projectTasks.count)"
                            )
                            
                            StatCard(
                                icon: "checkmark.circle.fill",
                                title: "Completed",
                                value: "\(projectTasks.filter { $0.completed }.count)"
                            )
                            
                            StatCard(
                                icon: "clock.fill",
                                title: "Remaining",
                                value: "\(projectTasks.filter { !$0.completed }.count)"
                            )
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.05), radius: 5)
                    
                    // Tasks Section
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Tasks")
                                .font(.headline)
                            
                            Spacer()
                            
                            Button(action: { showingAddTask = true }) {
                                Label("Add Task", systemImage: "plus.circle.fill")
                                    .font(.subheadline)
                            }
                        }
                        
                        if projectTasks.isEmpty {
                            VStack(spacing: 12) {
                                Image(systemName: "tray")
                                    .font(.system(size: 40))
                                    .foregroundColor(.gray)
                                
                                Text("No tasks in this project")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 40)
                        } else {
                            ForEach(projectTasks) { task in
                                ProjectTaskRow(task: task, projectId: project.id)
                            }
                        }
                    }
                    .padding()
                }
                .padding(.vertical)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Project Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showingEditProject = true }) {
                            Label("Edit Project", systemImage: "pencil")
                        }
                        
                        Button(role: .destructive, action: { showingDeleteAlert = true }) {
                            Label("Delete Project", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
        .sheet(isPresented: $showingEditProject) {
            EditProjectView(project: project)
        }
        .sheet(isPresented: $showingAddTask) {
            AddTaskToProjectView(project: project)
        }
        .alert("Delete Project", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                dataManager.deleteProject(project)
                dismiss()
            }
        } message: {
            Text("Are you sure you want to delete this project? Tasks will not be deleted.")
        }
    }
    
    private var projectColor: Color {
        switch project.color {
        case "bg-blue-500": return .blue
        case "bg-green-500": return .green
        case "bg-red-500": return .red
        case "bg-purple-500": return .purple
        case "bg-orange-500": return .orange
        case "bg-pink-500": return .pink
        default: return .blue
        }
    }
}

// MARK: - Stat Card
struct StatCard: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.accentColor)
            
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

// MARK: - Project Task Row
struct ProjectTaskRow: View {
    let task: Task
    let projectId: UUID
    @StateObject private var dataManager = DataManager.shared
    @State private var showingDetail = false
    
    var body: some View {
        Button(action: { showingDetail = true }) {
            HStack(spacing: 12) {
                Button(action: { dataManager.toggleTaskCompletion(task) }) {
                    Image(systemName: task.completed ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 20))
                        .foregroundColor(task.completed ? .green : .gray)
                }
                .buttonStyle(PlainButtonStyle())
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.title)
                        .font(.body)
                        .foregroundColor(.primary)
                        .strikethrough(task.completed)
                    
                    HStack(spacing: 8) {
                        if let dueDate = task.dueDate {
                            Label(formatDate(dueDate), systemImage: "calendar")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        Circle()
                            .fill(task.priority.color)
                            .frame(width: 8, height: 8)
                    }
                }
                
                Spacer()
                
                Button(action: { removeTaskFromProject() }) {
                    Image(systemName: "minus.circle")
                        .foregroundColor(.red)
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
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: date)
    }
    
    private func removeTaskFromProject() {
        var updatedProject = dataManager.projects.first { $0.id == projectId }
        updatedProject?.tasks.removeAll { $0 == task.id }
        if let project = updatedProject {
            dataManager.updateProject(project)
        }
    }
}

// MARK: - Edit Project View
struct EditProjectView: View {
    let project: Project
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    
    @State private var name: String
    @State private var description: String
    @State private var selectedColor: String
    
    private let colors = [
        ("Blue", "bg-blue-500", Color.blue),
        ("Green", "bg-green-500", Color.green),
        ("Red", "bg-red-500", Color.red),
        ("Purple", "bg-purple-500", Color.purple),
        ("Orange", "bg-orange-500", Color.orange),
        ("Pink", "bg-pink-500", Color.pink)
    ]
    
    init(project: Project) {
        self.project = project
        _name = State(initialValue: project.name)
        _description = State(initialValue: project.description ?? "")
        _selectedColor = State(initialValue: project.color)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Project Details")) {
                    TextField("Project name", text: $name)
                    TextEditor(text: $description)
                        .frame(minHeight: 80)
                }
                
                Section(header: Text("Color")) {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 12) {
                        ForEach(colors, id: \.1) { colorName, colorValue, color in
                            Button(action: { selectedColor = colorValue }) {
                                VStack(spacing: 8) {
                                    Circle()
                                        .fill(color)
                                        .frame(width: 50, height: 50)
                                        .overlay(
                                            Circle()
                                                .stroke(selectedColor == colorValue ? Color.primary : Color.clear, lineWidth: 3)
                                        )
                                    Text(colorName)
                                        .font(.caption)
                                        .foregroundColor(.primary)
                                }
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            .navigationTitle("Edit Project")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") { saveChanges() }
                        .disabled(name.isEmpty)
                }
            }
        }
    }
    
    private func saveChanges() {
        let updatedProject = Project(
            id: project.id,
            name: name,
            description: description.isEmpty ? nil : description,
            color: selectedColor,
            createdAt: project.createdAt,
            tasks: project.tasks
        )
        
        dataManager.updateProject(updatedProject)
        dismiss()
    }
}

// MARK: - Add Task to Project View
struct AddTaskToProjectView: View {
    let project: Project
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    @State private var selectedTasks: Set<UUID> = []
    
    var availableTasks: [Task] {
        dataManager.tasks.filter { !project.tasks.contains($0.id) }
    }
    
    var body: some View {
        NavigationView {
            List {
                ForEach(availableTasks) { task in
                    Button(action: { toggleTask(task.id) }) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(task.title)
                                    .font(.body)
                                
                                if let category = task.category {
                                    Text(category)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Spacer()
                            
                            if selectedTasks.contains(task.id) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.accentColor)
                            } else {
                                Image(systemName: "circle")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .navigationTitle("Add Tasks")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add (\(selectedTasks.count))") {
                        addTasksToProject()
                    }
                    .disabled(selectedTasks.isEmpty)
                }
            }
        }
    }
    
    private func toggleTask(_ id: UUID) {
        if selectedTasks.contains(id) {
            selectedTasks.remove(id)
        } else {
            selectedTasks.insert(id)
        }
    }
    
    private func addTasksToProject() {
        var updatedProject = project
        updatedProject.tasks.append(contentsOf: selectedTasks)
        dataManager.updateProject(updatedProject)
        dismiss()
    }
}

// MARK: - Preview
struct ProjectsManagerView_Previews: PreviewProvider {
    static var previews: some View {
        ProjectsManagerView()
    }
}
