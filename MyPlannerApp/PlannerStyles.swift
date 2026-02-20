import SwiftUI

// MARK: - Planner Style Options
enum PlannerStyle: String, CaseIterable, Identifiable {
    case modern = "Modern"
    case vintage = "Vintage"
    case minimal = "Minimal"
    case colorful = "Colorful"
    case professional = "Professional"
    
    var id: String { rawValue }
    
    var description: String {
        switch self {
        case .modern: return "Clean lines, bold colors"
        case .vintage: return "Aged paper, classic fonts"
        case .minimal: return "Simple, distraction-free"
        case .colorful: return "Vibrant, playful design"
        case .professional: return "Business-ready elegance"
        }
    }
    
    var icon: String {
        switch self {
        case .modern: return "sparkles"
        case .vintage: return "book.closed"
        case .minimal: return "circle"
        case .colorful: return "paintpalette"
        case .professional: return "briefcase"
        }
    }
    
    // Paper texture opacity
    var paperOpacity: Double {
        switch self {
        case .modern: return 0.02
        case .vintage: return 0.12
        case .minimal: return 0.01
        case .colorful: return 0.05
        case .professional: return 0.03
        }
    }
    
    // Corner radius for cards
    var cardRadius: CGFloat {
        switch self {
        case .modern: return 16
        case .vintage: return 8
        case .minimal: return 4
        case .colorful: return 20
        case .professional: return 12
        }
    }
    
    // Shadow intensity
    var shadowOpacity: Double {
        switch self {
        case .modern: return 0.1
        case .vintage: return 0.15
        case .minimal: return 0.05
        case .colorful: return 0.12
        case .professional: return 0.08
        }
    }
}

// MARK: - Planner Style Manager
class PlannerStyleManager: ObservableObject {
    static let shared = PlannerStyleManager()
    
    @Published var currentStyle: PlannerStyle {
        didSet {
            UserDefaults.standard.set(currentStyle.rawValue, forKey: "plannerStyle")
        }
    }
    
    @Published var showPageNumbers: Bool {
        didSet {
            UserDefaults.standard.set(showPageNumbers, forKey: "showPageNumbers")
        }
    }
    
    @Published var showSpiralBinding: Bool {
        didSet {
            UserDefaults.standard.set(showSpiralBinding, forKey: "showSpiralBinding")
        }
    }
    
    @Published var showPageEdges: Bool {
        didSet {
            UserDefaults.standard.set(showPageEdges, forKey: "showPageEdges")
        }
    }
    
    init() {
        let savedStyle = UserDefaults.standard.string(forKey: "plannerStyle") ?? PlannerStyle.modern.rawValue
        self.currentStyle = PlannerStyle(rawValue: savedStyle) ?? .modern
        self.showPageNumbers = UserDefaults.standard.bool(forKey: "showPageNumbers")
        self.showSpiralBinding = UserDefaults.standard.bool(forKey: "showSpiralBinding")
        self.showPageEdges = UserDefaults.standard.bool(forKey: "showPageEdges")
    }
}

// MARK: - Enhanced Paper Background
struct EnhancedPaperBackground: View {
    let theme: AppTheme
    let style: PlannerStyle
    
    var body: some View {
        ZStack {
            // Base color
            theme.backgroundColor.color
            
            // Paper texture based on style
            if style == .vintage {
                // Vintage aged paper
                LinearGradient(
                    colors: [
                        Color.brown.opacity(0.08),
                        Color.yellow.opacity(0.05),
                        Color.brown.opacity(0.08)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            } else {
                // Modern paper texture
                LinearGradient(
                    colors: [
                        Color.white.opacity(style.paperOpacity),
                        Color.white.opacity(style.paperOpacity * 0.5),
                        Color.white.opacity(style.paperOpacity)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
            
            // Subtle grain effect
            Image(systemName: "circle.fill")
                .resizable()
                .opacity(0.02)
                .blendMode(.overlay)
        }
    }
}

// MARK: - Page Edge Decoration
struct PageEdgeDecoration: View {
    let theme: AppTheme
    let style: PlannerStyle
    
    var body: some View {
        VStack {
            Spacer()
            HStack(spacing: 0) {
                ForEach(0..<20, id: \.self) { _ in
                    Rectangle()
                        .fill(theme.primaryColor.color.opacity(0.15))
                        .frame(width: 15, height: 4)
                    Rectangle()
                        .fill(Color.clear)
                        .frame(width: 5, height: 4)
                }
            }
            .frame(height: 4)
        }
    }
}

// MARK: - Page Number
struct PageNumber: View {
    let number: Int
    let theme: AppTheme
    let style: PlannerStyle
    
    var body: some View {
        VStack {
            Spacer()
            HStack {
                Spacer()
                Text("\(number)")
                    .font(style == .vintage ? .system(.caption, design: .serif) : .caption)
                    .foregroundColor(theme.secondaryColor.color.opacity(0.6))
                    .padding(.trailing, 24)
                    .padding(.bottom, 16)
            }
        }
    }
}

// MARK: - Enhanced Planner Card
struct StyledPlannerCard<Content: View>: View {
    let theme: AppTheme
    let style: PlannerStyle
    let content: Content
    
    init(theme: AppTheme, style: PlannerStyle, @ViewBuilder content: () -> Content) {
        self.theme = theme
        self.style = style
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            content
        }
        .padding(style == .minimal ? 12 : 16)
        .background(
            RoundedRectangle(cornerRadius: style.cardRadius)
                .fill(theme.cardColor.color)
                .shadow(
                    color: .black.opacity(style.shadowOpacity),
                    radius: style == .minimal ? 2 : 4,
                    x: 0,
                    y: style == .minimal ? 1 : 2
                )
        )
        .overlay(
            RoundedRectangle(cornerRadius: style.cardRadius)
                .stroke(
                    style == .vintage ?
                    Color.brown.opacity(0.2) :
                    theme.primaryColor.color.opacity(0.1),
                    lineWidth: style == .minimal ? 0.5 : 1
                )
        )
    }
}

// MARK: - Spiral Binding (Enhanced)
struct EnhancedSpiralBinding: View {
    let theme: AppTheme
    let style: PlannerStyle
    let count: Int
    
    var body: some View {
        HStack(spacing: style == .minimal ? 8 : 12) {
            ForEach(0..<count, id: \.self) { index in
                spiralRing(index: index)
            }
        }
    }
    
    private func spiralRing(index: Int) -> some View {
        let size: CGFloat = style == .minimal ? 6 : 8
        let offset = sin(Double(index) * 0.3) * 2
        
        return Circle()
            .fill(
                style == .vintage ?
                Color.brown.opacity(0.4) :
                theme.primaryColor.color.opacity(0.3)
            )
            .frame(width: size, height: size)
            .overlay(
                Circle()
                    .stroke(
                        style == .vintage ?
                        Color.brown.opacity(0.6) :
                        theme.primaryColor.color.opacity(0.5),
                        lineWidth: 1
                    )
            )
            .offset(y: offset)
    }
}

// MARK: - Enhanced Page Header
struct EnhancedPageHeader: View {
    let title: String
    let icon: String?
    let theme: AppTheme
    let style: PlannerStyle
    let showSpiral: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            // Spiral binding
            if showSpiral {
                EnhancedSpiralBinding(theme: theme, style: style, count: 8)
                    .padding(.top, 8)
                    .padding(.bottom, 12)
            }
            
            // Title with optional icon
            HStack(spacing: 12) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: titleIconSize, weight: .medium))
                        .foregroundColor(theme.primaryColor.color)
                }
                
                Text(title)
                    .font(titleFont)
                    .foregroundStyle(titleGradient)
                
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 8)
            
            // Divider line
            dividerLine
        }
    }
    
    private var titleFont: Font {
        switch style {
        case .vintage:
            return .system(size: 32, weight: .bold, design: .serif)
        case .minimal:
            return .system(size: 28, weight: .medium, design: .default)
        case .colorful:
            return .system(size: 34, weight: .black, design: .rounded)
        default:
            return .system(size: 32, weight: .bold)
        }
    }
    
    private var titleIconSize: CGFloat {
        style == .colorful ? 32 : 28
    }
    
    private var titleGradient: LinearGradient {
        LinearGradient(
            colors: style == .minimal ?
            [theme.primaryColor.color] :
            [theme.primaryColor.color, theme.secondaryColor.color],
            startPoint: .leading,
            endPoint: .trailing
        )
    }
    
    private var dividerLine: some View {
        Rectangle()
            .fill(
                style == .vintage ?
                Color.brown.opacity(0.3) :
                theme.primaryColor.color.opacity(0.2)
            )
            .frame(height: style == .minimal ? 0.5 : 1)
            .shadow(
                color: .black.opacity(style.shadowOpacity * 0.5),
                radius: 1,
                y: 1
            )
    }
}

// MARK: - Style Preview Card
struct PlannerStylePreview: View {
    let style: PlannerStyle
    let theme: AppTheme
    let isSelected: Bool
    
    var body: some View {
        VStack(spacing: 8) {
            // Preview miniature
            ZStack {
                EnhancedPaperBackground(theme: theme, style: style)
                
                VStack(spacing: 4) {
                    EnhancedSpiralBinding(theme: theme, style: style, count: 4)
                        .scaleEffect(0.6)
                    
                    Rectangle()
                        .fill(theme.primaryColor.color)
                        .frame(width: 60, height: 2)
                    
                    Rectangle()
                        .fill(theme.primaryColor.color.opacity(0.5))
                        .frame(width: 40, height: 1)
                }
            }
            .frame(width: 80, height: 100)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(
                        isSelected ? theme.primaryColor.color : Color.gray.opacity(0.3),
                        lineWidth: isSelected ? 3 : 1
                    )
            )
            
            // Style name
            VStack(spacing: 2) {
                HStack(spacing: 4) {
                    Image(systemName: style.icon)
                        .font(.system(size: 12))
                    Text(style.rawValue)
                        .font(.system(size: 13, weight: .semibold))
                }
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(theme.primaryColor.color)
                }
            }
            .foregroundColor(isSelected ? theme.primaryColor.color : .secondary)
        }
    }
}
