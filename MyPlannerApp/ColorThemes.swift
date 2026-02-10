import SwiftUI

// MARK: - App Theme
struct AppTheme: Identifiable, Codable, Equatable {
    let id: String
    let name: String
    let emoji: String
    let primaryColor: CodableColor
    let secondaryColor: CodableColor
    let accentColor: CodableColor
    let backgroundColor: CodableColor
    let cardColor: CodableColor
    
    var gradient: LinearGradient {
        LinearGradient(
            colors: [primaryColor.color, secondaryColor.color],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

// MARK: - Codable Color
struct CodableColor: Codable, Equatable {
    let red: Double
    let green: Double
    let blue: Double
    let opacity: Double
    
    var color: Color {
        Color(red: red, green: green, blue: blue, opacity: opacity)
    }
    
    init(color: Color) {
        let uiColor = UIColor(color)
        var r: CGFloat = 0
        var g: CGFloat = 0
        var b: CGFloat = 0
        var a: CGFloat = 0
        uiColor.getRed(&r, green: &g, blue: &b, alpha: &a)
        
        self.red = Double(r)
        self.green = Double(g)
        self.blue = Double(b)
        self.opacity = Double(a)
    }
    
    init(red: Double, green: Double, blue: Double, opacity: Double = 1.0) {
        self.red = red
        self.green = green
        self.blue = blue
        self.opacity = opacity
    }
}

// MARK: - Theme Manager
class ThemeManager: ObservableObject {
    @Published var currentTheme: AppTheme
    
    private let themeKey = "selected_theme"
    
    static let shared = ThemeManager()
    
    init() {
        // Load saved theme or default
        if let data = UserDefaults.standard.data(forKey: themeKey),
           let decoded = try? JSONDecoder().decode(AppTheme.self, from: data) {
            currentTheme = decoded
        } else {
            currentTheme = Self.availableThemes[0] // Default Blue
        }
    }
    
    func setTheme(_ theme: AppTheme) {
        currentTheme = theme
        if let encoded = try? JSONEncoder().encode(theme) {
            UserDefaults.standard.set(encoded, forKey: themeKey)
        }
    }
    
    // MARK: - Available Themes
    static let availableThemes: [AppTheme] = [
        // Classic Blue
        AppTheme(
            id: "classic_blue",
            name: "Classic Blue",
            emoji: "💙",
            primaryColor: CodableColor(red: 0.0, green: 0.48, blue: 1.0),
            secondaryColor: CodableColor(red: 0.0, green: 0.75, blue: 1.0),
            accentColor: CodableColor(red: 0.0, green: 0.48, blue: 1.0),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Sunset Orange
        AppTheme(
            id: "sunset_orange",
            name: "Sunset Orange",
            emoji: "🌅",
            primaryColor: CodableColor(red: 1.0, green: 0.4, blue: 0.2),
            secondaryColor: CodableColor(red: 1.0, green: 0.7, blue: 0.0),
            accentColor: CodableColor(red: 1.0, green: 0.4, blue: 0.2),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Forest Green
        AppTheme(
            id: "forest_green",
            name: "Forest Green",
            emoji: "🌲",
            primaryColor: CodableColor(red: 0.13, green: 0.55, blue: 0.13),
            secondaryColor: CodableColor(red: 0.2, green: 0.8, blue: 0.2),
            accentColor: CodableColor(red: 0.13, green: 0.55, blue: 0.13),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Purple Dream
        AppTheme(
            id: "purple_dream",
            name: "Purple Dream",
            emoji: "💜",
            primaryColor: CodableColor(red: 0.58, green: 0.0, blue: 0.83),
            secondaryColor: CodableColor(red: 0.85, green: 0.44, blue: 1.0),
            accentColor: CodableColor(red: 0.58, green: 0.0, blue: 0.83),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Rose Pink
        AppTheme(
            id: "rose_pink",
            name: "Rose Pink",
            emoji: "🌸",
            primaryColor: CodableColor(red: 1.0, green: 0.41, blue: 0.71),
            secondaryColor: CodableColor(red: 1.0, green: 0.75, blue: 0.8),
            accentColor: CodableColor(red: 1.0, green: 0.41, blue: 0.71),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Ocean Teal
        AppTheme(
            id: "ocean_teal",
            name: "Ocean Teal",
            emoji: "🌊",
            primaryColor: CodableColor(red: 0.0, green: 0.5, blue: 0.5),
            secondaryColor: CodableColor(red: 0.25, green: 0.88, blue: 0.82),
            accentColor: CodableColor(red: 0.0, green: 0.5, blue: 0.5),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Fire Red
        AppTheme(
            id: "fire_red",
            name: "Fire Red",
            emoji: "🔥",
            primaryColor: CodableColor(red: 0.91, green: 0.12, blue: 0.39),
            secondaryColor: CodableColor(red: 1.0, green: 0.4, blue: 0.4),
            accentColor: CodableColor(red: 0.91, green: 0.12, blue: 0.39),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Golden Hour
        AppTheme(
            id: "golden_hour",
            name: "Golden Hour",
            emoji: "✨",
            primaryColor: CodableColor(red: 1.0, green: 0.84, blue: 0.0),
            secondaryColor: CodableColor(red: 1.0, green: 0.65, blue: 0.0),
            accentColor: CodableColor(red: 1.0, green: 0.65, blue: 0.0),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Midnight Blue
        AppTheme(
            id: "midnight_blue",
            name: "Midnight Blue",
            emoji: "🌙",
            primaryColor: CodableColor(red: 0.1, green: 0.1, blue: 0.44),
            secondaryColor: CodableColor(red: 0.29, green: 0.44, blue: 0.85),
            accentColor: CodableColor(red: 0.29, green: 0.44, blue: 0.85),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Lavender
        AppTheme(
            id: "lavender",
            name: "Lavender",
            emoji: "💐",
            primaryColor: CodableColor(red: 0.73, green: 0.63, blue: 0.95),
            secondaryColor: CodableColor(red: 0.85, green: 0.81, blue: 1.0),
            accentColor: CodableColor(red: 0.73, green: 0.63, blue: 0.95),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Mint Fresh
        AppTheme(
            id: "mint_fresh",
            name: "Mint Fresh",
            emoji: "🌿",
            primaryColor: CodableColor(red: 0.4, green: 0.94, blue: 0.78),
            secondaryColor: CodableColor(red: 0.67, green: 1.0, blue: 0.76),
            accentColor: CodableColor(red: 0.4, green: 0.94, blue: 0.78),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Cherry Blossom
        AppTheme(
            id: "cherry_blossom",
            name: "Cherry Blossom",
            emoji: "🌺",
            primaryColor: CodableColor(red: 1.0, green: 0.71, blue: 0.76),
            secondaryColor: CodableColor(red: 0.98, green: 0.5, blue: 0.45),
            accentColor: CodableColor(red: 0.98, green: 0.5, blue: 0.45),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Coral Reef
        AppTheme(
            id: "coral_reef",
            name: "Coral Reef",
            emoji: "🪸",
            primaryColor: CodableColor(red: 1.0, green: 0.5, blue: 0.31),
            secondaryColor: CodableColor(red: 0.95, green: 0.61, blue: 0.07),
            accentColor: CodableColor(red: 1.0, green: 0.5, blue: 0.31),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Arctic Ice
        AppTheme(
            id: "arctic_ice",
            name: "Arctic Ice",
            emoji: "❄️",
            primaryColor: CodableColor(red: 0.68, green: 0.85, blue: 0.9),
            secondaryColor: CodableColor(red: 0.88, green: 0.96, blue: 1.0),
            accentColor: CodableColor(red: 0.53, green: 0.81, blue: 0.92),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        ),
        
        // Grape Soda
        AppTheme(
            id: "grape_soda",
            name: "Grape Soda",
            emoji: "🍇",
            primaryColor: CodableColor(red: 0.55, green: 0.27, blue: 0.77),
            secondaryColor: CodableColor(red: 0.73, green: 0.33, blue: 0.83),
            accentColor: CodableColor(red: 0.55, green: 0.27, blue: 0.77),
            backgroundColor: CodableColor(color: Color(.systemBackground)),
            cardColor: CodableColor(color: Color(.systemGray6))
        )
    ]
}

// MARK: - Theme Selector View
struct ThemeSelectorView: View {
    @StateObject private var themeManager = ThemeManager.shared
    @Environment(\.dismiss) var dismiss
    
    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Preview Card
                    VStack(spacing: 16) {
                        Text("Current Theme")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        
                        ThemePreviewCard(theme: themeManager.currentTheme, isSelected: true)
                    }
                    .padding()
                    
                    Divider()
                    
                    // Theme Grid
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Choose a Theme")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        LazyVGrid(columns: columns, spacing: 16) {
                            ForEach(ThemeManager.availableThemes) { theme in
                                ThemeCard(
                                    theme: theme,
                                    isSelected: theme.id == themeManager.currentTheme.id
                                ) {
                                    withAnimation(.spring()) {
                                        themeManager.setTheme(theme)
                                    }
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Color Themes")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Theme Card
struct ThemeCard: View {
    let theme: AppTheme
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 12) {
                // Gradient Preview
                RoundedRectangle(cornerRadius: 12)
                    .fill(theme.gradient)
                    .frame(height: 80)
                    .overlay(
                        Text(theme.emoji)
                            .font(.system(size: 40))
                    )
                
                // Theme Name
                VStack(spacing: 4) {
                    Text(theme.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    if isSelected {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.caption)
                            Text("Active")
                                .font(.caption)
                        }
                        .foregroundColor(theme.accentColor.color)
                    }
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? theme.accentColor.color : Color.clear, lineWidth: 3)
            )
        }
    }
}

// MARK: - Theme Preview Card
struct ThemePreviewCard: View {
    let theme: AppTheme
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: 16) {
            // Large Emoji
            Text(theme.emoji)
                .font(.system(size: 60))
            
            // Theme Name
            Text(theme.name)
                .font(.title2)
                .fontWeight(.bold)
            
            // Gradient Bar
            RoundedRectangle(cornerRadius: 8)
                .fill(theme.gradient)
                .frame(height: 60)
            
            // Color Swatches
            HStack(spacing: 12) {
                ColorSwatch(color: theme.primaryColor.color, label: "Primary")
                ColorSwatch(color: theme.secondaryColor.color, label: "Secondary")
                ColorSwatch(color: theme.accentColor.color, label: "Accent")
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(20)
    }
}

// MARK: - Color Swatch
struct ColorSwatch: View {
    let color: Color
    let label: String
    
    var body: some View {
        VStack(spacing: 8) {
            Circle()
                .fill(color)
                .frame(width: 40, height: 40)
                .overlay(
                    Circle()
                        .stroke(Color(.systemGray4), lineWidth: 1)
                )
            
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Theme Environment Key
struct ThemeEnvironmentKey: EnvironmentKey {
    static let defaultValue = ThemeManager.shared.currentTheme
}

extension EnvironmentValues {
    var appTheme: AppTheme {
        get { self[ThemeEnvironmentKey.self] }
        set { self[ThemeEnvironmentKey.self] = newValue }
    }
}

// MARK: - View Extension for Theme
extension View {
    func withAppTheme() -> some View {
        self.environment(\.appTheme, ThemeManager.shared.currentTheme)
    }
}
