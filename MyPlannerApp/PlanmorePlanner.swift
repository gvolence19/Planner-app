import SwiftUI

// MARK: - Planmore Style Planner (Exact Match)
struct PlanmorePlanner: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @State private var selectedTab = 0
    @State private var selectedDate = Date()
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    // Tabs matching Planmore exactly
    let tabs = [
        ("Day", Color(red: 0.3, green: 0.3, blue: 0.35)),
        ("Week", Color(red: 1.0, green: 0.85, blue: 0.4)),
        ("Month", Color(red: 0.6, green: 0.9, blue: 0.7)),
        ("Year", Color(red: 0.7, green: 0.8, blue: 0.95)),
        ("Tasks", Color(red: 0.95, green: 0.7, blue: 0.85)),
        ("Notes", Color(red: 1.0, green: 0.8, blue: 0.65))
    ]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                Color(white: 0.15)
                    .ignoresSafeArea()
                
                HStack(spacing: 0) {
                    // MAIN CONTENT AREA
                    mainContent
                        .frame(maxWidth: .infinity)
                        .background(Color(white: 0.12))
                        .cornerRadius(8)
                    
                    // PLANMORE-STYLE TABS
                    planmoreTabs
                        .frame(width: 85)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 30)
            }
        }
        .ignoresSafeArea()
        .preferredColorScheme(.dark)
    }
    
    // MARK: - Main Content
    private var mainContent: some View {
        VStack(spacing: 0) {
            switch selectedTab {
            case 0: dayView
            case 1: weekView
            case 2: monthView
            case 3: yearView
            case 4: tasksView
            case 5: notesView
            default: dayView
            }
        }
    }
    
    // MARK: - Day View (Main Calendar)
    private var dayView: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                // Top bar with calendar grid and current day
                HStack(alignment: .top, spacing: 30) {
                    // Mini calendar
                    miniCalendar
                    
                    // Large day display
                    VStack(spacing: 4) {
                        Text("February 2026")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.gray)
                        
                        Text("27")
                            .font(.system(size: 100, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text("Friday, Week 9")
                            .font(.system(size: 14))
                            .foregroundColor(.gray)
                    }
                    
                    Spacer()
                    
                    // Menu button
                    Button(action: {}) {
                        Image(systemName: "line.3.horizontal")
                            .font(.system(size: 20))
                            .foregroundColor(.blue)
                            .padding(12)
                            .background(Color(white: 0.2))
                            .cornerRadius(8)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                
                // Event slots
                eventSlots
                
                Spacer(minLength: 100)
            }
        }
    }
    
    // MARK: - Mini Calendar
    private var miniCalendar: some View {
        VStack(spacing: 12) {
            // Day headers
            HStack(spacing: 8) {
                ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { day in
                    Text(day)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.gray)
                        .frame(width: 24)
                }
            }
            
            // Calendar grid (simplified)
            VStack(spacing: 6) {
                ForEach(0..<5, id: \.self) { row in
                    HStack(spacing: 8) {
                        ForEach(0..<7, id: \.self) { col in
                            let day = row * 7 + col + 1
                            if day <= 28 {
                                Text("\(day)")
                                    .font(.system(size: 13))
                                    .foregroundColor(day == 27 ? .white : (day == 21 ? .blue : .gray))
                                    .frame(width: 24, height: 24)
                                    .background(day == 27 ? Color.blue : Color.clear)
                                    .cornerRadius(12)
                            } else {
                                Text("")
                                    .frame(width: 24, height: 24)
                            }
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Event Slots
    private var eventSlots: some View {
        VStack(spacing: 0) {
            ForEach(0..<24, id: \.self) { hour in
                HStack(spacing: 0) {
                    // Hour label
                    Text("\(hour):00")
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                        .frame(width: 50, alignment: .trailing)
                        .padding(.trailing, 10)
                    
                    // Event line
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 1)
                    
                    Spacer()
                }
                .frame(height: 60)
            }
        }
        .padding(.horizontal, 20)
    }
    
    // MARK: - Placeholder Views
    private var weekView: some View {
        Text("Week View").foregroundColor(.white)
    }
    
    private var monthView: some View {
        Text("Month View").foregroundColor(.white)
    }
    
    private var yearView: some View {
        Text("Year View").foregroundColor(.white)
    }
    
    private var tasksView: some View {
        Text("Tasks View").foregroundColor(.white)
    }
    
    private var notesView: some View {
        Text("Notes View").foregroundColor(.white)
    }
    
    // MARK: - Planmore Tabs
    private var planmoreTabs: some View {
        VStack(spacing: 0) {
            ForEach(0..<tabs.count, id: \.self) { index in
                planmoreTab(index: index)
            }
            
            Spacer()
            
            // Icon buttons at bottom
            VStack(spacing: 15) {
                iconButton(icon: "gearshape.fill", color: Color(red: 1.0, green: 0.8, blue: 0.65))
                iconButton(icon: "calendar", color: Color(red: 0.6, green: 0.9, blue: 0.5))
                iconButton(icon: "magnifyingglass", color: Color(red: 0.95, green: 0.7, blue: 0.85))
            }
            .padding(.bottom, 30)
        }
        .padding(.top, 15)
    }
    
    // MARK: - Planmore Tab (with scalloped edge)
    private func planmoreTab(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                selectedTab = index
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
        } label: {
            ScallopedTab(selected: isSelected)
                .fill(tabs[index].1)
                .frame(width: isSelected ? 75 : 70, height: 120)
                .overlay(
                    Text(tabs[index].0)
                        .font(.system(size: isSelected ? 15 : 13, weight: .semibold))
                        .foregroundColor(index == 0 ? .white : .black)
                        .rotationEffect(.degrees(-90))
                        .offset(x: isSelected ? 5 : 3)
                )
                .shadow(color: .black.opacity(0.3), radius: 5, x: -2, y: 2)
                .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
    }
    
    // MARK: - Icon Button
    private func iconButton(icon: String, color: Color) -> some View {
        Button(action: {}) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .medium))
                .foregroundColor(.black)
                .frame(width: 50, height: 50)
                .background(
                    Circle()
                        .fill(color)
                        .shadow(color: .black.opacity(0.2), radius: 4, x: 0, y: 2)
                )
        }
    }
}

// MARK: - Scalloped Tab Shape (Planmore Style)
struct ScallopedTab: Shape {
    let selected: Bool
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let scallop: CGFloat = 15 // Scallop curve depth
        
        // Start at bottom left
        path.move(to: CGPoint(x: 0, y: rect.height))
        
        // Left edge with scallop
        path.addQuadCurve(
            to: CGPoint(x: scallop, y: rect.height / 2),
            control: CGPoint(x: -scallop * 0.7, y: rect.height * 0.75)
        )
        path.addQuadCurve(
            to: CGPoint(x: 0, y: 0),
            control: CGPoint(x: -scallop * 0.7, y: rect.height * 0.25)
        )
        
        // Top edge
        path.addLine(to: CGPoint(x: rect.width, y: 0))
        
        // Right edge
        path.addLine(to: CGPoint(x: rect.width, y: rect.height))
        
        // Bottom edge
        path.addLine(to: CGPoint(x: 0, y: rect.height))
        
        path.closeSubpath()
        
        return path
    }
}
