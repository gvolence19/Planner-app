import SwiftUI

// MARK: - Realistic Page-Flip Planner
// Actually feels like flipping through a physical book

struct RealisticPageFlipPlanner: View {
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
            // Desk background
            Color(white: 0.93)
                .ignoresSafeArea()
            
            GeometryReader { geometry in
                ZStack {
                    // Previous page (visible during flip)
                    if selectedTab > 0 {
                        plannerPage(for: selectedTab - 1, geometry: geometry)
                            .opacity(dragAmount < 0 ? 0.5 : 0)
                            .offset(x: -10)
                    }
                    
                    // Current page with 3D flip
                    plannerPage(for: selectedTab, geometry: geometry)
                        .rotation3DEffect(
                            .degrees(Double(dragAmount) * 0.25),
                            axis: (x: 0, y: 1, z: 0),
                            anchor: .leading,
                            anchorZ: 0,
                            perspective: 0.3
                        )
                        .offset(x: dragAmount * 0.5)
                        .shadow(
                            color: .black.opacity(abs(dragAmount) * 0.001),
                            radius: abs(dragAmount) * 0.2,
                            x: dragAmount > 0 ? -5 : 5,
                            y: 0
                        )
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    isDragging = true
                                    // Allow both directions
                                    dragAmount = value.translation.width
                                }
                                .onEnded { value in
                                    withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) {
                                        // Flip forward
                                        if dragAmount < -80 && selectedTab < 4 {
                                            selectedTab += 1
                                            let impact = UIImpactFeedbackGenerator(style: .medium)
                                            impact.impactOccurred()
                                        }
                                        // Flip backward
                                        else if dragAmount > 80 && selectedTab > 0 {
                                            selectedTab -= 1
                                            let impact = UIImpactFeedbackGenerator(style: .medium)
                                            impact.impactOccurred()
                                        }
                                        
                                        dragAmount = 0
                                        isDragging = false
                                    }
                                }
                        )
                    
                    // Next page peek (visible on right edge)
                    if selectedTab < 4 && !isDragging {
                        plannerPage(for: selectedTab + 1, geometry: geometry)
                            .offset(x: geometry.size.width - 100)
                            .opacity(0.3)
                            .allowsHitTesting(false)
                    }
                    
                    // Divider tabs on right
                    dividerTabs
                        .padding(.trailing, 15)
                        .padding(.vertical, 60)
                }
            }
        }
        .ignoresSafeArea()
        .preferredColorScheme(.light)
    }
    
    // MARK: - Planner Page
    private func plannerPage(for index: Int, geometry: GeometryProxy) -> some View {
        ZStack {
            // Page shadow
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.black.opacity(0.12))
                .offset(x: -4, y: 6)
                .blur(radius: 12)
            
            // White page
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.18), radius: 12, x: -4, y: 6)
            
            // Spiral holes
            spiralHoles
            
            // Content
            contentView(for: index)
                .padding(.leading, 70)
                .padding(.trailing, 30)
                .padding(.top, 45)
                .padding(.bottom, 75)
            
            // Page curl
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    pageCurl
                        .padding(.trailing, 25)
                        .padding(.bottom, 80)
                }
            }
            
            // Page number
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(index + 1)")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray.opacity(0.45))
                        .padding(.trailing, 35)
                        .padding(.bottom, 90)
                }
            }
        }
        .frame(maxWidth: geometry.size.width - 120)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .padding(.leading, 20)
        .padding(.vertical, 55)
    }
    
    // MARK: - Content View
    private func contentView(for index: Int) -> some View {
        ScrollView(showsIndicators: false) {
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
            .padding(.horizontal, 18)
            .padding(.vertical, 12)
        }
        .background(Color.white)
    }
    
    // MARK: - Spiral Holes
    private var spiralHoles: some View {
        VStack(spacing: 48) {
            ForEach(0..<11, id: \.self) { _ in
                Circle()
                    .fill(Color.white)
                    .frame(width: 11, height: 11)
                    .overlay(
                        Circle()
                            .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1.2)
                    )
                    .shadow(color: .black.opacity(0.15), radius: 2, x: 2, y: 1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 28)
        .padding(.top, 60)
    }
    
    // MARK: - Page Curl
    private var pageCurl: some View {
        ZStack {
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 40, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 40))
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [Color.black.opacity(0.08), Color.clear],
                    startPoint: .topTrailing,
                    endPoint: .bottomLeading
                )
            )
            
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 35, y: 0))
                path.addQuadCurve(
                    to: CGPoint(x: 0, y: 35),
                    control: CGPoint(x: 12, y: 12)
                )
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [
                        Color(white: 0.97),
                        Color(white: 0.94)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .shadow(color: .black.opacity(0.25), radius: 5, x: -3, y: 3)
        }
    }
    
    // MARK: - Divider Tabs
    private var dividerTabs: some View {
        VStack(spacing: 16) {
            ForEach(0..<sections.count, id: \.self) { index in
                tabButton(index: index)
            }
            Spacer()
        }
        .frame(maxWidth: .infinity, alignment: .trailing)
    }
    
    private func tabButton(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                selectedTab = index
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
        } label: {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(
                        LinearGradient(
                            colors: [
                                sections[index].2.opacity(0.95),
                                sections[index].2.opacity(0.8)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(
                        width: isSelected ? 75 : 62,
                        height: isSelected ? 88 : 78
                    )
                    .shadow(
                        color: sections[index].2.opacity(0.4),
                        radius: isSelected ? 10 : 6,
                        x: 3,
                        y: 3
                    )
                
                VStack(spacing: 6) {
                    Text(sections[index].0)
                        .font(.system(size: isSelected ? 34 : 27))
                    
                    Text(sections[index].1)
                        .font(.system(
                            size: isSelected ? 11 : 9,
                            weight: .semibold
                        ))
                        .lineLimit(1)
                }
                .foregroundColor(.white)
                .shadow(color: .black.opacity(0.25), radius: 1, y: 1)
            }
            .scaleEffect(isSelected ? 1.05 : 1.0)
        }
        .buttonStyle(.plain)
    }
}
