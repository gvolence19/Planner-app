import SwiftUI

// MARK: - Modern Task Card
struct ModernTaskCard: View {
    let task: Task
    let onToggle: () -> Void
    let onTap: () -> Void
    @State private var isPressed = false
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                // Checkbox
                Button(action: {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        onToggle()
                    }
                }) {
                    ZStack {
                        Circle()
                            .stroke(task.completed ? Color.green : priorityColor, lineWidth: 2)
                            .frame(width: 24, height: 24)
                        
                        if task.completed {
                            Circle()
                                .fill(Color.green)
                                .frame(width: 24, height: 24)
                            
                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                }
                .buttonStyle(ScaleButtonStyle())
                
                // Task Info
                VStack(alignment: .leading, spacing: 6) {
                    Text(task.title)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(task.completed ? .secondary : .primary)
                        .strikethrough(task.completed)
                    
                    // Metadata
                    HStack(spacing: 12) {
                        if let dueDate = task.dueDate {
                            HStack(spacing: 4) {
                                Image(systemName: "calendar")
                                    .font(.system(size: 11))
                                Text(formatDate(dueDate))
                                    .font(.system(size: 12))
                            }
                            .foregroundColor(isOverdue(dueDate) ? .red : .secondary)
                        }
                        
                        if let category = task.category {
                            HStack(spacing: 4) {
                                Image(systemName: "tag")
                                    .font(.system(size: 11))
                                Text(category)
                                    .font(.system(size: 12))
                            }
                            .foregroundColor(.secondary)
                        }
                        
                        // Priority indicator
                        if task.priority == .high {
                            Image(systemName: "exclamationmark.circle.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.red)
                        }
                    }
                }
                
                Spacer()
                
                // Chevron
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.secondary.opacity(0.5))
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color(.systemBackground))
                    .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 2)
            )
        }
        .buttonStyle(CardButtonStyle())
    }
    
    private var priorityColor: Color {
        switch task.priority {
        case .high: return .red
        case .medium: return .orange
        case .low: return .blue
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInTomorrow(date) {
            return "Tomorrow"
        } else {
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM d"
            return formatter.string(from: date)
        }
    }
    
    private func isOverdue(_ date: Date) -> Bool {
        return date < Date() && !task.completed
    }
}

// MARK: - Floating Action Button
struct FloatingActionButton: View {
    let action: () -> Void
    @State private var isPressed = false
    @Environment(\.appTheme) var theme
    
    var body: some View {
        Button(action: {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                action()
            }
        }) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [theme.primaryColor.color, theme.secondaryColor.color],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 56, height: 56)
                    .shadow(color: theme.primaryColor.color.opacity(0.4), radius: 12, x: 0, y: 6)
                
                Image(systemName: "plus")
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(.white)
            }
        }
        .scaleEffect(isPressed ? 0.9 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isPressed)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }
}

// MARK: - Section Header
struct ModernSectionHeader: View {
    let title: String
    let count: Int?
    let action: (() -> Void)?
    
    init(title: String, count: Int? = nil, action: (() -> Void)? = nil) {
        self.title = title
        self.count = count
        self.action = action
    }
    
    var body: some View {
        HStack {
            HStack(spacing: 8) {
                Text(title)
                    .font(.system(size: 20, weight: .bold))
                
                if let count = count {
                    Text("\(count)")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.secondary.opacity(0.1))
                        .cornerRadius(8)
                }
            }
            
            Spacer()
            
            if let action = action {
                Button(action: action) {
                    Image(systemName: "ellipsis.circle")
                        .font(.system(size: 20))
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
    }
}

// MARK: - Empty State
struct ModernEmptyState: View {
    let icon: String
    let title: String
    let message: String
    let actionTitle: String?
    let action: (() -> Void)?
    @Environment(\.appTheme) var theme
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: icon)
                .font(.system(size: 64))
                .foregroundColor(theme.primaryColor.color.opacity(0.6))
            
            VStack(spacing: 8) {
                Text(title)
                    .font(.system(size: 22, weight: .bold))
                
                Text(message)
                    .font(.system(size: 16))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
            
            if let actionTitle = actionTitle, let action = action {
                Button(action: action) {
                    Text(actionTitle)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 14)
                        .background(
                            LinearGradient(
                                colors: [theme.primaryColor.color, theme.secondaryColor.color],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                }
                .buttonStyle(ScaleButtonStyle())
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
}

// MARK: - Stats Card
struct StatsCard: View {
    let icon: String
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(color)
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(value)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.primary)
                
                Text(title)
                    .font(.system(size: 14))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemBackground))
                .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 2)
        )
    }
}

// MARK: - Modern Tab Bar
struct ModernTabBar: View {
    @Binding var selectedTab: ViewType
    let isPremium: Bool
    @Environment(\.appTheme) var theme
    @Namespace private var animation
    
    var tabs: [ViewType] {
        isPremium ? ViewType.allCases : [.list, .calendar, .grocery]
    }
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(tabs, id: \.self) { tab in
                TabBarItem(
                    tab: tab,
                    isSelected: selectedTab == tab,
                    animation: animation,
                    theme: theme
                ) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedTab = tab
                    }
                }
            }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 24)
                .fill(Color(.systemBackground))
                .shadow(color: Color.black.opacity(0.1), radius: 20, x: 0, y: -5)
        )
    }
}

struct TabBarItem: View {
    let tab: ViewType
    let isSelected: Bool
    let animation: Namespace.ID
    let theme: AppTheme
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                ZStack {
                    if isSelected {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(theme.primaryColor.color.opacity(0.1))
                            .matchedGeometryEffect(id: "tab_background", in: animation)
                    }
                    
                    Image(systemName: tab.icon)
                        .font(.system(size: 20, weight: isSelected ? .semibold : .regular))
                        .foregroundColor(isSelected ? theme.primaryColor.color : .secondary)
                }
                .frame(width: 50, height: 36)
                
                Text(tab.displayName)
                    .font(.system(size: 11, weight: isSelected ? .semibold : .regular))
                    .foregroundColor(isSelected ? theme.primaryColor.color : .secondary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Progress Ring
struct ProgressRing: View {
    let progress: Double
    let lineWidth: CGFloat
    let size: CGFloat
    @Environment(\.appTheme) var theme
    
    var body: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(Color.secondary.opacity(0.2), lineWidth: lineWidth)
                .frame(width: size, height: size)
            
            // Progress ring
            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    LinearGradient(
                        colors: [theme.primaryColor.color, theme.secondaryColor.color],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .frame(width: size, height: size)
                .rotationEffect(.degrees(-90))
                .animation(.spring(response: 0.6, dampingFraction: 0.8), value: progress)
        }
    }
}

// MARK: - Quick Add Bar
struct QuickAddBar: View {
    @Binding var text: String
    let placeholder: String
    let onSubmit: () -> Void
    @FocusState private var isFocused: Bool
    @Environment(\.appTheme) var theme
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 24))
                .foregroundColor(theme.primaryColor.color)
            
            TextField(placeholder, text: $text)
                .font(.system(size: 16))
                .focused($isFocused)
                .submitLabel(.done)
                .onSubmit(onSubmit)
            
            if !text.isEmpty {
                Button(action: onSubmit) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(theme.primaryColor.color)
                }
                .transition(.scale.combined(with: .opacity))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemGray6))
        )
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: text.isEmpty)
    }
}

// MARK: - Category Pill
struct CategoryPill: View {
    let category: String
    let isSelected: Bool
    let action: () -> Void
    @Environment(\.appTheme) var theme
    
    var body: some View {
        Button(action: action) {
            Text(category)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(isSelected ? .white : theme.primaryColor.color)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(
                    Capsule()
                        .fill(isSelected ? theme.primaryColor.color : theme.primaryColor.color.opacity(0.15))
                )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Button Styles
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

struct CardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .opacity(configuration.isPressed ? 0.9 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

// MARK: - Success Animation
struct SuccessCheckmark: View {
    @State private var scale: CGFloat = 0
    @State private var opacity: Double = 0
    
    var body: some View {
        ZStack {
            Circle()
                .fill(Color.green.opacity(0.2))
                .frame(width: 80, height: 80)
                .scaleEffect(scale)
            
            Image(systemName: "checkmark")
                .font(.system(size: 40, weight: .bold))
                .foregroundColor(.green)
                .scaleEffect(scale)
        }
        .opacity(opacity)
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                scale = 1.0
                opacity = 1.0
            }
            
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation(.easeOut(duration: 0.3)) {
                    opacity = 0
                }
            }
        }
    }
}

// MARK: - Shimmer Effect
struct ShimmerView: View {
    @State private var phase: CGFloat = 0
    
    var body: some View {
        GeometryReader { geometry in
            LinearGradient(
                colors: [
                    Color(.systemGray5),
                    Color(.systemGray6),
                    Color(.systemGray5)
                ],
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(width: geometry.size.width * 2)
            .offset(x: -geometry.size.width + (geometry.size.width * 2 * phase))
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
        }
        .cornerRadius(8)
    }
}

// MARK: - Simple Priority Badge
struct SimplePriorityBadge: View {
    let priority: Priority
    
    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(priorityColor)
                .frame(width: 8, height: 8)
            
            Text(priority.rawValue)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(priorityColor)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(
            Capsule()
                .fill(priorityColor.opacity(0.15))
        )
    }
    
    private var priorityColor: Color {
        switch priority {
        case .high: return .red
        case .medium: return .orange
        case .low: return .blue
        }
    }
}

// MARK: - Date Picker Card
struct DatePickerCard: View {
    @Binding var date: Date
    let title: String
    @Environment(\.appTheme) var theme
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.secondary)
            
            DatePicker("", selection: $date, displayedComponents: [.date, .hourAndMinute])
                .datePickerStyle(.compact)
                .labelsHidden()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemGray6))
        )
    }
}

// MARK: - Notification Badge
struct NotificationBadge: View {
    let count: Int
    
    var body: some View {
        if count > 0 {
            Text("\(count)")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(.white)
                .frame(minWidth: 18, minHeight: 18)
                .background(Circle().fill(Color.red))
                .offset(x: 10, y: -10)
        }
    }
}
