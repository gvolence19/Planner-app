import SwiftUI

// MARK: - Realistic Planmore-Style Planner
// Matches the Planmore app design with realistic tabs and wide content

struct RealisticPlanmorePlanner: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @State private var selectedTab = 0
    @State private var dragAmount: CGFloat = 0
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    let sections = [
        ("📅", "Calendar", Color.blue),
        ("✓", "Tasks", Color.green),
        ("🛒", "Shop", Color.orange),
        ("😴", "Sleep", Color.purple),
        ("⚙️", "Settings", Color.gray)
    ]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Desk background
                Color(white: 0.93)
                    .ignoresSafeArea()
                
                HStack(spacing: 0) {
                    // MAIN PLANNER PAGE - MUCH WIDER NOW
                    plannerPage(geometry: geometry)
                        .frame(maxWidth: .infinity)
                    
                    // REALISTIC TABS - Right edge
                    realisticTabs
                        .frame(width: 70)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 40)
            }
        }
        .ignoresSafeArea()
        .preferredColorScheme(.light)
    }
    
    // MARK: - Planner Page
    private func plannerPage(geometry: GeometryProxy) -> some View {
        ZStack {
            // Page shadows
            ForEach(0..<3, id: \.self) { i in
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.black.opacity(0.05))
                    .offset(x: CGFloat(-2 - i), y: CGFloat(4 + i))
            }
            
            // White page
            RoundedRectangle(cornerRadius: 6)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.12), radius: 15, x: -4, y: 6)
            
            // Spiral holes (left edge)
            spiralHoles
            
            // CONTENT - ALMOST FULL WIDTH
            VStack(spacing: 0) {
                TabView(selection: $selectedTab) {
                    contentPage(SimplePlannerCalendar()).tag(0)
                    contentPage(SimplePlannerTasks()).tag(1)
                    contentPage(SimplePlannerGrocery()).tag(2)
                    contentPage(SimplePlannerSleep()).tag(3)
                    contentPage(SimplePlannerSettings()).tag(4)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .padding(.leading, 45)  // Just spiral space
            .padding(.trailing, 12) // Minimal right
            .padding(.vertical, 30)
            
            // Page curl
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    pageCurl
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 6))
    }
    
    // MARK: - Content Page
    private func contentPage<Content: View>(_ content: Content) -> some View {
        ScrollView(showsIndicators: false) {
            content
        }
        .background(Color.white)
    }
    
    // MARK: - Spiral Holes
    private var spiralHoles: some View {
        VStack(spacing: 45) {
            ForEach(0..<12, id: \.self) { _ in
                Circle()
                    .fill(Color.white)
                    .frame(width: 10, height: 10)
                    .overlay(Circle().stroke(Color.gray.opacity(0.3), lineWidth: 1))
                    .shadow(color: .black.opacity(0.1), radius: 1, x: 1, y: 1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 20)
        .padding(.top, 50)
    }
    
    // MARK: - Page Curl
    private var pageCurl: some View {
        Path { path in
            path.move(to: CGPoint(x: 0, y: 0))
            path.addQuadCurve(to: CGPoint(x: 35, y: 0), control: CGPoint(x: 18, y: -2))
            path.addQuadCurve(to: CGPoint(x: 0, y: 35), control: CGPoint(x: 2, y: 18))
            path.closeSubpath()
        }
        .fill(
            LinearGradient(
                colors: [Color(white: 0.97), Color(white: 0.92)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .shadow(color: .black.opacity(0.2), radius: 4, x: -2, y: 2)
        .frame(width: 35, height: 35)
        .padding(.trailing, 15)
        .padding(.bottom, 15)
    }
    
    // MARK: - REALISTIC TABS (Like Physical Planner)
    private var realisticTabs: some View {
        VStack(spacing: 8) {
            ForEach(0..<sections.count, id: \.self) { index in
                realisticTab(index: index)
            }
            Spacer()
        }
        .padding(.vertical, 50)
    }
    
    private func realisticTab(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                selectedTab = index
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
        } label: {
            ZStack(alignment: .trailing) {
                // Tab shape - sticks out from page
                TabShape(selected: isSelected)
                    .fill(
                        LinearGradient(
                            colors: [
                                sections[index].2,
                                sections[index].2.opacity(0.85)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: isSelected ? 65 : 58, height: isSelected ? 75 : 68)
                    .shadow(
                        color: sections[index].2.opacity(0.4),
                        radius: isSelected ? 8 : 5,
                        x: isSelected ? 3 : 2,
                        y: 3
                    )
                
                // Content
                VStack(spacing: 4) {
                    Text(sections[index].0)
                        .font(.system(size: isSelected ? 28 : 24))
                    Text(sections[index].1)
                        .font(.system(size: isSelected ? 9 : 8, weight: .semibold))
                        .lineLimit(1)
                }
                .foregroundColor(.white)
                .padding(.trailing, 8)
            }
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Tab Shape (Physical Divider Shape)
struct TabShape: Shape {
    let selected: Bool
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let curve: CGFloat = 4
        
        // Start bottom left
        path.move(to: CGPoint(x: 0, y: rect.height))
        
        // Left edge up
        path.addLine(to: CGPoint(x: 0, y: curve))
        
        // Top left curve
        path.addQuadCurve(
            to: CGPoint(x: curve, y: 0),
            control: CGPoint(x: 0, y: 0)
        )
        
        // Top edge
        path.addLine(to: CGPoint(x: rect.width - curve, y: 0))
        
        // Top right curve
        path.addQuadCurve(
            to: CGPoint(x: rect.width, y: curve),
            control: CGPoint(x: rect.width, y: 0)
        )
        
        // Right edge down
        path.addLine(to: CGPoint(x: rect.width, y: rect.height - curve))
        
        // Bottom right curve
        path.addQuadCurve(
            to: CGPoint(x: rect.width - curve, y: rect.height),
            control: CGPoint(x: rect.width, y: rect.height)
        )
        
        // Bottom edge back
        path.addLine(to: CGPoint(x: curve, y: rect.height))
        
        // Bottom left curve
        path.addQuadCurve(
            to: CGPoint(x: 0, y: rect.height - curve),
            control: CGPoint(x: 0, y: rect.height)
        )
        
        path.closeSubpath()
        
        return path
    }
}
