import SwiftUI

// MARK: - Planner Customization View
struct PlannerCustomizationView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @Environment(\.dismiss) var dismiss
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                EnhancedPaperBackground(theme: theme, style: styleManager.currentStyle)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        EnhancedPageHeader(
                            title: "Customize Your Planner",
                            icon: "paintbrush.fill",
                            theme: theme,
                            style: styleManager.currentStyle,
                            showSpiral: styleManager.showSpiralBinding
                        )
                        
                        VStack(spacing: 20) {
                            // Planner Style Selection
                            styleSelectionSection
                            
                            // Theme Selection
                            themeSelectionSection
                            
                            // Planner Options
                            plannerOptionsSection
                            
                            // Preview
                            previewSection
                        }
                        .padding(.horizontal, 16)
                        .padding(.bottom, 100)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(theme.primaryColor.color)
                }
            }
        }
    }
    
    // MARK: - Style Selection Section
    private var styleSelectionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Planner Style")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(theme.primaryColor.color)
            
            Text("Choose how your planner looks and feels")
                .font(.system(size: 14))
                .foregroundColor(.secondary)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(PlannerStyle.allCases) { style in
                        Button {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                styleManager.currentStyle = style
                            }
                        } label: {
                            PlannerStylePreview(
                                style: style,
                                theme: theme,
                                isSelected: styleManager.currentStyle == style
                            )
                        }
                    }
                }
                .padding(.horizontal, 4)
                .padding(.vertical, 8)
            }
            
            // Style description
            StyledPlannerCard(theme: theme, style: styleManager.currentStyle) {
                HStack(spacing: 12) {
                    Image(systemName: styleManager.currentStyle.icon)
                        .font(.system(size: 32))
                        .foregroundColor(theme.primaryColor.color)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(styleManager.currentStyle.rawValue)
                            .font(.system(size: 16, weight: .semibold))
                        Text(styleManager.currentStyle.description)
                            .font(.system(size: 14))
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                }
            }
        }
    }
    
    // MARK: - Theme Selection Section
    private var themeSelectionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Color Theme")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(theme.primaryColor.color)
            
            Text("Choose your favorite color palette")
                .font(.system(size: 14))
                .foregroundColor(.secondary)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(ThemeManager.availableThemes) { availableTheme in
                        Button {
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                themeManager.setTheme(availableTheme)
                            }
                        } label: {
                            VStack(spacing: 6) {
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [
                                                availableTheme.primaryColor.color,
                                                availableTheme.secondaryColor.color
                                            ],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 50, height: 50)
                                    .overlay(
                                        Circle()
                                            .stroke(
                                                theme.id == availableTheme.id ?
                                                Color.white : Color.clear,
                                                lineWidth: 3
                                            )
                                    )
                                    .shadow(
                                        color: availableTheme.primaryColor.color.opacity(0.3),
                                        radius: 4,
                                        y: 2
                                    )
                                
                                Text(availableTheme.emoji)
                                    .font(.system(size: 20))
                                
                                Text(availableTheme.name)
                                    .font(.system(size: 11, weight: .medium))
                                    .foregroundColor(
                                        theme.id == availableTheme.id ?
                                        theme.primaryColor.color : .secondary
                                    )
                                    .lineLimit(1)
                                    .frame(maxWidth: 60)
                            }
                        }
                    }
                }
                .padding(.horizontal, 4)
                .padding(.vertical, 8)
            }
        }
    }
    
    // MARK: - Planner Options Section
    private var plannerOptionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Planner Options")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(theme.primaryColor.color)
            
            StyledPlannerCard(theme: theme, style: styleManager.currentStyle) {
                VStack(spacing: 16) {
                    // Spiral Binding Toggle
                    Toggle(isOn: $styleManager.showSpiralBinding) {
                        HStack(spacing: 12) {
                            Image(systemName: "circle.grid.3x3")
                                .font(.system(size: 22))
                                .foregroundColor(theme.primaryColor.color)
                                .frame(width: 32)
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Spiral Binding")
                                    .font(.system(size: 16, weight: .medium))
                                Text("Show spiral rings at the top")
                                    .font(.system(size: 13))
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .tint(theme.primaryColor.color)
                    
                    Divider()
                    
                    // Page Numbers Toggle
                    Toggle(isOn: $styleManager.showPageNumbers) {
                        HStack(spacing: 12) {
                            Image(systemName: "number")
                                .font(.system(size: 22))
                                .foregroundColor(theme.primaryColor.color)
                                .frame(width: 32)
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Page Numbers")
                                    .font(.system(size: 16, weight: .medium))
                                Text("Display page numbers at bottom")
                                    .font(.system(size: 13))
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .tint(theme.primaryColor.color)
                    
                    Divider()
                    
                    // Page Edges Toggle
                    Toggle(isOn: $styleManager.showPageEdges) {
                        HStack(spacing: 12) {
                            Image(systemName: "square.3.layers.3d.down.right")
                                .font(.system(size: 22))
                                .foregroundColor(theme.primaryColor.color)
                                .frame(width: 32)
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Page Edges")
                                    .font(.system(size: 16, weight: .medium))
                                Text("Show decorative page edges")
                                    .font(.system(size: 13))
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .tint(theme.primaryColor.color)
                }
            }
        }
    }
    
    // MARK: - Preview Section
    private var previewSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Preview")
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(theme.primaryColor.color)
            
            StyledPlannerCard(theme: theme, style: styleManager.currentStyle) {
                VStack(spacing: 16) {
                    // Sample header
                    if styleManager.showSpiralBinding {
                        EnhancedSpiralBinding(theme: theme, style: styleManager.currentStyle, count: 6)
                    }
                    
                    // Sample content
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Sample Page")
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(theme.primaryColor.color)
                        
                        Rectangle()
                            .fill(theme.primaryColor.color.opacity(0.2))
                            .frame(height: 1)
                        
                        HStack {
                            Circle()
                                .stroke(theme.primaryColor.color, lineWidth: 2)
                                .frame(width: 24, height: 24)
                            Text("Sample task item")
                                .font(.system(size: 15))
                            Spacer()
                        }
                        
                        HStack {
                            Circle()
                                .stroke(theme.primaryColor.color, lineWidth: 2)
                                .frame(width: 24, height: 24)
                            Text("Another task item")
                                .font(.system(size: 15))
                            Spacer()
                        }
                    }
                    
                    // Sample page number
                    if styleManager.showPageNumbers {
                        HStack {
                            Spacer()
                            Text("1")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .padding(8)
            }
        }
    }
}
