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
                        .frame(maxWidth: geometry.size.width - 85)
                        .background(Color(white: 0.12))
                    
                    // PLANMORE-STYLE TABS (MUST BE VISIBLE)
                    planmoreTabs
                        .frame(width: 85)
                        .background(Color(white: 0.15))
                }
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
        VStack(spacing: 0) {
            // Top bar with calendar grid and current day
            HStack(alignment: .top, spacing: 20) {
                // Mini calendar
                miniCalendar
                    .padding(.leading, 20)
                
                Spacer()
                
                // Large day display
                VStack(spacing: 4) {
                    Text("February 2026")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.gray)
                    
                    Text("27")
                        .font(.system(size: 120, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("Friday, Week 9")
                        .font(.system(size: 16))
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity)
                
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
                .padding(.trailing, 20)
            }
            .padding(.top, 20)
            .padding(.bottom, 30)
            
            // Event slots
            ScrollView(showsIndicators: false) {
                eventSlots
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
        VStack(spacing: 20) {
            Text("Week View")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)
                .padding(.top, 40)
            
            // 7-day week grid placeholder
            VStack(spacing: 15) {
                ForEach(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], id: \.self) { day in
                    HStack {
                        Text(day)
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.gray)
                            .frame(width: 100, alignment: .leading)
                        
                        Rectangle()
                            .fill(Color(white: 0.2))
                            .frame(height: 60)
                            .cornerRadius(8)
                    }
                    .padding(.horizontal, 20)
                }
            }
            
            Spacer()
        }
    }
    
    private var monthView: some View {
        VStack(spacing: 20) {
            Text("February 2026")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.white)
                .padding(.top, 40)
            
            // Full month calendar grid
            VStack(spacing: 15) {
                // Day headers
                HStack(spacing: 12) {
                    ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { day in
                        Text(day)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.gray)
                            .frame(maxWidth: .infinity)
                    }
                }
                .padding(.horizontal, 20)
                
                // Calendar grid
                VStack(spacing: 8) {
                    ForEach(0..<5, id: \.self) { row in
                        HStack(spacing: 12) {
                            ForEach(0..<7, id: \.self) { col in
                                let day = row * 7 + col + 1
                                if day <= 28 {
                                    Text("\(day)")
                                        .font(.system(size: 18))
                                        .foregroundColor(day == 27 ? .white : .gray)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 50)
                                        .background(day == 27 ? Color.blue : Color(white: 0.2))
                                        .cornerRadius(8)
                                } else {
                                    Text("")
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 50)
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
            }
            
            Spacer()
        }
    }
    
    private var yearView: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("2026")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.top, 40)
                
                // 12 month mini calendars
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                    ForEach(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], id: \.self) { month in
                        VStack(spacing: 8) {
                            Text(month)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                            
                            // Mini month grid
                            VStack(spacing: 4) {
                                ForEach(0..<5, id: \.self) { _ in
                                    HStack(spacing: 4) {
                                        ForEach(0..<7, id: \.self) { _ in
                                            Circle()
                                                .fill(Color(white: 0.3))
                                                .frame(width: 6, height: 6)
                                        }
                                    }
                                }
                            }
                        }
                        .padding(12)
                        .background(Color(white: 0.2))
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 20)
                
                Spacer()
            }
        }
    }
    
    private var tasksView: some View {
        ZStack {
            Color(white: 0.12)
            
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("My Tasks")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.top, 40)
                        .padding(.horizontal, 20)
                    
                    // Task items
                    VStack(spacing: 15) {
                        taskItem("Complete project proposal", completed: false)
                        taskItem("Review design mockups", completed: false)
                        taskItem("Send follow-up emails", completed: true)
                        taskItem("Prepare presentation", completed: false)
                        taskItem("Team standup meeting", completed: true)
                    }
                    .padding(.horizontal, 20)
                    
                    Spacer()
                }
            }
        }
    }
    
    private func taskItem(_ title: String, completed: Bool) -> some View {
        HStack(spacing: 15) {
            Image(systemName: completed ? "checkmark.circle.fill" : "circle")
                .font(.system(size: 24))
                .foregroundColor(completed ? .green : .gray)
            
            Text(title)
                .font(.system(size: 17))
                .foregroundColor(completed ? .gray : .white)
                .strikethrough(completed)
            
            Spacer()
        }
        .padding(16)
        .background(Color(white: 0.2))
        .cornerRadius(12)
    }
    
    private var notesView: some View {
        ZStack {
            Color(white: 0.12)
            
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("Notes")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.top, 40)
                        .padding(.horizontal, 20)
                    
                    // Note items
                    VStack(spacing: 15) {
                        noteItem("Meeting Notes", "Discussed Q1 goals and timeline...")
                        noteItem("Ideas", "New feature concepts for the app...")
                        noteItem("Shopping List", "Groceries for the week...")
                    }
                    .padding(.horizontal, 20)
                    
                    Spacer()
                }
            }
        }
    }
    
    private func noteItem(_ title: String, _ preview: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
            
            Text(preview)
                .font(.system(size: 14))
                .foregroundColor(.gray)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color(white: 0.2))
        .cornerRadius(12)
    }
    
    // MARK: - Planmore Tabs
    private var planmoreTabs: some View {
        VStack(spacing: 0) {
            Spacer()
                .frame(height: 60)
            
            ForEach(0..<tabs.count, id: \.self) { index in
                planmoreTab(index: index)
            }
            
            Spacer()
            
            // Icon buttons at bottom
            VStack(spacing: 12) {
                iconButton(icon: "gearshape.fill", color: Color(red: 1.0, green: 0.8, blue: 0.65))
                iconButton(icon: "calendar", color: Color(red: 0.6, green: 0.9, blue: 0.5))
                iconButton(icon: "magnifyingglass", color: Color(red: 0.95, green: 0.7, blue: 0.85))
            }
            .padding(.bottom, 40)
        }
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
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.black)
                .frame(width: 45, height: 45)
                .background(
                    Circle()
                        .fill(color)
                        .shadow(color: .black.opacity(0.25), radius: 3, x: 0, y: 2)
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
