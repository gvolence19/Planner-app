import SwiftUI

// MARK: - Ultra-Realistic Physical Planner
// Makes it look like you're actually working out of a real planner on your desk

struct PhysicalPlannerBook: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var selectedTab = 0
    @State private var currentPage = 1
    @State private var isFlipping = false
    @State private var flipProgress: CGFloat = 0
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ZStack {
            // Desk surface
            deskSurface
            
            // The physical planner book
            GeometryReader { geometry in
                ZStack {
                    // Book shadow on desk
                    bookShadow
                    
                    // The planner - single page view with spiral on left
                    singlePagePlanner(geometry: geometry)
                }
                .padding(.horizontal, 30)
                .padding(.vertical, 50)
            }
            
            // Navigation controls overlay
            VStack {
                Spacer()
                
                // Tab/section selector
                sectionTabs
                    .padding(.bottom, 30)
            }
        }
        .ignoresSafeArea()
    }
    
    // MARK: - Desk Surface
    private var deskSurface: some View {
        LinearGradient(
            colors: [
                Color(red: 0.85, green: 0.82, blue: 0.78),
                Color(red: 0.78, green: 0.75, blue: 0.71)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay(
            // Wood grain texture
            Rectangle()
                .fill(Color.black.opacity(0.02))
                .background(
                    LinearGradient(
                        colors: [Color.clear, Color.black.opacity(0.01), Color.clear],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
        )
        .ignoresSafeArea()
    }
    
    // MARK: - Book Shadow
    private var bookShadow: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(
                RadialGradient(
                    colors: [
                        Color.black.opacity(0.4),
                        Color.black.opacity(0.2),
                        Color.clear
                    ],
                    center: .center,
                    startRadius: 10,
                    endRadius: 200
                )
            )
            .blur(radius: 15)
            .offset(y: 8)
    }
    
    // MARK: - Single Page Planner
    private func singlePagePlanner(geometry: GeometryProxy) -> some View {
        HStack(spacing: 0) {
            // LEFT EDGE: Spiral binding
            spiralBinding
                .frame(width: 30)
            
            // MAIN PAGE: Full width for content
            mainPage(geometry: geometry)
        }
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(red: 0.2, green: 0.15, blue: 0.12)) // Book cover edge
                .shadow(color: .black.opacity(0.3), radius: 20, x: -5, y: 10)
        )
    }
    
    // MARK: - Spiral Binding (Left Side)
    private var spiralBinding: some View {
        ZStack {
            // Binding strip
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.25, green: 0.2, blue: 0.18),
                            Color(red: 0.2, green: 0.15, blue: 0.12),
                            Color(red: 0.25, green: 0.2, blue: 0.18)
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
            
            // Spiral coils
            VStack(spacing: 35) {
                ForEach(0..<15, id: \.self) { _ in
                    Circle()
                        .strokeBorder(Color.white.opacity(0.3), lineWidth: 1.5)
                        .background(Circle().fill(Color.black.opacity(0.4)))
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.vertical, 50)
        }
    }
    
    // MARK: - Main Page
    private func mainPage(geometry: GeometryProxy) -> some View {
        ZStack {
            // Paper background
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.99, green: 0.98, blue: 0.96),
                            Color.white,
                            Color(red: 0.98, green: 0.97, blue: 0.95)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            // Subtle paper texture
            Image(systemName: "circle.fill")
                .resizable()
                .opacity(0.015)
                .blendMode(.multiply)
            
            // Punch holes along left edge
            if styleManager.showSpiralBinding {
                punchHoles
            }
            
            // Page content
            VStack(spacing: 0) {
                TabView(selection: $selectedTab) {
                    pageContent(PageFlipCalendarView()).tag(0)
                    pageContent(PlannerTasksView()).tag(1)
                    pageContent(PlannerGroceryView()).tag(2)
                    pageContent(PlannerSleepView()).tag(3)
                    pageContent(PlannerSettingsView()).tag(4)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .onChange(of: selectedTab) { newValue in
                    withAnimation(.easeInOut(duration: 0.4)) {
                        isFlipping = true
                        currentPage = newValue + 1
                    }
                    
                    // Haptic feedback
                    let impact = UIImpactFeedbackGenerator(style: .medium)
                    impact.impactOccurred()
                    
                    // Reset flip animation
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                        isFlipping = false
                    }
                }
            }
            
            // Page number
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(currentPage)")
                        .font(.system(size: 14, design: .serif))
                        .foregroundColor(.gray.opacity(0.5))
                        .padding(.trailing, 40)
                        .padding(.bottom, 100)
                }
            }
            
            // Page curl in bottom-right corner
            if selectedTab < 4 {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        pageCurlCorner
                            .padding(.trailing, 30)
                            .padding(.bottom, 100)
                    }
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.2), radius: 8, x: -3, y: 0)
        .rotation3DEffect(
            .degrees(isFlipping ? -15 : 0),
            axis: (x: 0, y: 1, z: 0),
            anchor: .leading,
            perspective: 0.5
        )
    }
    
    // MARK: - Punch Holes
    private var punchHoles: some View {
        VStack(spacing: 50) {
            ForEach(0..<12, id: \.self) { _ in
                Circle()
                    .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1.5)
                    .background(Circle().fill(Color.white))
                    .frame(width: 14, height: 14)
                    .shadow(color: .black.opacity(0.3), radius: 3, x: 2, y: 2)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 45)
        .padding(.vertical, 60)
    }
    
    // MARK: - Page Content
    private func pageContent<Content: View>(_ content: Content) -> some View {
        content
            .padding(.horizontal, 20)
            .padding(.top, 20)
            .padding(.bottom, 100)
    }
    
    // MARK: - Page Curl Corner
    private var pageCurlCorner: some View {
        ZStack {
            // Curl shadow
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 30, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 30))
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [Color.black.opacity(0.2), Color.clear],
                    startPoint: .topTrailing,
                    endPoint: .bottomLeading
                )
            )
            
            // Curled page
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 25, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 25))
                path.closeSubpath()
            }
            .fill(Color(red: 0.95, green: 0.94, blue: 0.92))
            .shadow(color: .black.opacity(0.3), radius: 3, x: -1, y: 1)
        }
        .frame(width: 30, height: 30)
        .padding(.trailing, 20)
    }
    
    // MARK: - Section Tabs
    private var sectionTabs: some View {
        HStack(spacing: 12) {
            ForEach(0..<5, id: \.self) { index in
                Button {
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                        selectedTab = index
                    }
                } label: {
                    sectionTab(index: index)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(
            Capsule()
                .fill(Color.white.opacity(0.95))
                .shadow(color: .black.opacity(0.2), radius: 10, y: 5)
        )
    }
    
    private func sectionTab(index: Int) -> some View {
        let tabs = [
            ("📅", "Today", Color.blue),
            ("✅", "Tasks", Color.green),
            ("🛒", "Shop", Color.orange),
            ("😴", "Sleep", Color.purple),
            ("⚙️", "Settings", Color.gray)
        ]
        
        let isSelected = selectedTab == index
        
        return VStack(spacing: 4) {
            Text(tabs[index].0)
                .font(.system(size: isSelected ? 26 : 20))
            
            Text(tabs[index].1)
                .font(.system(size: 10, weight: isSelected ? .semibold : .regular))
                .foregroundColor(isSelected ? tabs[index].2 : .gray)
        }
        .frame(width: 60, height: 60)
        .background(
            Circle()
                .fill(isSelected ? tabs[index].2.opacity(0.15) : Color.clear)
        )
    }
    
    private var leftPageTitle: String {
        let titles = ["Calendar", "Tasks", "Grocery", "Sleep", "Settings"]
        let prevIndex = max(0, selectedTab - 1)
        return titles[prevIndex]
    }
}

// MARK: - Page Shapes
struct LeftPageShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 0, y: 0))
        path.addLine(to: CGPoint(x: rect.maxX - 5, y: 0))
        path.addLine(to: CGPoint(x: rect.maxX, y: 5))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - 5))
        path.addLine(to: CGPoint(x: rect.maxX - 5, y: rect.maxY))
        path.addLine(to: CGPoint(x: 0, y: rect.maxY))
        path.closeSubpath()
        return path
    }
}

struct RightPageShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: 5, y: 0))
        path.addLine(to: CGPoint(x: rect.maxX, y: 0))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.addLine(to: CGPoint(x: 5, y: rect.maxY))
        path.addLine(to: CGPoint(x: 0, y: rect.maxY - 5))
        path.addLine(to: CGPoint(x: 0, y: 5))
        path.closeSubpath()
        return path
    }
}
