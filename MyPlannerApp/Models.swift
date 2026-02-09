import Foundation
import SwiftUI

// MARK: - Task Model
struct Task: Identifiable, Codable, Hashable {
    let id: UUID
    var title: String
    var description: String?
    var completed: Bool
    var dueDate: Date?
    var category: String?
    var priority: Priority
    var createdAt: Date
    var recurring: RecurringOption
    var recurringParentId: UUID?
    var location: String?
    var isAISuggested: Bool?
    var aiCategory: String?
    var startTime: String?
    var duration: String?
    
    init(
        id: UUID = UUID(),
        title: String,
        description: String? = nil,
        completed: Bool = false,
        dueDate: Date? = nil,
        category: String? = nil,
        priority: Priority = .medium,
        createdAt: Date = Date(),
        recurring: RecurringOption = .none,
        recurringParentId: UUID? = nil,
        location: String? = nil,
        isAISuggested: Bool? = nil,
        aiCategory: String? = nil,
        startTime: String? = nil,
        duration: String? = nil
    ) {
        self.id = id
        self.title = title
        self.description = description
        self.completed = completed
        self.dueDate = dueDate
        self.category = category
        self.priority = priority
        self.createdAt = createdAt
        self.recurring = recurring
        self.recurringParentId = recurringParentId
        self.location = location
        self.isAISuggested = isAISuggested
        self.aiCategory = aiCategory
        self.startTime = startTime
        self.duration = duration
    }
}

// MARK: - Priority Enum
enum Priority: String, Codable, CaseIterable {
    case low
    case medium
    case high
    
    var color: Color {
        switch self {
        case .low: return .blue
        case .medium: return .yellow
        case .high: return .red
        }
    }
    
    var emoji: String {
        switch self {
        case .low: return "🔵"
        case .medium: return "🟡"
        case .high: return "🔴"
        }
    }
}

// MARK: - Recurring Options
enum RecurringOption: String, Codable, CaseIterable {
    case none
    case daily
    case weekly
    case biweekly
    case monthly
    
    var displayName: String {
        switch self {
        case .none: return "None"
        case .daily: return "Daily"
        case .weekly: return "Weekly"
        case .biweekly: return "Bi-weekly"
        case .monthly: return "Monthly"
        }
    }
}

// MARK: - Task Category
struct TaskCategory: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var color: String
    var icon: String
    
    init(id: UUID = UUID(), name: String, color: String, icon: String) {
        self.id = id
        self.name = name
        self.color = color
        self.icon = icon
    }
    
    var swiftUIColor: Color {
        switch color {
        case "bg-blue-500": return .blue
        case "bg-green-500": return .green
        case "bg-yellow-500": return .yellow
        case "bg-red-500": return .red
        case "bg-purple-500": return .purple
        case "bg-indigo-500": return .indigo
        case "bg-emerald-500": return .mint
        case "bg-orange-500": return .orange
        case "bg-pink-500": return .pink
        case "bg-gray-500": return .gray
        default: return .blue
        }
    }
}

// MARK: - Default Categories
extension TaskCategory {
    static let defaultCategories: [TaskCategory] = [
        TaskCategory(name: "Work", color: "bg-blue-500", icon: "💼"),
        TaskCategory(name: "Personal", color: "bg-green-500", icon: "🏠"),
        TaskCategory(name: "Shopping", color: "bg-yellow-500", icon: "🛒"),
        TaskCategory(name: "Health", color: "bg-red-500", icon: "🏥"),
        TaskCategory(name: "Education", color: "bg-purple-500", icon: "📚"),
        TaskCategory(name: "Travel", color: "bg-indigo-500", icon: "✈️"),
        TaskCategory(name: "Finance", color: "bg-emerald-500", icon: "💰"),
        TaskCategory(name: "Fitness", color: "bg-orange-500", icon: "💪"),
        TaskCategory(name: "Social", color: "bg-pink-500", icon: "👥"),
        TaskCategory(name: "Other", color: "bg-gray-500", icon: "📝")
    ]
}

// MARK: - Grocery Item
struct GroceryItem: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var quantity: String?
    var category: String?
    var checked: Bool
    var notes: String?
    
    init(
        id: UUID = UUID(),
        name: String,
        quantity: String? = nil,
        category: String? = nil,
        checked: Bool = false,
        notes: String? = nil
    ) {
        self.id = id
        self.name = name
        self.quantity = quantity
        self.category = category
        self.checked = checked
        self.notes = notes
    }
}

// MARK: - Project
struct Project: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var description: String?
    var color: String
    var createdAt: Date
    var tasks: [UUID] // Task IDs
    
    init(
        id: UUID = UUID(),
        name: String,
        description: String? = nil,
        color: String = "bg-blue-500",
        createdAt: Date = Date(),
        tasks: [UUID] = []
    ) {
        self.id = id
        self.name = name
        self.description = description
        self.color = color
        self.createdAt = createdAt
        self.tasks = tasks
    }
}

// MARK: - View Type
enum ViewType: String, CaseIterable {
    case list
    case calendar
    case grocery
    case meals
    case sleep
    case water
    case aiAssistant
    
    var displayName: String {
        switch self {
        case .list: return "Tasks"
        case .calendar: return "Calendar"
        case .grocery: return "Grocery"
        case .meals: return "Meals"
        case .sleep: return "Sleep"
        case .water: return "Water"
        case .aiAssistant: return "AI"
        }
    }
    
    var icon: String {
        switch self {
        case .list: return "checkmark.circle"
        case .calendar: return "calendar"
        case .grocery: return "cart"
        case .meals: return "fork.knife"
        case .sleep: return "moon.zzz"
        case .water: return "drop.fill"
        case .aiAssistant: return "brain"
        }
    }
}
