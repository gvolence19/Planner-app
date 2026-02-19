import Foundation
import SwiftUI
import Combine

// MARK: - Data Manager
class DataManager: ObservableObject {
    static let shared = DataManager()
    
    @Published var tasks: [Task] = []
    @Published var categories: [TaskCategory] = TaskCategory.defaultCategories
    @Published var groceryItems: [GroceryItem] = []
    @Published var projects: [Project] = []
    @Published var templates: [TaskTemplate] = []
    @Published var isPremium: Bool = false
    
    private let tasksKey = "saved_tasks"
    private let categoriesKey = "saved_categories"
    private let groceryKey = "saved_grocery"
    private let projectsKey = "saved_projects"
    private let templatesKey = "saved_templates"
    private let premiumKey = "is_premium"
    
    private init() {
        loadData()
    }
    
    // MARK: - Load Data
    private func loadData() {
        // Load tasks
        if let tasksData = UserDefaults.standard.data(forKey: tasksKey),
           let decodedTasks = try? JSONDecoder().decode([Task].self, from: tasksData) {
            self.tasks = decodedTasks
        }
        
        // Load categories
        if let categoriesData = UserDefaults.standard.data(forKey: categoriesKey),
           let decodedCategories = try? JSONDecoder().decode([TaskCategory].self, from: categoriesData) {
            self.categories = decodedCategories
        }
        
        // Load grocery items
        if let groceryData = UserDefaults.standard.data(forKey: groceryKey),
           let decodedGrocery = try? JSONDecoder().decode([GroceryItem].self, from: groceryData) {
            self.groceryItems = decodedGrocery
        }
        
        // Load projects
        if let projectsData = UserDefaults.standard.data(forKey: projectsKey),
           let decodedProjects = try? JSONDecoder().decode([Project].self, from: projectsData) {
            self.projects = decodedProjects
        }
        
        // Load templates
        if let templatesData = UserDefaults.standard.data(forKey: templatesKey),
           let decodedTemplates = try? JSONDecoder().decode([TaskTemplate].self, from: templatesData) {
            self.templates = decodedTemplates
        }
        
        // Load premium status
        self.isPremium = UserDefaults.standard.bool(forKey: premiumKey)
    }
    
    // MARK: - Save Data
    func saveTasks() {
        if let encoded = try? JSONEncoder().encode(tasks) {
            UserDefaults.standard.set(encoded, forKey: tasksKey)
        }
    }
    
    func saveCategories() {
        if let encoded = try? JSONEncoder().encode(categories) {
            UserDefaults.standard.set(encoded, forKey: categoriesKey)
        }
    }
    
    func saveGroceryItems() {
        if let encoded = try? JSONEncoder().encode(groceryItems) {
            UserDefaults.standard.set(encoded, forKey: groceryKey)
        }
    }
    
    func saveProjects() {
        if let encoded = try? JSONEncoder().encode(projects) {
            UserDefaults.standard.set(encoded, forKey: projectsKey)
        }
    }
    
    func savePremiumStatus() {
        UserDefaults.standard.set(isPremium, forKey: premiumKey)
    }
    
    // MARK: - Task Operations
    func addTask(_ task: Task) {
        tasks.append(task)
        saveTasks()
    }
    
    func updateTask(_ task: Task) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index] = task
            saveTasks()
        }
    }
    
    func deleteTask(_ task: Task) {
        tasks.removeAll { $0.id == task.id }
        saveTasks()
    }
    
    func toggleTaskCompletion(_ task: Task) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index].completed.toggle()
            saveTasks()
        }
    }
    
    // MARK: - Category Operations
    func addCategory(_ category: TaskCategory) {
        categories.append(category)
        saveCategories()
    }
    
    func updateCategory(_ category: TaskCategory) {
        if let index = categories.firstIndex(where: { $0.id == category.id }) {
            categories[index] = category
            saveCategories()
        }
    }
    
    func deleteCategory(_ category: TaskCategory) {
        categories.removeAll { $0.id == category.id }
        saveCategories()
    }
    
    // MARK: - Grocery Operations
    func addGroceryItem(_ item: GroceryItem) {
        groceryItems.append(item)
        saveGroceryItems()
    }
    
    func updateGroceryItem(_ item: GroceryItem) {
        if let index = groceryItems.firstIndex(where: { $0.id == item.id }) {
            groceryItems[index] = item
            saveGroceryItems()
        }
    }
    
    func deleteGroceryItem(_ item: GroceryItem) {
        groceryItems.removeAll { $0.id == item.id }
        saveGroceryItems()
    }
    
    func toggleGroceryItem(_ item: GroceryItem) {
        if let index = groceryItems.firstIndex(where: { $0.id == item.id }) {
            groceryItems[index].checked.toggle()
            saveGroceryItems()
        }
    }
    
    // MARK: - Project Operations
    func addProject(_ project: Project) {
        projects.append(project)
        saveProjects()
    }
    
    func updateProject(_ project: Project) {
        if let index = projects.firstIndex(where: { $0.id == project.id }) {
            projects[index] = project
            saveProjects()
        }
    }
    
    func deleteProject(_ project: Project) {
        projects.removeAll { $0.id == project.id }
        saveProjects()
    }
    
    // MARK: - Utility Methods
    func tasksForToday() -> [Task] {
        let calendar = Calendar.current
        let today = Date()
        
        return tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return calendar.isDate(dueDate, inSameDayAs: today) && !task.completed
        }
    }
    
    func upcomingTasks() -> [Task] {
        let calendar = Calendar.current
        let today = Date()
        
        return tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate > today && !task.completed
        }.sorted { ($0.dueDate ?? Date()) < ($1.dueDate ?? Date()) }
    }
    
    func overdueTasks() -> [Task] {
        let today = Date()
        
        return tasks.filter { task in
            guard let dueDate = task.dueDate else { return false }
            return dueDate < today && !task.completed
        }
    }
    
    func tasksForCategory(_ category: String) -> [Task] {
        return tasks.filter { $0.category == category }
    }
    
    func incompleteTasks() -> [Task] {
        return tasks.filter { !$0.completed }
    }
    
    // MARK: - Template Management
    func saveTemplates() {
        if let encoded = try? JSONEncoder().encode(templates) {
            UserDefaults.standard.set(encoded, forKey: templatesKey)
        }
    }
    
    func addTemplate(_ template: TaskTemplate) {
        templates.append(template)
        saveTemplates()
    }
    
    func updateTemplate(_ template: TaskTemplate) {
        if let index = templates.firstIndex(where: { $0.id == template.id }) {
            templates[index] = template
            saveTemplates()
        }
    }
    
    func deleteTemplate(_ template: TaskTemplate) {
        templates.removeAll { $0.id == template.id }
        saveTemplates()
    }
}
