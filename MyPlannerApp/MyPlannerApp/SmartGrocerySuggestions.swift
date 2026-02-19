import SwiftUI

// MARK: - Smart Grocery Suggestion
struct SmartGrocerySuggestion: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let category: String
    let color: Color
    let keywords: [String]
    let commonQuantity: String?
}

class SmartGrocerySuggestionEngine {
    static let shared = SmartGrocerySuggestionEngine()
    
    // Pre-built grocery suggestions with fun icons
    let suggestions: [SmartGrocerySuggestion] = [
        // Fruits 🍎
        SmartGrocerySuggestion(name: "Apples", icon: "🍎", category: "Produce", color: .red, keywords: ["apple", "apples", "fruit"], commonQuantity: "6"),
        SmartGrocerySuggestion(name: "Bananas", icon: "🍌", category: "Produce", color: .yellow, keywords: ["banana", "bananas"], commonQuantity: "1 bunch"),
        SmartGrocerySuggestion(name: "Oranges", icon: "🍊", category: "Produce", color: .orange, keywords: ["orange", "oranges"], commonQuantity: "4"),
        SmartGrocerySuggestion(name: "Strawberries", icon: "🍓", category: "Produce", color: .red, keywords: ["strawberry", "strawberries", "berries"], commonQuantity: "1 lb"),
        SmartGrocerySuggestion(name: "Grapes", icon: "🍇", category: "Produce", color: .purple, keywords: ["grape", "grapes"], commonQuantity: "1 lb"),
        SmartGrocerySuggestion(name: "Watermelon", icon: "🍉", category: "Produce", color: .green, keywords: ["watermelon", "melon"], commonQuantity: "1"),
        SmartGrocerySuggestion(name: "Lemon", icon: "🍋", category: "Produce", color: .yellow, keywords: ["lemon", "lemons"], commonQuantity: "3"),
        
        // Vegetables 🥕
        SmartGrocerySuggestion(name: "Carrots", icon: "🥕", category: "Produce", color: .orange, keywords: ["carrot", "carrots"], commonQuantity: "1 lb"),
        SmartGrocerySuggestion(name: "Broccoli", icon: "🥦", category: "Produce", color: .green, keywords: ["broccoli"], commonQuantity: "1 head"),
        SmartGrocerySuggestion(name: "Tomatoes", icon: "🍅", category: "Produce", color: .red, keywords: ["tomato", "tomatoes"], commonQuantity: "4"),
        SmartGrocerySuggestion(name: "Lettuce", icon: "🥬", category: "Produce", color: .green, keywords: ["lettuce", "salad"], commonQuantity: "1 head"),
        SmartGrocerySuggestion(name: "Potatoes", icon: "🥔", category: "Produce", color: .brown, keywords: ["potato", "potatoes"], commonQuantity: "5 lb"),
        SmartGrocerySuggestion(name: "Onions", icon: "🧅", category: "Produce", color: .orange, keywords: ["onion", "onions"], commonQuantity: "3"),
        SmartGrocerySuggestion(name: "Peppers", icon: "🫑", category: "Produce", color: .green, keywords: ["pepper", "peppers", "bell pepper"], commonQuantity: "3"),
        
        // Dairy 🥛
        SmartGrocerySuggestion(name: "Milk", icon: "🥛", category: "Dairy", color: .blue, keywords: ["milk"], commonQuantity: "1 gallon"),
        SmartGrocerySuggestion(name: "Eggs", icon: "🥚", category: "Dairy", color: .orange, keywords: ["egg", "eggs"], commonQuantity: "1 dozen"),
        SmartGrocerySuggestion(name: "Cheese", icon: "🧀", category: "Dairy", color: .yellow, keywords: ["cheese"], commonQuantity: "8 oz"),
        SmartGrocerySuggestion(name: "Butter", icon: "🧈", category: "Dairy", color: .yellow, keywords: ["butter"], commonQuantity: "1 lb"),
        SmartGrocerySuggestion(name: "Yogurt", icon: "🍶", category: "Dairy", color: .pink, keywords: ["yogurt"], commonQuantity: "32 oz"),
        
        // Bread & Bakery 🍞
        SmartGrocerySuggestion(name: "Bread", icon: "🍞", category: "Bakery", color: .brown, keywords: ["bread", "loaf"], commonQuantity: "1 loaf"),
        SmartGrocerySuggestion(name: "Bagels", icon: "🥯", category: "Bakery", color: .brown, keywords: ["bagel", "bagels"], commonQuantity: "6"),
        SmartGrocerySuggestion(name: "Croissants", icon: "🥐", category: "Bakery", color: .orange, keywords: ["croissant", "croissants"], commonQuantity: "4"),
        
        // Meat 🥩
        SmartGrocerySuggestion(name: "Chicken", icon: "🍗", category: "Meat", color: .orange, keywords: ["chicken"], commonQuantity: "2 lb"),
        SmartGrocerySuggestion(name: "Beef", icon: "🥩", category: "Meat", color: .red, keywords: ["beef", "steak"], commonQuantity: "1 lb"),
        SmartGrocerySuggestion(name: "Bacon", icon: "🥓", category: "Meat", color: .red, keywords: ["bacon"], commonQuantity: "1 lb"),
        SmartGrocerySuggestion(name: "Hot Dogs", icon: "🌭", category: "Meat", color: .orange, keywords: ["hotdog", "hot dog", "hotdogs"], commonQuantity: "1 pack"),
        
        // Snacks 🍿
        SmartGrocerySuggestion(name: "Chips", icon: "🥔", category: "Snacks", color: .yellow, keywords: ["chips", "potato chips"], commonQuantity: "1 bag"),
        SmartGrocerySuggestion(name: "Popcorn", icon: "🍿", category: "Snacks", color: .yellow, keywords: ["popcorn"], commonQuantity: "1 box"),
        SmartGrocerySuggestion(name: "Cookies", icon: "🍪", category: "Snacks", color: .brown, keywords: ["cookie", "cookies"], commonQuantity: "1 pack"),
        SmartGrocerySuggestion(name: "Ice Cream", icon: "🍨", category: "Frozen", color: .pink, keywords: ["ice cream", "icecream"], commonQuantity: "1 pint"),
        SmartGrocerySuggestion(name: "Chocolate", icon: "🍫", category: "Snacks", color: .brown, keywords: ["chocolate", "candy"], commonQuantity: "1 bar"),
        
        // Beverages ☕
        SmartGrocerySuggestion(name: "Coffee", icon: "☕", category: "Beverages", color: .brown, keywords: ["coffee"], commonQuantity: "1 lb"),
        SmartGrocerySuggestion(name: "Tea", icon: "🍵", category: "Beverages", color: .green, keywords: ["tea"], commonQuantity: "1 box"),
        SmartGrocerySuggestion(name: "Orange Juice", icon: "🧃", category: "Beverages", color: .orange, keywords: ["juice", "orange juice", "oj"], commonQuantity: "64 oz"),
        SmartGrocerySuggestion(name: "Soda", icon: "🥤", category: "Beverages", color: .red, keywords: ["soda", "pop", "coke"], commonQuantity: "12 pack"),
        SmartGrocerySuggestion(name: "Water Bottles", icon: "💧", category: "Beverages", color: .blue, keywords: ["water", "bottled water"], commonQuantity: "24 pack"),
        
        // Pantry 🥫
        SmartGrocerySuggestion(name: "Pasta", icon: "🍝", category: "Pantry", color: .yellow, keywords: ["pasta", "spaghetti", "noodles"], commonQuantity: "1 lb"),
        SmartGrocerySuggestion(name: "Rice", icon: "🍚", category: "Pantry", color: .gray, keywords: ["rice"], commonQuantity: "2 lb"),
        SmartGrocerySuggestion(name: "Cereal", icon: "🥣", category: "Pantry", color: .orange, keywords: ["cereal"], commonQuantity: "1 box"),
        SmartGrocerySuggestion(name: "Soup", icon: "🥫", category: "Pantry", color: .red, keywords: ["soup", "canned soup"], commonQuantity: "4 cans"),
        SmartGrocerySuggestion(name: "Peanut Butter", icon: "🥜", category: "Pantry", color: .brown, keywords: ["peanut butter", "pb"], commonQuantity: "18 oz"),
        
        // Household 🧻
        SmartGrocerySuggestion(name: "Paper Towels", icon: "🧻", category: "Household", color: .gray, keywords: ["paper towels", "towels"], commonQuantity: "6 rolls"),
        SmartGrocerySuggestion(name: "Toilet Paper", icon: "🧻", category: "Household", color: .gray, keywords: ["toilet paper", "tp"], commonQuantity: "12 rolls"),
        SmartGrocerySuggestion(name: "Dish Soap", icon: "🧼", category: "Household", color: .blue, keywords: ["dish soap", "soap"], commonQuantity: "1 bottle"),
        SmartGrocerySuggestion(name: "Laundry Detergent", icon: "🧺", category: "Household", color: .blue, keywords: ["detergent", "laundry"], commonQuantity: "1 bottle"),
        SmartGrocerySuggestion(name: "Trash Bags", icon: "🗑️", category: "Household", color: .gray, keywords: ["trash bags", "garbage bags"], commonQuantity: "1 box"),
        
        // Personal Care 🧴
        SmartGrocerySuggestion(name: "Shampoo", icon: "🧴", category: "Personal Care", color: .blue, keywords: ["shampoo"], commonQuantity: "1 bottle"),
        SmartGrocerySuggestion(name: "Toothpaste", icon: "🪥", category: "Personal Care", color: .blue, keywords: ["toothpaste"], commonQuantity: "1 tube"),
        SmartGrocerySuggestion(name: "Tissues", icon: "🧻", category: "Personal Care", color: .pink, keywords: ["tissues", "kleenex"], commonQuantity: "3 boxes"),
    ]
    
    // Smart matching function
    func getSuggestions(for query: String) -> [SmartGrocerySuggestion] {
        let lowercaseQuery = query.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !lowercaseQuery.isEmpty else { return [] }
        
        // Score and filter suggestions
        let scored = suggestions.compactMap { suggestion -> (SmartGrocerySuggestion, Int)? in
            var score = 0
            
            // Exact match in keywords
            for keyword in suggestion.keywords {
                if lowercaseQuery.contains(keyword) || keyword.contains(lowercaseQuery) {
                    score += 10
                }
            }
            
            // Partial match in name
            if suggestion.name.lowercased().contains(lowercaseQuery) {
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

// MARK: - Smart Grocery Suggestion Row
struct SmartGrocerySuggestionRow: View {
    let suggestion: SmartGrocerySuggestion
    let onTap: () -> Void
    @EnvironmentObject var themeManager: ThemeManager
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Fun Icon (emoji)
                Text(suggestion.icon)
                    .font(.system(size: 32))
                
                // Content
                VStack(alignment: .leading, spacing: 4) {
                    Text(suggestion.name)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.primary)
                    
                    HStack(spacing: 8) {
                        HStack(spacing: 4) {
                            Image(systemName: "tag.fill")
                                .font(.system(size: 10))
                            Text(suggestion.category)
                                .font(.system(size: 12))
                        }
                        .foregroundColor(.secondary)
                        
                        if let quantity = suggestion.commonQuantity {
                            HStack(spacing: 4) {
                                Image(systemName: "number")
                                    .font(.system(size: 10))
                                Text(quantity)
                                    .font(.system(size: 12))
                            }
                            .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
                
                // Indicator
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(theme.primaryColor.color)
            }
            .padding(12)
            .background(Color(.secondarySystemBackground))
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}
