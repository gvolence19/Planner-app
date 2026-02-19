import SwiftUI

// MARK: - Smart Task Suggestions
struct SmartTaskSuggestion: Identifiable {
    let id = UUID()
    let title: String
    let icon: String
    let category: String?
    let suggestedTime: String?
    let priority: Priority?
    let keywords: [String]
    let color: Color
}

class SmartTaskSuggestionEngine {
    static let shared = SmartTaskSuggestionEngine()
    
    // Pre-built smart suggestions with keywords
    let suggestions: [SmartTaskSuggestion] = [
        // Medical
        SmartTaskSuggestion(title: "Dentist Appointment", icon: "cross.fill", category: "Health", suggestedTime: "9:00 AM", priority: .high, keywords: ["dentist", "dental", "teeth", "tooth", "cavity"], color: .blue),
        SmartTaskSuggestion(title: "Doctor Visit", icon: "cross.case.fill", category: "Health", suggestedTime: "10:00 AM", priority: .high, keywords: ["doctor", "checkup", "medical", "physician", "clinic"], color: .red),
        SmartTaskSuggestion(title: "Eye Exam", icon: "eye.fill", category: "Health", suggestedTime: "2:00 PM", priority: .medium, keywords: ["eye", "vision", "optometrist", "glasses", "contacts"], color: .teal),
        SmartTaskSuggestion(title: "Pharmacy Pickup", icon: "pills.fill", category: "Health", suggestedTime: "", priority: .medium, keywords: ["pharmacy", "prescription", "medicine", "pills", "refill"], color: .green),
        
        // Shopping
        SmartTaskSuggestion(title: "Grocery Shopping", icon: "cart.fill", category: "Shopping", suggestedTime: "", priority: .medium, keywords: ["grocery", "groceries", "food", "supermarket", "store"], color: .orange),
        SmartTaskSuggestion(title: "Buy Clothes", icon: "tshirt.fill", category: "Shopping", suggestedTime: "", priority: .low, keywords: ["clothes", "clothing", "shirt", "pants", "dress", "shoes"], color: .purple),
        SmartTaskSuggestion(title: "Pick Up Package", icon: "shippingbox.fill", category: "Shopping", suggestedTime: "", priority: .medium, keywords: ["package", "delivery", "pickup", "parcel", "mail"], color: .brown),
        
        // Home
        SmartTaskSuggestion(title: "Clean House", icon: "house.fill", category: "Home", suggestedTime: "", priority: .medium, keywords: ["clean", "cleaning", "vacuum", "dust", "mop", "tidy"], color: .cyan),
        SmartTaskSuggestion(title: "Do Laundry", icon: "washer.fill", category: "Home", suggestedTime: "", priority: .low, keywords: ["laundry", "wash", "clothes", "dryer", "fold"], color: .indigo),
        SmartTaskSuggestion(title: "Pay Bills", icon: "dollarsign.circle.fill", category: "Finance", suggestedTime: "", priority: .high, keywords: ["bill", "bills", "payment", "pay", "rent", "utilities"], color: .green),
        SmartTaskSuggestion(title: "Take Out Trash", icon: "trash.fill", category: "Home", suggestedTime: "", priority: .low, keywords: ["trash", "garbage", "waste", "recycle"], color: .gray),
        
        // Work
        SmartTaskSuggestion(title: "Team Meeting", icon: "person.3.fill", category: "Work", suggestedTime: "2:00 PM", priority: .high, keywords: ["meeting", "conference", "call", "zoom", "teams"], color: .blue),
        SmartTaskSuggestion(title: "Send Email", icon: "envelope.fill", category: "Work", suggestedTime: "", priority: .medium, keywords: ["email", "send", "reply", "message", "mail"], color: .blue),
        SmartTaskSuggestion(title: "Complete Report", icon: "doc.text.fill", category: "Work", suggestedTime: "", priority: .high, keywords: ["report", "document", "write", "finish", "complete"], color: .orange),
        SmartTaskSuggestion(title: "Project Deadline", icon: "clock.fill", category: "Work", suggestedTime: "5:00 PM", priority: .high, keywords: ["deadline", "due", "project", "submit"], color: .red),
        
        // Personal
        SmartTaskSuggestion(title: "Gym Workout", icon: "figure.run", category: "Personal", suggestedTime: "6:00 AM", priority: .medium, keywords: ["gym", "workout", "exercise", "fitness", "run"], color: .red),
        SmartTaskSuggestion(title: "Call Family", icon: "phone.fill", category: "Personal", suggestedTime: "", priority: .medium, keywords: ["call", "phone", "family", "mom", "dad"], color: .green),
        SmartTaskSuggestion(title: "Birthday Gift", icon: "giftcard.fill", category: "Personal", suggestedTime: "", priority: .medium, keywords: ["birthday", "gift", "present", "party"], color: .pink),
        SmartTaskSuggestion(title: "Read Book", icon: "book.fill", category: "Personal", suggestedTime: "", priority: .low, keywords: ["read", "book", "reading", "novel"], color: .brown),
        
        // Car
        SmartTaskSuggestion(title: "Car Service", icon: "car.fill", category: "Auto", suggestedTime: "9:00 AM", priority: .high, keywords: ["car", "auto", "service", "mechanic", "oil", "repair"], color: .gray),
        SmartTaskSuggestion(title: "Gas Station", icon: "fuelpump.fill", category: "Auto", suggestedTime: "", priority: .medium, keywords: ["gas", "fuel", "station", "petrol"], color: .red),
        
        // Food
        SmartTaskSuggestion(title: "Cook Dinner", icon: "fork.knife", category: "Food", suggestedTime: "6:00 PM", priority: .medium, keywords: ["cook", "dinner", "meal", "recipe", "prepare"], color: .orange),
        SmartTaskSuggestion(title: "Order Food", icon: "takeoutbag.and.cup.and.straw.fill", category: "Food", suggestedTime: "", priority: .low, keywords: ["order", "takeout", "delivery", "restaurant"], color: .red),
        
        // Pet
        SmartTaskSuggestion(title: "Vet Appointment", icon: "pawprint.fill", category: "Pet", suggestedTime: "11:00 AM", priority: .high, keywords: ["vet", "veterinarian", "pet", "dog", "cat"], color: .brown),
        SmartTaskSuggestion(title: "Walk Dog", icon: "figure.walk", category: "Pet", suggestedTime: "", priority: .medium, keywords: ["walk", "dog", "pet", "puppy"], color: .green),
        
        // Travel
        SmartTaskSuggestion(title: "Book Flight", icon: "airplane", category: "Travel", suggestedTime: "", priority: .high, keywords: ["flight", "airplane", "book", "travel", "trip"], color: .blue),
        SmartTaskSuggestion(title: "Pack Luggage", icon: "suitcase.fill", category: "Travel", suggestedTime: "", priority: .medium, keywords: ["pack", "luggage", "suitcase", "bag", "travel"], color: .orange),
        
        // Beauty
        SmartTaskSuggestion(title: "Hair Appointment", icon: "scissors", category: "Personal", suggestedTime: "3:00 PM", priority: .medium, keywords: ["hair", "haircut", "salon", "barber", "style"], color: .pink),
        SmartTaskSuggestion(title: "Spa Appointment", icon: "sparkles", category: "Personal", suggestedTime: "1:00 PM", priority: .low, keywords: ["spa", "massage", "relax", "facial"], color: .purple),
    ]
    
    // Smart matching function
    func getSuggestions(for query: String) -> [SmartTaskSuggestion] {
        let lowercaseQuery = query.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !lowercaseQuery.isEmpty else { return [] }
        
        // Score and filter suggestions
        let scored = suggestions.compactMap { suggestion -> (SmartTaskSuggestion, Int)? in
            var score = 0
            
            // Exact match in keywords
            for keyword in suggestion.keywords {
                if lowercaseQuery.contains(keyword) || keyword.contains(lowercaseQuery) {
                    score += 10
                }
            }
            
            // Partial match in title
            if suggestion.title.lowercased().contains(lowercaseQuery) {
                score += 5
            }
            
            // Word boundaries (starts with)
            for keyword in suggestion.keywords {
                if keyword.hasPrefix(lowercaseQuery) {
                    score += 15
                }
            }
            
            return score > 0 ? (suggestion, score) : nil
        }
        
        // Sort by score and return top 5
        return scored
            .sorted { $0.1 > $1.1 }
            .prefix(5)
            .map { $0.0 }
    }
}

// MARK: - Smart Suggestion Row
struct SmartSuggestionRow: View {
    let suggestion: SmartTaskSuggestion
    let onTap: () -> Void
    @EnvironmentObject var themeManager: ThemeManager
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Icon
                ZStack {
                    Circle()
                        .fill(suggestion.color.opacity(0.15))
                        .frame(width: 44, height: 44)
                    
                    Image(systemName: suggestion.icon)
                        .font(.system(size: 20))
                        .foregroundColor(suggestion.color)
                }
                
                // Content
                VStack(alignment: .leading, spacing: 4) {
                    Text(suggestion.title)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.primary)
                    
                    HStack(spacing: 8) {
                        if let category = suggestion.category {
                            HStack(spacing: 4) {
                                Image(systemName: "tag.fill")
                                    .font(.system(size: 10))
                                Text(category)
                                    .font(.system(size: 12))
                            }
                            .foregroundColor(.secondary)
                        }
                        
                        if let time = suggestion.suggestedTime, !time.isEmpty {
                            HStack(spacing: 4) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 10))
                                Text(time)
                                    .font(.system(size: 12))
                            }
                            .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
                
                // Indicator
                Image(systemName: "arrow.up.forward.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(theme.primaryColor.color.opacity(0.6))
            }
            .padding(12)
            .background(Color(.secondarySystemBackground))
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
