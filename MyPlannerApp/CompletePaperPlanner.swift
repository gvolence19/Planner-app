import SwiftUI

// MARK: - Complete Authentic Paper Planner
// Every detail perfected - truly looks and feels like a real paper planner

struct CompletePaperPlanner: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var selectedTab = 0
    @State private var dragAmount: CGFloat = 0
    @State private var isDragging = false
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    let sections = [
        ("📅", "Today", Color.blue),
        ("✅", "Tasks", Color.green),
        ("🛒", "Grocery", Color.orange),
        ("😴", "Sleep", Color.purple),
        ("⚙️", "Settings", Color.gray)
    ]
    
    var body: some View {
        ZStack {
            // Desk surface
            LinearGradient(
                colors: [
                    Color(red: 0.92, green: 0.92, blue: 0.93),
                    Color(red: 0.90, green: 0.90, blue: 0.91)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            GeometryReader { geometry in
                HStack(spacing: 0) {
                    // Main planner
                    plannerStack(geometry: geometry)
                        .frame(maxWidth: .infinity)
                        .padding(.leading, 15)
                        .padding(.trailing, 10)
                        .padding(.vertical, 45)
                    
                    // Tabs
                    dividerTabs
                        .frame(width: 95)
                        .padding(.trailing, 10)
                        .padding(.vertical, 55)
                }
            }
        }
        .ignoresSafeArea()
        .preferredColorScheme(.light)
    }
    
    // MARK: - Planner Stack
    private func plannerStack(geometry: GeometryProxy) -> some View {
        ZStack {
            // Stacked page shadows for depth
            ForEach(0..<3, id: \.self) { i in
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.black.opacity(0.04))
                    .offset(x: CGFloat(-3 - i), y: CGFloat(5 + i * 2))
                    .blur(radius: 8)
            }
            
            // Page edges showing (right side)
            pageEdgesStack
            
            // Main page
            plannerPage(for: selectedTab, geometry: geometry)
                .rotation3DEffect(
                    .degrees(Double(dragAmount) * 0.15),
                    axis: (x: 0, y: 1, z: 0),
                    anchor: .leading,
                    perspective: 0.4
                )
                .offset(x: dragAmount * 0.3)
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            isDragging = true
                            dragAmount = value.translation.width
                        }
                        .onEnded { value in
                            withAnimation(.spring(response: 0.45, dampingFraction: 0.75)) {
                                // Forward flip
                                if dragAmount < -120 && selectedTab < 4 {
                                    selectedTab += 1
                                    let impact = UIImpactFeedbackGenerator(style: .medium)
                                    impact.impactOccurred()
                                }
                                // Backward flip
                                else if dragAmount > 120 && selectedTab > 0 {
                                    selectedTab -= 1
                                    let impact = UIImpactFeedbackGenerator(style: .medium)
                                    impact.impactOccurred()
                                }
                                dragAmount = 0
                                isDragging = false
                            }
                        }
                )
        }
    }
    
    // MARK: - Page Edges Stack (Right Side)
    private var pageEdgesStack: some View {
        VStack {
            ForEach(0..<4, id: \.self) { i in
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [
                                Color(white: 0.85),
                                Color(white: 0.90)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: 3, height: 2)
                    .offset(x: CGFloat(i) * 2)
                    .opacity(0.6)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
        .padding(.trailing, 8)
    }
    
    // MARK: - Planner Page
    private func plannerPage(for index: Int, geometry: GeometryProxy) -> some View {
        ZStack {
            // White paper
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.08), radius: 20, x: -6, y: 8)
            
            // Subtle paper texture
            paperTexture
            
            // Page right edge thickness
            pageEdgeThickness
            
            // Spiral holes
            spiralHoles
            
            // Content (ALL VIEWS WRAPPED IN WHITE)
            cleanContentArea(for: index)
                .padding(.leading, 80)
                .padding(.trailing, 35)
                .padding(.top, 50)
                .padding(.bottom, 85)
            
            // Realistic page curl
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    realisticPageCurl
                        .padding(.trailing, 20)
                        .padding(.bottom, 90)
                }
            }
            
            // Page number
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(index + 1)")
                        .font(.system(size: 11, design: .serif))
                        .foregroundColor(.gray.opacity(0.4))
                        .padding(.trailing, 40)
                        .padding(.bottom, 100)
                }
            }
            
            // Tab shadows on page (makes tabs feel attached)
            if !isDragging {
                tabShadowsOnPage(for: index)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    // MARK: - Paper Texture
    private var paperTexture: some View {
        Rectangle()
            .fill(
                Color.white.opacity(0.02)
            )
            .blendMode(.overlay)
            .allowsHitTesting(false)
    }
    
    // MARK: - Clean Content Area (WHITE BACKGROUND FOR ALL)
    private func cleanContentArea(for index: Int) -> some View {
        ZStack {
            // Force white background
            Color.white
            
            ScrollView(showsIndicators: false) {
                ZStack {
                    Color.white
                    
                    VStack(spacing: 0) {
                        Group {
                            switch index {
                            case 0: SimplePlannerCalendar()
                            case 1: SimplePlannerTasks()
                            case 2: SimplePlannerGrocery()
                            case 3: SimplePlannerSleep()
                            case 4: SimplePlannerSettings()
                            default: EmptyView()
                            }
                        }
                        .background(Color.white)
                        .colorScheme(.light)
                    }
                    .padding(.horizontal, 25)  // More horizontal space
                    .padding(.vertical, 20)     // More vertical space
                }
            }
        }
        .background(Color.white)
        .colorScheme(.light)
    }
    
    // MARK: - Tab Shadows On Page
    private func tabShadowsOnPage(for index: Int) -> some View {
        VStack(spacing: 18) {
            ForEach(0..<sections.count, id: \.self) { i in
                Rectangle()
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.clear,
                                sections[i].2.opacity(i == index ? 0.08 : 0.04)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: 40, height: i == index ? 92 : 82)
                    .blur(radius: 3)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
        .padding(.top, 55)
        .allowsHitTesting(false)
    }
    
    // MARK: - Page Edge Thickness
    private var pageEdgeThickness: some View {
        Rectangle()
            .fill(
                LinearGradient(
                    colors: [
                        Color(white: 0.88),
                        Color(white: 0.92),
                        Color.white
                    ],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .frame(width: 4)
            .shadow(color: .black.opacity(0.15), radius: 2, x: -1, y: 0)
            .frame(maxWidth: .infinity, alignment: .trailing)
    }
    
    // MARK: - Spiral Holes
    private var spiralHoles: some View {
        VStack(spacing: 52) {
            ForEach(0..<10, id: \.self) { _ in
                ZStack {
                    Circle()
                        .fill(Color.black.opacity(0.08))
                        .frame(width: 13, height: 13)
                        .blur(radius: 1)
                    
                    Circle()
                        .strokeBorder(Color.gray.opacity(0.25), lineWidth: 1.5)
                        .background(Circle().fill(Color.white))
                        .frame(width: 11, height: 11)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 32)
        .padding(.top, 70)
    }
    
    // MARK: - Realistic Page Curl
    private var realisticPageCurl: some View {
        ZStack {
            // Shadow
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addQuadCurve(
                    to: CGPoint(x: 50, y: 0),
                    control: CGPoint(x: 25, y: -5)
                )
                path.addLine(to: CGPoint(x: 50, y: 5))
                path.addQuadCurve(
                    to: CGPoint(x: 0, y: 50),
                    control: CGPoint(x: 5, y: 25)
                )
                path.addLine(to: CGPoint(x: 0, y: 45))
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [
                        Color.black.opacity(0.15),
                        Color.black.opacity(0.05),
                        Color.clear
                    ],
                    startPoint: .topTrailing,
                    endPoint: .bottomLeading
                )
            )
            .offset(x: 2, y: 2)
            
            // Curled page
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addQuadCurve(
                    to: CGPoint(x: 45, y: 0),
                    control: CGPoint(x: 22, y: -3)
                )
                path.addQuadCurve(
                    to: CGPoint(x: 0, y: 45),
                    control: CGPoint(x: 3, y: 22)
                )
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [
                        Color(white: 0.98),
                        Color(white: 0.94),
                        Color(white: 0.90)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .shadow(color: .black.opacity(0.25), radius: 6, x: -3, y: 3)
            
            // Highlight
            Path { path in
                path.move(to: CGPoint(x: 5, y: 5))
                path.addLine(to: CGPoint(x: 15, y: 5))
                path.addLine(to: CGPoint(x: 5, y: 15))
                path.closeSubpath()
            }
            .fill(Color.white.opacity(0.3))
        }
        .frame(width: 50, height: 50)
    }
    
    // MARK: - Divider Tabs
    private var dividerTabs: some View {
        VStack(spacing: 18) {
            ForEach(0..<sections.count, id: \.self) { index in
                tabButton(index: index)
            }
            Spacer()
        }
    }
    
    private func tabButton(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                selectedTab = index
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
        } label: {
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(
                        LinearGradient(
                            colors: [
                                sections[index].2,
                                sections[index].2.opacity(0.85)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(
                        width: isSelected ? 80 : 68,
                        height: isSelected ? 92 : 82
                    )
                    .shadow(
                        color: sections[index].2.opacity(0.35),
                        radius: isSelected ? 12 : 8,
                        x: isSelected ? 2 : 3,
                        y: 4
                    )
                
                VStack(spacing: 7) {
                    Text(sections[index].0)
                        .font(.system(size: isSelected ? 36 : 29))
                    
                    Text(sections[index].1)
                        .font(.system(
                            size: isSelected ? 12 : 10,
                            weight: .semibold
                        ))
                        .lineLimit(1)
                }
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.2), radius: 1, y: 1)
            }
            .scaleEffect(isSelected ? 1.0 : 0.95)
        }
        .buttonStyle(.plain)
    }
}
