import SwiftUI

// MARK: - Proper Planner (Matches good.png Reference)
// Full realistic planner pages with proper depth and spacing

struct ProperPlannerDesign: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var selectedTab = 0
    
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
        GeometryReader { geometry in
            ZStack {
                // Light gray background
                Color(white: 0.94)
                    .ignoresSafeArea()
                
                HStack(spacing: 0) {
                    // Main planner page (takes most of screen)
                    plannerPage
                        .frame(maxWidth: .infinity)
                        .padding(.leading, 15)
                        .padding(.trailing, 100) // Space for tabs
                        .padding(.vertical, 50)
                    
                    // Divider tabs on right
                    dividerTabs
                        .frame(width: 85)
                        .padding(.vertical, 60)
                        .padding(.trailing, 15)
                }
            }
        }
        .ignoresSafeArea()
    }
    
    // MARK: - Planner Page
    private var plannerPage: some View {
        ZStack {
            // Page shadow
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.black.opacity(0.08))
                .offset(x: -3, y: 5)
                .blur(radius: 8)
            
            // White page
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.15), radius: 10, x: -3, y: 5)
            
            // Page content
            VStack(spacing: 0) {
                TabView(selection: $selectedTab) {
                    scrollContent(PageFlipCalendarView()).tag(0)
                    scrollContent(PlannerTasksView()).tag(1)
                    scrollContent(PlannerGroceryView()).tag(2)
                    scrollContent(PlannerSleepView()).tag(3)
                    scrollContent(PlannerSettingsView()).tag(4)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .onChange(of: selectedTab) { _ in
                    let impact = UIImpactFeedbackGenerator(style: .medium)
                    impact.impactOccurred()
                }
            }
            .padding(.leading, 55)
            .padding(.trailing, 15)
            .padding(.vertical, 25)
            
            // Spiral holes
            spiralHoles
            
            // Page curl bottom right
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    pageCurlEffect
                }
            }
            
            // Page number
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(selectedTab + 1)")
                        .font(.system(size: 11, design: .serif))
                        .foregroundColor(.gray.opacity(0.4))
                        .padding(.trailing, 25)
                        .padding(.bottom, 50)
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    // MARK: - Scrollable Content
    private func scrollContent<Content: View>(_ content: Content) -> some View {
        ScrollView(showsIndicators: false) {
            content
                .padding(.horizontal, 8)
        }
    }
    
    // MARK: - Spiral Holes
    private var spiralHoles: some View {
        VStack(spacing: 42) {
            ForEach(0..<13, id: \.self) { _ in
                Circle()
                    .fill(Color.white)
                    .frame(width: 9, height: 9)
                    .overlay(
                        Circle()
                            .strokeBorder(Color.gray.opacity(0.25), lineWidth: 1)
                    )
                    .shadow(color: .black.opacity(0.12), radius: 2, x: 1, y: 1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 23)
        .padding(.top, 45)
    }
    
    // MARK: - Page Curl Effect
    private var pageCurlEffect: some View {
        ZStack {
            // Shadow under curl
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 50, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 50))
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [
                        Color.black.opacity(0.06),
                        Color.clear
                    ],
                    startPoint: .topTrailing,
                    endPoint: .bottomLeading
                )
            )
            
            // Curled page corner
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 45, y: 0))
                path.addQuadCurve(
                    to: CGPoint(x: 0, y: 45),
                    control: CGPoint(x: 15, y: 15)
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
            .shadow(color: .black.opacity(0.2), radius: 5, x: -3, y: 3)
        }
        .frame(width: 50, height: 50)
        .padding(.trailing, 8)
        .padding(.bottom, 8)
    }
    
    // MARK: - Divider Tabs
    private var dividerTabs: some View {
        VStack(spacing: 15) {
            ForEach(0..<sections.count, id: \.self) { index in
                tabButton(index: index)
            }
            
            Spacer()
        }
    }
    
    private func tabButton(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                selectedTab = index
            }
        } label: {
            VStack(spacing: 8) {
                ZStack {
                    // Tab background
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
                            width: isSelected ? 75 : 65,
                            height: isSelected ? 85 : 75
                        )
                        .shadow(
                            color: sections[index].2.opacity(0.4),
                            radius: isSelected ? 8 : 4,
                            x: 2,
                            y: 3
                        )
                    
                    // Icon and label
                    VStack(spacing: 6) {
                        Text(sections[index].0)
                            .font(.system(size: isSelected ? 34 : 28))
                        
                        Text(sections[index].1)
                            .font(.system(
                                size: isSelected ? 11 : 9,
                                weight: .semibold
                            ))
                            .lineLimit(1)
                    }
                    .foregroundColor(.white)
                    .shadow(color: .black.opacity(0.2), radius: 1, y: 1)
                }
            }
            .scaleEffect(isSelected ? 1.05 : 1.0)
        }
        .buttonStyle(.plain)
    }
}
