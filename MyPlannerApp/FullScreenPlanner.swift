import SwiftUI

// MARK: - Full Screen Physical Planner
// Fills entire screen with realistic divider tabs and page-flip animations

struct FullScreenPlanner: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var selectedTab = 0
    @State private var dragOffset: CGFloat = 0
    @State private var isFlipping = false
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    let tabs = [
        ("📅", "Today", Color.blue),
        ("✅", "Tasks", Color.green),
        ("🛒", "Grocery", Color.orange),
        ("😴", "Sleep", Color.purple),
        ("⚙️", "Settings", Color.gray)
    ]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Paper background
                paperBackground
                
                // Current page content with flip animation
                ZStack {
                    // Previous page (underneath during flip)
                    if isFlipping && selectedTab > 0 {
                        pageView(for: selectedTab - 1, geometry: geometry)
                            .opacity(0.3)
                    }
                    
                    // Current page
                    pageView(for: selectedTab, geometry: geometry)
                        .rotation3DEffect(
                            .degrees(dragOffset * 0.5),
                            axis: (x: 0, y: 1, z: 0),
                            anchor: .leading,
                            perspective: 0.4
                        )
                        .shadow(color: .black.opacity(0.3), radius: 20, x: dragOffset * 0.1, y: 0)
                }
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            // Only allow right-to-left swipes for page flip
                            if value.translation.width < 0 && selectedTab < 4 {
                                dragOffset = value.translation.width
                                isFlipping = true
                            }
                        }
                        .onEnded { value in
                            withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                                if dragOffset < -100 && selectedTab < 4 {
                                    // Complete the page flip
                                    selectedTab += 1
                                    let impact = UIImpactFeedbackGenerator(style: .medium)
                                    impact.impactOccurred()
                                }
                                dragOffset = 0
                                isFlipping = false
                            }
                        }
                )
                
                // Divider tabs sticking out on the right side
                dividerTabs(geometry: geometry)
                
                // Left edge spiral binding
                leftSpiralEdge
            }
            .ignoresSafeArea()
        }
    }
    
    // MARK: - Paper Background
    private var paperBackground: some View {
        LinearGradient(
            colors: [
                Color(red: 0.99, green: 0.98, blue: 0.96),
                Color.white,
                Color(red: 0.98, green: 0.97, blue: 0.95)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            // Paper texture
            Image(systemName: "circle.fill")
                .resizable()
                .opacity(0.01)
                .blendMode(.multiply)
        )
    }
    
    // MARK: - Page View
    private func pageView(for index: Int, geometry: GeometryProxy) -> some View {
        ZStack {
            // Page content
            Group {
                switch index {
                case 0: PageFlipCalendarView()
                case 1: PlannerTasksView()
                case 2: PlannerGroceryView()
                case 3: PlannerSleepView()
                case 4: PlannerSettingsView()
                default: EmptyView()
                }
            }
            .padding(.leading, 50) // Space for spiral
            .padding(.trailing, 60) // Space for tabs
            .padding(.top, 20)
            .padding(.bottom, 20)
            
            // Punch holes for spiral
            punchHoles
            
            // Page number
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(index + 1)")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray.opacity(0.5))
                        .padding(.trailing, 70)
                        .padding(.bottom, 30)
                }
            }
        }
    }
    
    // MARK: - Divider Tabs (Sticking Out on Right)
    private func dividerTabs(geometry: GeometryProxy) -> some View {
        VStack(spacing: 0) {
            ForEach(0..<tabs.count, id: \.self) { index in
                dividerTab(index: index, geometry: geometry)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
        .padding(.top, 100)
    }
    
    private func dividerTab(index: Int, geometry: GeometryProxy) -> some View {
        let isSelected = selectedTab == index
        let tabHeight: CGFloat = 80
        
        return Button {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                isFlipping = true
                selectedTab = index
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
                
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    isFlipping = false
                }
            }
        } label: {
            HStack(spacing: 0) {
                // Tab label (on the page)
                if isSelected {
                    HStack(spacing: 8) {
                        Text(tabs[index].0)
                            .font(.system(size: 24))
                        Text(tabs[index].1)
                            .font(.system(size: 14, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(
                        Capsule()
                            .fill(tabs[index].2)
                    )
                    .transition(.scale)
                }
                
                Spacer(minLength: 0)
                
                // Tab sticking out
                ZStack {
                    // Tab shape
                    TabShape(isSelected: isSelected)
                        .fill(
                            LinearGradient(
                                colors: [
                                    tabs[index].2,
                                    tabs[index].2.opacity(0.8)
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: isSelected ? 60 : 45, height: tabHeight)
                        .shadow(color: .black.opacity(0.3), radius: 4, x: 2, y: 2)
                    
                    // Icon on tab
                    VStack(spacing: 4) {
                        Text(tabs[index].0)
                            .font(.system(size: isSelected ? 28 : 22))
                        
                        if !isSelected {
                            Text(tabs[index].1)
                                .font(.system(size: 8, weight: .medium))
                                .lineLimit(1)
                        }
                    }
                    .foregroundColor(.white)
                    .offset(x: isSelected ? -5 : 0)
                }
            }
            .frame(height: tabHeight)
            .padding(.leading, isSelected ? 100 : 0)
        }
        .buttonStyle(.plain)
    }
    
    // MARK: - Left Spiral Edge
    private var leftSpiralEdge: some View {
        VStack(spacing: 40) {
            ForEach(0..<20, id: \.self) { _ in
                Circle()
                    .strokeBorder(Color.gray.opacity(0.4), lineWidth: 2)
                    .background(Circle().fill(Color.white))
                    .frame(width: 12, height: 12)
                    .shadow(color: .black.opacity(0.2), radius: 2, x: 2, y: 1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 20)
        .padding(.vertical, 60)
    }
    
    // MARK: - Punch Holes
    private var punchHoles: some View {
        VStack(spacing: 50) {
            ForEach(0..<15, id: \.self) { _ in
                Circle()
                    .fill(Color.white)
                    .frame(width: 8, height: 8)
                    .overlay(
                        Circle()
                            .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.3), radius: 2, x: 1, y: 1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 28)
        .padding(.vertical, 70)
    }
}

// MARK: - Tab Shape (Sticking Out)
struct TabShape: Shape {
    let isSelected: Bool
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let curve: CGFloat = 8
        
        if isSelected {
            // Selected tab sticks out more
            path.move(to: CGPoint(x: 0, y: curve))
            path.addQuadCurve(
                to: CGPoint(x: curve, y: 0),
                control: CGPoint(x: 0, y: 0)
            )
            path.addLine(to: CGPoint(x: rect.maxX - curve, y: 0))
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX, y: curve),
                control: CGPoint(x: rect.maxX, y: 0)
            )
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - curve))
            path.addQuadCurve(
                to: CGPoint(x: rect.maxX - curve, y: rect.maxY),
                control: CGPoint(x: rect.maxX, y: rect.maxY)
            )
            path.addLine(to: CGPoint(x: curve, y: rect.maxY))
            path.addQuadCurve(
                to: CGPoint(x: 0, y: rect.maxY - curve),
                control: CGPoint(x: 0, y: rect.maxY)
            )
            path.closeSubpath()
        } else {
            // Non-selected tab
            path.move(to: CGPoint(x: 0, y: curve))
            path.addQuadCurve(
                to: CGPoint(x: curve, y: 0),
                control: CGPoint(x: 0, y: 0)
            )
            path.addLine(to: CGPoint(x: rect.maxX, y: 0))
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
            path.addLine(to: CGPoint(x: curve, y: rect.maxY))
            path.addQuadCurve(
                to: CGPoint(x: 0, y: rect.maxY - curve),
                control: CGPoint(x: 0, y: rect.maxY)
            )
            path.closeSubpath()
        }
        
        return path
    }
}

// MARK: - Page Flip Animation Helper
extension View {
    func pageFlipTransition(progress: CGFloat) -> some View {
        self
            .rotation3DEffect(
                .degrees(Double(progress) * -180),
                axis: (x: 0, y: 1, z: 0),
                anchor: .leading,
                perspective: 0.3
            )
            .shadow(
                color: .black.opacity(Double(abs(progress)) * 0.5),
                radius: 20,
                x: progress * 10,
                y: 0
            )
    }
}
