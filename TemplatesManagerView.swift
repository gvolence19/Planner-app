import SwiftUI

// MARK: - Task Template Model
struct TaskTemplate: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var description: String?
    var category: String?
    var priority: Priority
    var duration: String?
    var defaultRecurring: RecurringOption
    var tags: [String]
    
    init(
        id: UUID = UUID(),
        name: String,
        description: String? = nil,
        category: String? = nil,
        priority: Priority = .medium,
        duration: String? = nil,
        defaultRecurring: RecurringOption = .none,
        tags: [String] = []
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.category = category
        self.priority = priority
        self.duration = duration
        self.defaultRecurring = defaultRecurring
        self.tags = tags
    }
    
    func createTask() -> Task {
        return Task(
            title: name,
            description: description,
            category: category,
            priority: priority,
            recurring: defaultRecurring,
            duration: duration
        )
    }
}

// MARK: - Templates Manager View
struct TemplatesManagerView: View {
    @StateObject private var dataManager = DataManager.shared
    @Environment(\.dismiss) var dismiss
    @State private var showingAddTemplate = false
    @State private var selectedTemplate: TaskTemplate?
    @State private var searchText = ""
    
    var filteredTemplates: [TaskTemplate] {
        if searchText.isEmpty {
            return dataManager.templates
        }
        return dataManager.templates.filter { template in
            template.name.localizedCaseInsensitiveContains(searchText) ||
            (template.description?.localizedCaseInsensitiveContains(searchText) ?? false)
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                if dataManager.templates.isEmpty {
                    emptyStateView
                } else {
                    VStack(spacing: 0) {
                        // Search Bar
                        SearchBar(text: $searchText)
                            .padding()
                        
                        // Templates List
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(filteredTemplates) { template in
                                    TemplateCard(template: template) {
                                        selectedTemplate = template
                                    }
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
            .navigationTitle("Task Templates")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddTemplate = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddTemplate) {
                AddTemplateView()
            }
            .sheet(item: $selectedTemplate) { template in
                TemplateDetailView(template: template)
            }
        }
    }
    
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "doc.badge.plus")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Templates")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Create templates for tasks you do regularly")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Button(action: { showingAddTemplate = true }) {
                Text("Create Template")
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

// MARK: - Template Card
struct TemplateCard: View {
    let template: TaskTemplate
    let onTap: () -> Void
    @StateObject private var dataManager = DataManager.shared
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Priority Indicator
                Circle()
                    .fill(template.priority.color)
                    .frame(width: 12, height: 12)
                
                VStack(alignment: .leading, spacing: 6) {
                    Text(template.name)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    HStack(spacing: 12) {
                        if let category = template.category {
                            Label(category, systemImage: "tag")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        if template.defaultRecurring != .none {
                            Label(template.defaultRecurring.displayName, systemImage: "repeat")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        if let duration = template.duration {
                            Label("\(duration) min", systemImage: "clock")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if !template.tags.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                ForEach(template.tags, id: \.self) { tag in
                                    Text(tag)
                                        .font(.caption2)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Color.accentColor.opacity(0.2))
                                        .cornerRadius(4)
                                }
                            }
                        }
                    }
                }
                
                Spacer()
                
                // Quick Use Button
                Button(action: { createTaskFromTemplate() }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundColor(.accentColor)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private func createTaskFromTemplate() {
        let task = template.createTask()
        dataManager.addTask(task)
        
        // Show confirmation (you might want to add a toast/alert here)
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
}

// MARK: - Add Template View
struct AddTemplateView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    
    @State private var name = ""
    @State private var description = ""
    @State private var selectedCategory: TaskCategory?
    @State private var priority: Priority = .medium
    @State private var duration = ""
    @State private var recurring: RecurringOption = .none
    @State private var tags: [String] = []
    @State private var newTag = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Template Details")) {
                    TextField("Template name", text: $name)
                    
                    TextEditor(text: $description)
                        .frame(minHeight: 60)
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
                
                Section(header: Text("Default Settings")) {
                    TextField("Duration (minutes)", text: $duration)
                        .keyboardType(.numberPad)
                    
                    Picker("Default Recurring", selection: $recurring) {
                        ForEach(RecurringOption.allCases, id: \.self) { option in
                            Text(option.displayName).tag(option)
                        }
                    }
                }
                
                Section(header: Text("Tags")) {
                    HStack {
                        TextField("Add tag", text: $newTag)
                        Button(action: addTag) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.accentColor)
                        }
                        .disabled(newTag.isEmpty)
                    }
                    
                    if !tags.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack {
                                ForEach(tags, id: \.self) { tag in
                                    HStack(spacing: 4) {
                                        Text(tag)
                                            .font(.caption)
                                        Button(action: { removeTag(tag) }) {
                                            Image(systemName: "xmark.circle.fill")
                                                .font(.caption)
                                        }
                                    }
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(Color.accentColor.opacity(0.2))
                                    .cornerRadius(8)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("New Template")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") { createTemplate() }
                        .disabled(name.isEmpty)
                }
            }
        }
    }
    
    private func addTag() {
        guard !newTag.isEmpty else { return }
        tags.append(newTag)
        newTag = ""
    }
    
    private func removeTag(_ tag: String) {
        tags.removeAll { $0 == tag }
    }
    
    private func createTemplate() {
        let template = TaskTemplate(
            name: name,
            description: description.isEmpty ? nil : description,
            category: selectedCategory?.name,
            priority: priority,
            duration: duration.isEmpty ? nil : duration,
            defaultRecurring: recurring,
            tags: tags
        )
        
        dataManager.addTemplate(template)
        dismiss()
    }
}

// MARK: - Template Detail View
struct TemplateDetailView: View {
    let template: TaskTemplate
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    @State private var showingEditTemplate = false
    @State private var showingDeleteAlert = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Template Info
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Circle()
                                .fill(template.priority.color)
                                .frame(width: 16, height: 16)
                            
                            Text(template.name)
                                .font(.title2)
                                .fontWeight(.bold)
                        }
                        
                        if let description = template.description, !description.isEmpty {
                            Text(description)
                                .font(.body)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.05), radius: 5)
                    
                    // Details
                    VStack(alignment: .leading, spacing: 16) {
                        if let category = template.category {
                            DetailRow(icon: "tag", title: "Category", value: category)
                        }
                        
                        DetailRow(
                            icon: "exclamationmark.circle",
                            title: "Priority",
                            value: template.priority.rawValue.capitalized,
                            color: template.priority.color
                        )
                        
                        if let duration = template.duration {
                            DetailRow(icon: "clock", title: "Duration", value: "\(duration) minutes")
                        }
                        
                        if template.defaultRecurring != .none {
                            DetailRow(
                                icon: "repeat",
                                title: "Default Recurring",
                                value: template.defaultRecurring.displayName
                            )
                        }
                        
                        if !template.tags.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Image(systemName: "tag.fill")
                                        .foregroundColor(.accentColor)
                                    Text("Tags")
                                        .font(.headline)
                                }
                                
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack {
                                        ForEach(template.tags, id: \.self) { tag in
                                            Text(tag)
                                                .font(.caption)
                                                .padding(.horizontal, 10)
                                                .padding(.vertical, 6)
                                                .background(Color.accentColor.opacity(0.2))
                                                .cornerRadius(8)
                                        }
                                    }
                                }
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.05), radius: 5)
                    
                    // Quick Actions
                    VStack(spacing: 12) {
                        Button(action: { createTaskFromTemplate() }) {
                            HStack {
                                Image(systemName: "plus.circle.fill")
                                    .font(.title3)
                                Text("Create Task from Template")
                                    .font(.headline)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                    }
                    .padding()
                }
                .padding(.vertical)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Template")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showingEditTemplate = true }) {
                            Label("Edit Template", systemImage: "pencil")
                        }
                        
                        Button(role: .destructive, action: { showingDeleteAlert = true }) {
                            Label("Delete Template", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
        .sheet(isPresented: $showingEditTemplate) {
            EditTemplateView(template: template)
        }
        .alert("Delete Template", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                dataManager.deleteTemplate(template)
                dismiss()
            }
        } message: {
            Text("Are you sure you want to delete this template?")
        }
    }
    
    private func createTaskFromTemplate() {
        let task = template.createTask()
        dataManager.addTask(task)
        dismiss()
        
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
}

// MARK: - Edit Template View
struct EditTemplateView: View {
    let template: TaskTemplate
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    
    @State private var name: String
    @State private var description: String
    @State private var selectedCategory: TaskCategory?
    @State private var priority: Priority
    @State private var duration: String
    @State private var recurring: RecurringOption
    @State private var tags: [String]
    @State private var newTag = ""
    
    init(template: TaskTemplate) {
        self.template = template
        _name = State(initialValue: template.name)
        _description = State(initialValue: template.description ?? "")
        _priority = State(initialValue: template.priority)
        _duration = State(initialValue: template.duration ?? "")
        _recurring = State(initialValue: template.defaultRecurring)
        _tags = State(initialValue: template.tags)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Template Details")) {
                    TextField("Template name", text: $name)
                    TextEditor(text: $description)
                        .frame(minHeight: 60)
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
                
                Section(header: Text("Default Settings")) {
                    TextField("Duration (minutes)", text: $duration)
                        .keyboardType(.numberPad)
                    
                    Picker("Default Recurring", selection: $recurring) {
                        ForEach(RecurringOption.allCases, id: \.self) { option in
                            Text(option.displayName).tag(option)
                        }
                    }
                }
                
                Section(header: Text("Tags")) {
                    HStack {
                        TextField("Add tag", text: $newTag)
                        Button(action: addTag) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(.accentColor)
                        }
                        .disabled(newTag.isEmpty)
                    }
                    
                    if !tags.isEmpty {
                        ForEach(tags, id: \.self) { tag in
                            HStack {
                                Text(tag)
                                Spacer()
                                Button(action: { removeTag(tag) }) {
                                    Image(systemName: "trash")
                                        .foregroundColor(.red)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Edit Template")
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
        .onAppear {
            if let categoryName = template.category {
                selectedCategory = dataManager.categories.first { $0.name == categoryName }
            }
        }
    }
    
    private func addTag() {
        guard !newTag.isEmpty else { return }
        tags.append(newTag)
        newTag = ""
    }
    
    private func removeTag(_ tag: String) {
        tags.removeAll { $0 == tag }
    }
    
    private func saveChanges() {
        let updatedTemplate = TaskTemplate(
            id: template.id,
            name: name,
            description: description.isEmpty ? nil : description,
            category: selectedCategory?.name,
            priority: priority,
            duration: duration.isEmpty ? nil : duration,
            defaultRecurring: recurring,
            tags: tags
        )
        
        dataManager.updateTemplate(updatedTemplate)
        dismiss()
    }
}

// MARK: - Preview
struct TemplatesManagerView_Previews: PreviewProvider {
    static var previews: some View {
        TemplatesManagerView()
    }
}
