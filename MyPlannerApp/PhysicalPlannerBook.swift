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
                    
                    // The planner book itself
                    openPlannerBook(geometry: geometry)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 60)
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
    
    // MARK: - Open Planner Book
    private func openPlannerBook(geometry: GeometryProxy) -> some View {
        HStack(spacing: 0) {
            // LEFT PAGE (previous/context)
            leftPage
                .frame(width: geometry.size.width / 2 - 4)
            
            // CENTER BINDING
            centerBinding
                .frame(width: 8)
            
            // RIGHT PAGE (current content)
            rightPage
                .frame(width: geometry.size.width / 2 - 4)
        }
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color(red: 0.15, green: 0.12, blue: 0.10)) // Book cover edge
        )
        .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
    }
    
    // MARK: - Left Page
    private var leftPage: some View {
        ZStack {
            // Paper
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [
                            Color(red: 0.98, green: 0.97, blue: 0.95),
                            Color(red: 0.99, green: 0.98, blue: 0.96),
                            Color(red: 0.98, green: 0.97, blue: 0.94)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            // Ruled lines for left page
            ruledLines
                .padding(.leading, 40)
            
            // Left page content (summary of previous section)
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Spacer()
                    Text(leftPageTitle)
                        .font(.system(size: 14, weight: .medium, design: .serif))
                        .foregroundColor(.gray.opacity(0.6))
                        .padding(.trailing, 30)
                }
                
                Spacer()
                
                // Page number on left
                HStack {
                    Text("\(currentPage - 1)")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray.opacity(0.5))
                        .padding(.leading, 30)
                    Spacer()
                }
            }
            .padding(.vertical, 30)
            
            // Holes for ring binding
            if styleManager.showSpiralBinding {
                ringBindingHoles(alignment: .trailing)
            }
        }
        .clipShape(LeftPageShape())
        .shadow(color: .black.opacity(0.15), radius: 3, x: 2, y: 0)
    }
    
    // MARK: - Right Page  
    private var rightPage: some View {
        ZStack {
            // Paper
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
            
            // Current page content
            TabView(selection: $selectedTab) {
                pageContent(PageFlipCalendarView()).tag(0)
                pageContent(PlannerTasksView()).tag(1)
                pageContent(PlannerGroceryView()).tag(2)
                pageContent(PlannerSleepView()).tag(3)
                pageContent(PlannerSettingsView()).tag(4)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .onChange(of: selectedTab) { newValue in
                withAnimation(.easeInOut(duration: 0.5)) {
                    isFlipping = true
                    currentPage = newValue + 1
                }
                
                // Haptic feedback
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
                
                // Reset flip animation
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                    isFlipping = false
                }
            }
            
            // Page number on right
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(currentPage)")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray.opacity(0.5))
                        .padding(.trailing, 30)
                        .padding(.bottom, 90)
                }
            }
            
            // Page corner curl (indicating more pages)
            if selectedTab < 4 {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        pageCurlCorner
                    }
                }
                .padding(.bottom, 90)
            }
            
            // Holes for ring binding
            if styleManager.showSpiralBinding {
                ringBindingHoles(alignment: .leading)
            }
        }
        .clipShape(RightPageShape())
        .shadow(color: .black.opacity(0.15), radius: 3, x: -2, y: 0)
        .rotation3DEffect(
            .degrees(isFlipping ? -10 : 0),
            axis: (x: 0, y: 1, z: 0),
            anchor: .leading,
            perspective: 0.3
        )
    }
    
    // MARK: - Center Binding
    private var centerBinding: some View {
        LinearGradient(
            colors: [
                Color.black.opacity(0.6),
                Color.black.opacity(0.4),
                Color.black.opacity(0.6)
            ],
            startPoint: .leading,
            endPoint: .trailing
        )
        .overlay(
            // Spiral coils
            VStack(spacing: 35) {
                ForEach(0..<12, id: \.self) { _ in
                    Circle()
                        .strokeBorder(Color.gray.opacity(0.8), lineWidth: 1.5)
                        .background(Circle().fill(Color.black.opacity(0.3)))
                        .frame(width: 6, height: 6)
                }
            }
            .padding(.vertical, 40)
        )
    }
    
    // MARK: - Ring Binding Holes
    private func ringBindingHoles(alignment: HorizontalAlignment) -> some View {
        VStack(spacing: 50) {
            ForEach(0..<10, id: \.self) { _ in
                Circle()
                    .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1)
                    .background(Circle().fill(Color.white.opacity(0.8)))
                    .frame(width: 10, height: 10)
                    .shadow(color: .black.opacity(0.2), radius: 2, x: 1, y: 1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: alignment == .leading ? .topLeading : .topTrailing)
        .padding(alignment == .leading ? .leading : .trailing, 15)
        .padding(.vertical, 50)
    }
    
    // MARK: - Ruled Lines
    private var ruledLines: some View {
        VStack(spacing: 24) {
            ForEach(0..<20, id: \.self) { _ in
                Rectangle()
                    .fill(Color.blue.opacity(0.08))
                    .frame(height: 1)
            }
        }
        .padding(.top, 50)
        .padding(.trailing, 30)
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
