import SwiftUI

// MARK: - Clean Realistic Planner
// Looks like a real planner with smooth page-flip animations

struct CleanRealisticPlanner: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var selectedTab = 0
    @State private var dragAmount: CGFloat = 0
    
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
            Color(red: 0.94, green: 0.94, blue: 0.95)
                .ignoresSafeArea()
            
            // Planner book
            GeometryReader { geometry in
                ZStack(alignment: .trailing) {
                    // Page with shadow
                    plannerPage
                        .padding(.horizontal, 25)
                        .padding(.vertical, 60)
                    
                    // Divider tabs on the right edge (OUTSIDE the page)
                    dividerTabs
                        .padding(.trailing, 15)
                        .padding(.top, 80)
                }
            }
        }
        .ignoresSafeArea()
    }
    
    // MARK: - Planner Page
    private var plannerPage: some View {
        ZStack {
            // White page with shadow
            RoundedRectangle(cornerRadius: 10)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.15), radius: 15, x: -5, y: 8)
            
            // Spiral holes on left
            spiralHoles
            
            // Page content
            TabView(selection: $selectedTab) {
                pageContent(PageFlipCalendarView()).tag(0)
                pageContent(PlannerTasksView()).tag(1)
                pageContent(PlannerGroceryView()).tag(2)
                pageContent(PlannerSleepView()).tag(3)
                pageContent(PlannerSettingsView()).tag(4)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.spring(response: 0.5, dampingFraction: 0.8), value: selectedTab)
            .onChange(of: selectedTab) { _ in
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
            .padding(.leading, 70)
            .padding(.trailing, 25)
            .padding(.vertical, 35)
            
            // Page curl
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    pageCurl
                        .padding(.trailing, 30)
                        .padding(.bottom, 70)
                }
            }
            
            // Page number
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(selectedTab + 1)")
                        .font(.system(size: 13, design: .serif))
                        .foregroundColor(.gray.opacity(0.5))
                        .padding(.trailing, 40)
                        .padding(.bottom, 85)
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .rotation3DEffect(
            .degrees(Double(dragAmount) * -0.15),
            axis: (x: 0, y: 1, z: 0),
            anchor: .leading,
            perspective: 0.6
        )
    }
    
    // MARK: - Page Content
    private func pageContent<Content: View>(_ content: Content) -> some View {
        ScrollView {
            content
                .padding(.horizontal, 15)
                .padding(.vertical, 10)
        }
    }
    
    // MARK: - Spiral Holes
    private var spiralHoles: some View {
        VStack(spacing: 50) {
            ForEach(0..<11, id: \.self) { _ in
                Circle()
                    .strokeBorder(Color.gray.opacity(0.3), lineWidth: 1.5)
                    .background(Circle().fill(Color.white))
                    .frame(width: 12, height: 12)
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
                path.addLine(to: CGPoint(x: 35, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 35))
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
                path.addLine(to: CGPoint(x: 30, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 30))
                path.closeSubpath()
            }
            .fill(Color(red: 0.96, green: 0.95, blue: 0.94))
            .shadow(color: .black.opacity(0.2), radius: 4, x: -2, y: 2)
        }
    }
    
    // MARK: - Divider Tabs
    private var dividerTabs: some View {
        VStack(spacing: 10) {
            ForEach(0..<sections.count, id: \.self) { index in
                tabButton(index: index)
            }
        }
        .frame(maxHeight: .infinity, alignment: .top)
    }
    
    private func tabButton(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.75)) {
                selectedTab = index
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
        } label: {
            ZStack {
                // Tab shape
                RoundedRectangle(cornerRadius: 6)
                    .fill(
                        LinearGradient(
                            colors: [
                                sections[index].2,
                                sections[index].2.opacity(0.85)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(width: isSelected ? 70 : 55, height: 85)
                    .shadow(color: .black.opacity(0.3), radius: 5, x: 2, y: 2)
                
                // Icon and label
                VStack(spacing: 6) {
                    Text(sections[index].0)
                        .font(.system(size: isSelected ? 32 : 26))
                    
                    Text(sections[index].1)
                        .font(.system(size: isSelected ? 11 : 9, weight: .semibold))
                        .lineLimit(1)
                }
                .foregroundColor(.white)
            }
        }
        .buttonStyle(.plain)
    }
}
