import SwiftUI

// MARK: - Proper Physical Planner
// Clean design that actually looks like a real planner book

struct ProperPhysicalPlanner: View {
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
        ZStack {
            // Wooden desk background
            LinearGradient(
                colors: [
                    Color(red: 0.85, green: 0.82, blue: 0.78),
                    Color(red: 0.80, green: 0.77, blue: 0.73)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // The planner book
            VStack(spacing: 0) {
                Spacer()
                    .frame(height: 40)
                
                // Planner with tabs
                ZStack(alignment: .trailing) {
                    // Main page
                    plannerPage
                        .padding(.leading, 20)
                        .padding(.trailing, 90) // Space for tabs
                        .padding(.vertical, 50)
                    
                    // Tabs sticking out on right
                    tabBar
                        .padding(.trailing, 10)
                        .padding(.vertical, 70)
                }
                
                Spacer()
                    .frame(height: 40)
            }
        }
        .ignoresSafeArea()
    }
    
    // MARK: - Planner Page
    private var plannerPage: some View {
        ZStack {
            // Page shadow
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.black.opacity(0.1))
                .offset(y: 6)
                .blur(radius: 10)
            
            // White page
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.2), radius: 12, x: -4, y: 6)
            
            // Content area
            VStack(spacing: 0) {
                // Page content with smooth transitions
                TabView(selection: $selectedTab) {
                    pageContent(PageFlipCalendarView()).tag(0)
                    pageContent(PlannerTasksView()).tag(1)
                    pageContent(PlannerGroceryView()).tag(2)
                    pageContent(PlannerSleepView()).tag(3)
                    pageContent(PlannerSettingsView()).tag(4)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .onChange(of: selectedTab) { _ in
                    let impact = UIImpactFeedbackGenerator(style: .medium)
                    impact.impactOccurred()
                }
            }
            .padding(.leading, 60) // Spiral space
            .padding(.trailing, 20)
            .padding(.vertical, 30)
            
            // Spiral holes
            spiralHoles
            
            // Page number
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Text("\(selectedTab + 1)")
                        .font(.system(size: 12, design: .serif))
                        .foregroundColor(.gray.opacity(0.5))
                        .padding(.trailing, 25)
                        .padding(.bottom, 35)
                }
            }
            
            // Page curl corner
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Image(systemName: "doc.plaintext")
                        .font(.system(size: 20))
                        .foregroundColor(.gray.opacity(0.2))
                        .rotationEffect(.degrees(45))
                        .padding(.trailing, 20)
                        .padding(.bottom, 30)
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    // MARK: - Page Content
    private func pageContent<Content: View>(_ content: Content) -> some View {
        ScrollView {
            content
                .padding(.horizontal, 10)
        }
    }
    
    // MARK: - Spiral Holes
    private var spiralHoles: some View {
        VStack(spacing: 45) {
            ForEach(0..<12, id: \.self) { _ in
                Circle()
                    .strokeBorder(Color.gray.opacity(0.25), lineWidth: 1)
                    .background(Circle().fill(Color.white))
                    .frame(width: 10, height: 10)
                    .shadow(color: .black.opacity(0.1), radius: 2, x: 1, y: 1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(.leading, 25)
        .padding(.top, 50)
    }
    
    // MARK: - Tab Bar
    private var tabBar: some View {
        VStack(spacing: 12) {
            ForEach(0..<sections.count, id: \.self) { index in
                tabButton(index: index)
            }
        }
    }
    
    private func tabButton(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                selectedTab = index
            }
        } label: {
            ZStack {
                // Tab background
                RoundedRectangle(cornerRadius: 5)
                    .fill(
                        LinearGradient(
                            colors: [
                                sections[index].2,
                                sections[index].2.opacity(0.8)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: isSelected ? 75 : 60, height: 80)
                    .shadow(color: .black.opacity(0.25), radius: 4, x: 2, y: 2)
                
                // Tab content
                VStack(spacing: 5) {
                    Text(sections[index].0)
                        .font(.system(size: isSelected ? 30 : 24))
                    
                    Text(sections[index].1)
                        .font(.system(size: isSelected ? 10 : 8, weight: .semibold))
                        .lineLimit(1)
                }
                .foregroundColor(.white)
            }
        }
        .buttonStyle(.plain)
    }
}
