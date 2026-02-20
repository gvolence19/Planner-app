import SwiftUI

// MARK: - Planner Design System
// Unified design language for the entire app to look like a physical planner

struct PlannerDesignSystem {
    
    // MARK: - Paper Textures
    static func paperBackground(for theme: AppTheme) -> some View {
        ZStack {
            // Base paper color
            theme.backgroundColor.color
            
            // Subtle paper texture overlay
            LinearGradient(
                colors: [
                    Color.white.opacity(0.03),
                    Color.white.opacity(0.01),
                    Color.white.opacity(0.03)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
    
    // MARK: - Spiral Binding
    static func spiralBinding(theme: AppTheme, count: Int = 8) -> some View {
        HStack(spacing: 12) {
            ForEach(0..<count, id: \.self) { _ in
                Circle()
                    .fill(theme.primaryColor.color.opacity(0.3))
                    .frame(width: 8, height: 8)
                    .overlay(
                        Circle()
                            .stroke(theme.primaryColor.color.opacity(0.5), lineWidth: 1)
                    )
            }
        }
    }
    
    // MARK: - Page Header
    static func pageHeader(title: String, icon: String? = nil, theme: AppTheme) -> some View {
        VStack(spacing: 0) {
            // Spiral binding
            spiralBinding(theme: theme)
                .padding(.top, 8)
                .padding(.bottom, 12)
            
            // Title with optional icon
            HStack {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 28, weight: .medium))
                }
                Text(title)
                    .font(.system(size: 32, weight: .bold))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [theme.primaryColor.color, theme.secondaryColor.color],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 8)
            
            // Divider line
            Rectangle()
                .fill(theme.primaryColor.color.opacity(0.2))
                .frame(height: 1)
                .shadow(color: .black.opacity(0.05), radius: 1, y: 1)
        }
        .background(paperBackground(for: theme))
    }
    
    // MARK: - Planner Card
    static func plannerCard<Content: View>(
        theme: AppTheme,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            content()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(theme.cardColor.color)
                .shadow(color: .black.opacity(0.08), radius: 4, x: 0, y: 2)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(theme.primaryColor.color.opacity(0.1), lineWidth: 1)
        )
    }
    
    // MARK: - Section Divider
    static func sectionDivider(theme: AppTheme) -> some View {
        HStack {
            Rectangle()
                .fill(theme.primaryColor.color.opacity(0.3))
                .frame(height: 1)
        }
        .padding(.vertical, 8)
    }
    
    // MARK: - Planner Tab Style
    static func tabLabel(icon: String, title: String, theme: AppTheme) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 22))
            Text(title)
                .font(.system(size: 10, weight: .medium))
        }
    }
}

// MARK: - Planner Page Modifier
struct PlannerPageModifier: ViewModifier {
    let theme: AppTheme
    
    func body(content: Content) -> some View {
        ZStack {
            PlannerDesignSystem.paperBackground(for: theme)
                .ignoresSafeArea()
            
            content
        }
    }
}

extension View {
    func plannerPage(theme: AppTheme) -> some View {
        modifier(PlannerPageModifier(theme: theme))
    }
}

// MARK: - Planner Tab Bar
struct PlannerTabBar: View {
    @Binding var selectedTab: Int
    @EnvironmentObject var themeManager: ThemeManager
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    let tabs: [(icon: String, title: String)] = [
        ("calendar", "Today"),
        ("list.bullet", "Tasks"),
        ("cart", "Grocery"),
        ("moon.zzz", "Sleep"),
        ("gearshape", "Settings")
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            // Top border with paper edge effect
            HStack {
                ForEach(0..<10, id: \.self) { _ in
                    Rectangle()
                        .fill(theme.primaryColor.color.opacity(0.2))
                        .frame(width: 20, height: 2)
                    Spacer()
                }
            }
            .padding(.horizontal, 8)
            
            HStack(spacing: 0) {
                ForEach(0..<tabs.count, id: \.self) { index in
                    Button {
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            selectedTab = index
                        }
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: tabs[index].icon)
                                .font(.system(size: 22, weight: selectedTab == index ? .semibold : .regular))
                            
                            Text(tabs[index].title)
                                .font(.system(size: 10, weight: selectedTab == index ? .semibold : .medium))
                        }
                        .foregroundColor(selectedTab == index ? theme.primaryColor.color : .secondary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            selectedTab == index ?
                            RoundedRectangle(cornerRadius: 8)
                                .fill(theme.primaryColor.color.opacity(0.1))
                            : nil
                        )
                    }
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 8)
            .background(
                theme.backgroundColor.color
                    .shadow(color: .black.opacity(0.1), radius: 8, y: -2)
            )
        }
    }
}

// MARK: - Planner Text Styles
extension Text {
    func plannerTitle() -> some View {
        self.font(.system(size: 28, weight: .bold))
    }
    
    func plannerHeadline() -> some View {
        self.font(.system(size: 20, weight: .semibold))
    }
    
    func plannerBody() -> some View {
        self.font(.system(size: 16, weight: .regular))
    }
    
    func plannerCaption() -> some View {
        self.font(.system(size: 13, weight: .medium))
    }
}
