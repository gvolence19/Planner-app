import SwiftUI

// MARK: - Realistic Planner with Page Depth
// Matches the reference image with visible page edges, shadows, and realistic spacing

struct RealisticDepthPlanner: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var selectedTab = 0
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
        ZStack {
            // Background (desk/table surface)
            Color(red: 0.93, green: 0.93, blue: 0.94)
                .ignoresSafeArea()
            
            // The planner book with visible edges
            GeometryReader { geometry in
                ZStack {
                    // Page shadow underneath
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color.black.opacity(0.12))
                        .offset(y: 10)
                        .blur(radius: 15)
                        .padding(.horizontal, 35)
                        .padding(.vertical, 70)
                    
                    // Main planner page
                    plannerPage(geometry: geometry)
                        .padding(.horizontal, 40)
                        .padding(.vertical, 75)
                    
                    // Divider tabs on right edge
                    dividerTabs
                        .padding(.trailing, 20)
                        .padding(.vertical, 100)
                }
            }
        }
        .ignoresSafeArea()
    }
    
    // MARK: - Planner Page
    private func plannerPage(geometry: GeometryProxy) -> some View {
        ZStack {
            // White page with rounded corners
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white,
                            Color(red: 0.99, green: 0.99, blue: 0.98),
                            Color.white
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .shadow(color: .black.opacity(0.15), radius: 12, x: -4, y: 6)
            
            // Page content
            VStack(spacing: 0) {
                TabView(selection: $selectedTab) {
                    scrollableContent(PageFlipCalendarView()).tag(0)
                    scrollableContent(PlannerTasksView()).tag(1)
                    scrollableContent(PlannerGroceryView()).tag(2)
                    scrollableContent(PlannerSleepView()).tag(3)
                    scrollableContent(PlannerSettingsView()).tag(4)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .onChange(of: selectedTab) { newValue in
                    withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                        isFlipping = true
                        let impact = UIImpactFeedbackGenerator(style: .medium)
                        impact.impactOccurred()
                        
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            isFlipping = false
                        }
                    }
                }
            }
            .padding(.leading, 75) // Space for spiral
            .padding(.trailing, 70) // Space for tabs
            .padding(.vertical, 40)
            
            // Spiral punch holes on left
            spiralHoles
            
            // Page curl in bottom-right corner
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    pageCurl
                        .padding(.trailing, 45)
                        .padding(.bottom, 45)
                }
            }
            
            // Page number
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(selectedTab + 1)")
                        .font(.system(size: 15, design: .serif))
                        .foregroundColor(.gray.opacity(0.6))
                        .padding(.trailing, 55)
                        .padding(.bottom, 60)
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    // MARK: - Scrollable Content
    private func scrollableContent<Content: View>(_ content: Content) -> some View {
        ScrollView {
            content
                .padding(.horizontal, 25)
                .padding(.vertical, 20)
        }
    }
    
    // MARK: - Spiral Holes
    private var spiralHoles: some View {
        VStack(spacing: 48) {
            ForEach(0..<12, id: \.self) { _ in
                Circle()
                    .fill(Color.white)
                    .frame(width: 13, height: 13)
                    .overlay(
                        Circle()
                            .strokeBorder(Color.gray.opacity(0.35), lineWidth: 1.5)
                    )
                    .shadow(color: .black.opacity(0.2), radius: 3, x: 2, y: 2)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 35)
        .padding(.top, 55)
    }
    
    // MARK: - Page Curl
    private var pageCurl: some View {
        ZStack {
            // Shadow
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 45, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 45))
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [Color.black.opacity(0.12), Color.clear],
                    startPoint: .topTrailing,
                    endPoint: .bottomLeading
                )
            )
            
            // Curled corner
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 38, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 38))
                path.closeSubpath()
            }
            .fill(Color(red: 0.95, green: 0.94, blue: 0.93))
            .shadow(color: .black.opacity(0.25), radius: 5, x: -2, y: 3)
        }
        .frame(width: 45, height: 45)
    }
    
    // MARK: - Divider Tabs
    private var dividerTabs: some View {
        VStack(spacing: 8) {
            ForEach(0..<tabs.count, id: \.self) { index in
                dividerTab(index: index)
            }
        }
        .frame(maxHeight: .infinity, alignment: .top)
    }
    
    private func dividerTab(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                selectedTab = index
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
        } label: {
            HStack(spacing: 0) {
                // Label on page (when selected)
                if isSelected {
                    HStack(spacing: 10) {
                        Text(tabs[index].0)
                            .font(.system(size: 26))
                        Text(tabs[index].1)
                            .font(.system(size: 15, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(
                        Capsule()
                            .fill(tabs[index].2.opacity(0.95))
                    )
                    .transition(.scale.combined(with: .opacity))
                    .padding(.trailing, 8)
                }
                
                // Tab sticking out
                ZStack {
                    // Tab background
                    RoundedRectangle(cornerRadius: 8)
                        .fill(
                            LinearGradient(
                                colors: [
                                    tabs[index].2,
                                    tabs[index].2.opacity(0.85)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(width: isSelected ? 65 : 50, height: 90)
                        .shadow(color: .black.opacity(0.25), radius: 6, x: 3, y: 3)
                    
                    // Icon on tab
                    VStack(spacing: 5) {
                        Text(tabs[index].0)
                            .font(.system(size: isSelected ? 30 : 24))
                        
                        if !isSelected {
                            Text(tabs[index].1)
                                .font(.system(size: 9, weight: .medium))
                                .lineLimit(1)
                        }
                    }
                    .foregroundColor(.white)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
