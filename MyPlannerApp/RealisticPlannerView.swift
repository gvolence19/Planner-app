import SwiftUI

// MARK: - Enhanced Planner Container with Realistic Page Flips
// Makes the app look like flipping through a real physical planner

struct RealisticPlannerContainer: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @StateObject private var styleManager = PlannerStyleManager.shared
    @State private var selectedTab = 0
    @State private var currentPage = 1
    @State private var dragOffset: CGFloat = 0
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Book/planner background
            Color.black.opacity(0.1)
                .ignoresSafeArea()
            
            // Main planner book with 3D page flip
            GeometryReader { geometry in
                ZStack {
                    // Shadow under the book
                    RoundedRectangle(cornerRadius: 20)
                        .fill(Color.black.opacity(0.3))
                        .offset(y: 10)
                        .blur(radius: 20)
                        .padding(.horizontal, 30)
                    
                    // The actual planner book
                    plannerBook(geometry: geometry)
                }
            }
            
            // Tab bar at bottom (outside the book)
            BookTabBar(selectedTab: $selectedTab)
                .padding(.bottom, 20)
        }
        .background(Color(white: 0.95))
    }
    
    private func plannerBook(geometry: GeometryProxy) -> some View {
        ZStack {
            // Book spine/binding in the middle
            Rectangle()
                .fill(
                    LinearGradient(
                        colors: [
                            theme.primaryColor.color.opacity(0.8),
                            theme.primaryColor.color,
                            theme.primaryColor.color.opacity(0.8)
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .frame(width: 8)
                .shadow(color: .black.opacity(0.5), radius: 4, x: -2, y: 0)
                .shadow(color: .black.opacity(0.5), radius: 4, x: 2, y: 0)
            
            // Pages
            TabView(selection: $selectedTab) {
                // Tab 0: Calendar
                plannerPage {
                    PageFlipCalendarView()
                }
                .tag(0)
                
                // Tab 1: Tasks
                plannerPage {
                    PlannerTasksView()
                }
                .tag(1)
                
                // Tab 2: Grocery
                plannerPage {
                    PlannerGroceryView()
                }
                .tag(2)
                
                // Tab 3: Sleep
                plannerPage {
                    PlannerSleepView()
                }
                .tag(3)
                
                // Tab 4: Settings
                plannerPage {
                    PlannerSettingsView()
                }
                .tag(4)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .onChange(of: selectedTab) { newValue in
                currentPage = newValue + 1
                // Add haptic feedback for page turn
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
            
            // Page curl effect on right edge
            if selectedTab < 4 {
                pageCurlIndicator()
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .trailing)
            }
            
            // Page number at bottom
            if styleManager.showPageNumbers {
                VStack {
                    Spacer()
                    HStack {
                        Spacer()
                        Text("\(currentPage)")
                            .font(.system(size: 14, design: .serif))
                            .foregroundColor(theme.secondaryColor.color.opacity(0.6))
                            .padding(.trailing, 30)
                            .padding(.bottom, 100)
                    }
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 5)
        .padding(.horizontal, 20)
        .padding(.vertical, 40)
    }
    
    private func plannerPage<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        ZStack {
            // Paper background
            RoundedRectangle(cornerRadius: 20)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white,
                            Color(white: 0.98),
                            Color.white
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            // Paper texture
            Image(systemName: "circle.fill")
                .resizable()
                .opacity(0.01)
                .blendMode(.overlay)
            
            // Spiral holes on left side
            if styleManager.showSpiralBinding {
                VStack(spacing: 30) {
                    ForEach(0..<20, id: \.self) { _ in
                        ZStack {
                            Circle()
                                .fill(Color.white)
                                .frame(width: 12, height: 12)
                            
                            Circle()
                                .strokeBorder(theme.primaryColor.color.opacity(0.3), lineWidth: 2)
                                .frame(width: 12, height: 12)
                        }
                        .shadow(color: .black.opacity(0.2), radius: 2, x: 1, y: 1)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.leading, 15)
            }
            
            // Actual content
            content()
        }
        .rotation3DEffect(
            .degrees(getRotationAngle()),
            axis: (x: 0, y: 1, z: 0),
            anchor: .leading,
            perspective: 0.5
        )
    }
    
    private func pageCurlIndicator() -> some View {
        ZStack {
            // Curled corner shadow
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 40, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 40))
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [Color.black.opacity(0.1), Color.clear],
                    startPoint: .topTrailing,
                    endPoint: .bottomLeading
                )
            )
            .frame(width: 40, height: 40)
            
            // Curled page corner
            Path { path in
                path.move(to: CGPoint(x: 0, y: 0))
                path.addLine(to: CGPoint(x: 35, y: 0))
                path.addLine(to: CGPoint(x: 0, y: 35))
                path.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [Color.white, Color(white: 0.95)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .frame(width: 35, height: 35)
            .shadow(color: .black.opacity(0.3), radius: 3, x: -2, y: 2)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
        .padding(.trailing, 20)
        .padding(.top, 40)
    }
    
    private func getRotationAngle() -> Double {
        // Subtle 3D rotation for depth
        let angle = Double(dragOffset) / 10.0
        return min(max(angle, -5), 5)
    }
}

// MARK: - Enhanced Tab Bar with Book Tabs
struct BookTabBar: View {
    @Binding var selectedTab: Int
    @EnvironmentObject var themeManager: ThemeManager
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    let tabs: [(icon: String, title: String, color: Color)] = [
        ("calendar", "Today", .blue),
        ("checklist", "Tasks", .green),
        ("cart", "Grocery", .orange),
        ("moon.zzz", "Sleep", .purple),
        ("gearshape", "Settings", .gray)
    ]
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(0..<tabs.count, id: \.self) { index in
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedTab = index
                        let impact = UIImpactFeedbackGenerator(style: .light)
                        impact.impactOccurred()
                    }
                } label: {
                    bookTab(index: index)
                }
            }
        }
        .frame(height: 60)
        .background(
            RoundedRectangle(cornerRadius: 15)
                .fill(Color.white)
                .shadow(color: .black.opacity(0.15), radius: 10, y: -5)
        )
        .padding(.horizontal, 20)
    }
    
    private func bookTab(index: Int) -> some View {
        VStack(spacing: 4) {
            // Color tab sticking out the top
            RoundedRectangle(cornerRadius: 4)
                .fill(tabs[index].color)
                .frame(width: 60, height: selectedTab == index ? 8 : 4)
                .offset(y: selectedTab == index ? -4 : 0)
            
            Image(systemName: tabs[index].icon)
                .font(.system(size: 22, weight: selectedTab == index ? .semibold : .regular))
                .foregroundColor(selectedTab == index ? tabs[index].color : .gray)
            
            Text(tabs[index].title)
                .font(.system(size: 10, weight: selectedTab == index ? .semibold : .regular))
                .foregroundColor(selectedTab == index ? tabs[index].color : .gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(
            selectedTab == index ?
            RoundedRectangle(cornerRadius: 10)
                .fill(tabs[index].color.opacity(0.1))
            : nil
        )
    }
}

// MARK: - Page Shadow Effect
struct PageShadowModifier: ViewModifier {
    let isLeftPage: Bool
    
    func body(content: Content) -> some View {
        content
            .shadow(
                color: .black.opacity(isLeftPage ? 0.1 : 0.2),
                radius: isLeftPage ? 5 : 10,
                x: isLeftPage ? -3 : 3,
                y: 0
            )
    }
}
