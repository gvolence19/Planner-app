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
    
    // Tabs matching post-it note style
    let tabs = [
        ("Day", Color(red: 0.3, green: 0.3, blue: 0.35)),
        ("Week", Color(red: 1.0, green: 0.95, blue: 0.4)),      // Yellow post-it
        ("Month", Color(red: 0.5, green: 0.85, blue: 0.6)),     // Green post-it
        ("Year", Color(red: 0.7, green: 0.85, blue: 1.0)),      // Blue post-it
        ("Tasks", Color(red: 1.0, green: 0.7, blue: 0.8)),      // Pink post-it
        ("Notes", Color(red: 1.0, green: 0.85, blue: 0.6))      // Orange post-it
    ]
    
    @State private var showSettings = false
    
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
                    
                    // POST-IT NOTE TABS
                    postItTabs
                        .frame(width: 85)
                        .background(Color(white: 0.15))
                }
            }
        }
        .ignoresSafeArea()
        .preferredColorScheme(.dark)
        .sheet(isPresented: $showSettings) {
            settingsSheet
        }
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
            // Top section with calendar and big date - FIXED HEIGHT
            VStack(spacing: 0) {
                HStack(alignment: .top, spacing: 15) {
                    // Mini calendar
                    miniCalendar
                        .padding(.leading, 15)
                    
                    Spacer()
                    
                    // LARGE DAY DISPLAY - PROMINENT
                    VStack(spacing: 2) {
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
                    .padding(.trailing, 10)
                    
                    Spacer()
                    
                    // Menu button
                    Button(action: {}) {
                        Image(systemName: "line.3.horizontal")
                            .font(.system(size: 18))
                            .foregroundColor(.blue)
                            .padding(10)
                            .background(Color(white: 0.2))
                            .cornerRadius(8)
                    }
                    .padding(.trailing, 15)
                }
                .padding(.top, 15)
                .padding(.bottom, 10)
            }
            .frame(height: 200)
            .background(Color(white: 0.12))
            
            // Event slots - scrollable
            ScrollView(showsIndicators: false) {
                eventSlots
            }
        }
    }
    
    // MARK: - Mini Calendar
    private var miniCalendar: some View {
        VStack(spacing: 10) {
            // Day headers
            HStack(spacing: 6) {
                ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { day in
                    Text(day)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.gray)
                        .frame(width: 22)
                }
            }
            
            // Calendar grid (clickable dates)
            VStack(spacing: 5) {
                ForEach(0..<5, id: \.self) { row in
                    HStack(spacing: 6) {
                        ForEach(0..<7, id: \.self) { col in
                            let day = row * 7 + col + 1
                            if day <= 28 {
                                Button(action: {
                                    selectedDate = Calendar.current.date(from: DateComponents(year: 2026, month: 2, day: day)) ?? Date()
                                }) {
                                    Text("\(day)")
                                        .font(.system(size: 12))
                                        .foregroundColor(day == 27 ? .white : (day == 21 ? .blue : .gray))
                                        .frame(width: 22, height: 22)
                                        .background(day == 27 ? Color.blue : Color.clear)
                                        .cornerRadius(11)
                                }
                            } else {
                                Text("")
                                    .frame(width: 22, height: 22)
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
                    
                    // Task items (clickable to toggle)
                    VStack(spacing: 15) {
                        Button(action: {}) {
                            taskItem("Complete project proposal", completed: false)
                        }
                        Button(action: {}) {
                            taskItem("Review design mockups", completed: false)
                        }
                        Button(action: {}) {
                            taskItem("Send follow-up emails", completed: true)
                        }
                        Button(action: {}) {
                            taskItem("Prepare presentation", completed: false)
                        }
                        Button(action: {}) {
                            taskItem("Team standup meeting", completed: true)
                        }
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
    
    // MARK: - Post-It Note Tabs
    private var postItTabs: some View {
        VStack(spacing: 0) {
            Spacer()
                .frame(height: 60)
            
            ForEach(0..<tabs.count, id: \.self) { index in
                postItTab(index: index)
            }
            
            Spacer()
            
            // Icon buttons at bottom
            VStack(spacing: 12) {
                Button(action: { showSettings = true }) {
                    iconButton(icon: "gearshape.fill", color: Color(red: 1.0, green: 0.8, blue: 0.65))
                }
                Button(action: { selectedTab = 0 }) {
                    iconButton(icon: "calendar", color: Color(red: 0.6, green: 0.9, blue: 0.5))
                }
                Button(action: { selectedTab = 5 }) {
                    iconButton(icon: "magnifyingglass", color: Color(red: 0.95, green: 0.7, blue: 0.85))
                }
            }
            .padding(.bottom, 40)
        }
    }
    
    // MARK: - Post-It Tab (Rectangular with shadow)
    private func postItTab(index: Int) -> some View {
        let isSelected = selectedTab == index
        
        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                selectedTab = index
                let impact = UIImpactFeedbackGenerator(style: .medium)
                impact.impactOccurred()
            }
        } label: {
            ZStack {
                // Post-it note rectangle
                RoundedRectangle(cornerRadius: 3)
                    .fill(tabs[index].1)
                    .frame(width: isSelected ? 75 : 70, height: 110)
                    .shadow(color: .black.opacity(0.3), radius: 4, x: 2, y: 3)
                    .rotationEffect(.degrees(isSelected ? 2 : 1))
                
                // Text
                Text(tabs[index].0)
                    .font(.system(size: isSelected ? 15 : 13, weight: .semibold))
                    .foregroundColor(index == 0 ? .white : .black)
                    .rotationEffect(.degrees(-90))
            }
            .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
    }
    
    // MARK: - Icon Button
    private func iconButton(icon: String, color: Color) -> some View {
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
    
    // MARK: - Settings Sheet
    private var settingsSheet: some View {
        NavigationView {
            ZStack {
                Color(white: 0.12).ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 25) {
                        settingRow(icon: "bell.fill", title: "Notifications", color: .blue)
                        settingRow(icon: "paintbrush.fill", title: "Themes", color: .purple)
                        settingRow(icon: "square.and.arrow.up.fill", title: "Export Data", color: .green)
                        settingRow(icon: "person.fill", title: "Account", color: .orange)
                        settingRow(icon: "info.circle.fill", title: "About", color: .gray)
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        showSettings = false
                    }
                    .foregroundColor(.blue)
                }
            }
        }
        .preferredColorScheme(.dark)
    }
    
    private func settingRow(icon: String, title: String, color: Color) -> some View {
        HStack(spacing: 15) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(color)
                    .frame(width: 40, height: 40)
                
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(.white)
            }
            
            Text(title)
                .font(.system(size: 18))
                .foregroundColor(.white)
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(.gray)
        }
        .padding(15)
        .background(Color(white: 0.2))
        .cornerRadius(12)
    }
}

