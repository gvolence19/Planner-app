import SwiftUI

// MARK: - Planmore Style Planner (Exact Match)
struct PlanmorePlanner: View {
    @EnvironmentObject var themeManager: ThemeManager
    @EnvironmentObject var dataManager: DataManager
    @State private var selectedTab = 0
    @State private var selectedDate = Date()
    @State private var showSettings = false
    @State private var selectedTheme: String = "Default"
    @State private var selectedStyle: String = "Modern"
    
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
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background with style
                styleBackground
                    .ignoresSafeArea()
                
                HStack(spacing: 0) {
                    // MAIN CONTENT AREA
                    mainContent
                        .frame(maxWidth: geometry.size.width - 85)
                        .background(styleContentBackground)
                    
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
    
    // MARK: - Style Backgrounds (Image-like themes)
    private var styleBackground: some View {
        ZStack {
            switch selectedStyle {
            case "Antique Calendar":
                // Vintage aged paper texture
                LinearGradient(
                    colors: [
                        Color(red: 0.95, green: 0.9, blue: 0.75),
                        Color(red: 0.9, green: 0.85, blue: 0.7),
                        Color(red: 0.88, green: 0.83, blue: 0.68)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                // Paper texture overlay
                Rectangle()
                    .fill(Color.brown.opacity(0.03))
                    .blendMode(.multiply)
                
            case "Hello Kitty":
                // Pink Hello Kitty themed background
                ZStack {
                    LinearGradient(
                        colors: [Color.pink.opacity(0.4), Color.pink.opacity(0.2)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    // Polka dots pattern
                    ForEach(0..<20, id: \.self) { i in
                        Circle()
                            .fill(Color.white.opacity(0.2))
                            .frame(width: 40, height: 40)
                            .offset(
                                x: CGFloat((i % 5) * 80 - 160),
                                y: CGFloat((i / 5) * 150 - 300)
                            )
                    }
                    // Bow pattern
                    ForEach(0..<10, id: \.self) { i in
                        Image(systemName: "suit.heart.fill")
                            .font(.system(size: 20))
                            .foregroundColor(.pink.opacity(0.15))
                            .offset(
                                x: CGFloat((i % 3) * 120 - 120),
                                y: CGFloat((i / 3) * 180 - 360)
                            )
                    }
                }
                
            case "Thunderstorm":
                // Dark thunderstorm clouds
                ZStack {
                    // Dark sky
                    LinearGradient(
                        colors: [
                            Color(red: 0.15, green: 0.15, blue: 0.2),
                            Color(red: 0.1, green: 0.1, blue: 0.15),
                            Color(red: 0.08, green: 0.08, blue: 0.12)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    // Storm clouds
                    ForEach(0..<15, id: \.self) { i in
                        Ellipse()
                            .fill(Color.gray.opacity(0.3))
                            .frame(width: CGFloat(100 + i * 20), height: CGFloat(60 + i * 10))
                            .blur(radius: 20)
                            .offset(
                                x: CGFloat((i % 4) * 90 - 180),
                                y: CGFloat((i / 4) * 120 - 240)
                            )
                    }
                    // Lightning effect
                    Rectangle()
                        .fill(Color.white.opacity(0.03))
                        .blendMode(.screen)
                }
                
            case "Minimalist":
                Color.white
                
            case "Nature":
                // Forest/nature themed
                ZStack {
                    LinearGradient(
                        colors: [
                            Color.green.opacity(0.3),
                            Color.green.opacity(0.2),
                            Color(red: 0.5, green: 0.7, blue: 0.4).opacity(0.25)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    // Leaf patterns
                    ForEach(0..<25, id: \.self) { i in
                        Image(systemName: "leaf.fill")
                            .font(.system(size: CGFloat(15 + i % 20)))
                            .foregroundColor(.green.opacity(0.15))
                            .rotationEffect(.degrees(Double(i * 30)))
                            .offset(
                                x: CGFloat((i % 5) * 75 - 150),
                                y: CGFloat((i / 5) * 140 - 350)
                            )
                    }
                }
                
            default:
                Color(white: 0.15)
            }
        }
    }
    
    private var styleContentBackground: some View {
        Group {
            switch selectedStyle {
            case "Antique Calendar":
                Color(red: 0.97, green: 0.94, blue: 0.88)
            case "Hello Kitty":
                Color.white.opacity(0.97)
            case "Thunderstorm":
                Color(white: 0.12).opacity(0.95)
            case "Minimalist":
                Color.white
            case "Nature":
                Color.white.opacity(0.92)
            default:
                Color(white: 0.12)
            }
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
        GeometryReader { geo in
            VStack(spacing: 0) {
                // Top section - FIXED AND VISIBLE
                VStack(spacing: 0) {
                    HStack(alignment: .top, spacing: 10) {
                        // Mini calendar - LEFT SIDE (smaller)
                        VStack(alignment: .leading, spacing: 8) {
                            miniCalendar
                        }
                        .frame(width: 165)
                        .padding(.leading, 10)
                        
                        // BIG DATE - CENTER (more space)
                        VStack(spacing: 0) {
                            Text(selectedDate.formatted(.dateTime.month(.abbreviated).year()))
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.gray)
                                .padding(.bottom, 2)
                            
                            Text(selectedDate.formatted(.dateTime.day()))
                                .font(.system(size: 75, weight: .bold))
                                .foregroundColor(.white)
                                .padding(.bottom, 2)
                            
                            // Single line with compact spacing
                            Text("\(selectedDate.formatted(.dateTime.weekday(.abbreviated))) • Wk \(weekNumber(for: selectedDate))")
                                .font(.system(size: 12))
                                .foregroundColor(.gray)
                                .lineLimit(1)
                                .fixedSize(horizontal: true, vertical: false)
                        }
                        .frame(maxWidth: .infinity)
                        
                        // Menu button - RIGHT
                        Button(action: {}) {
                            Image(systemName: "line.3.horizontal")
                                .font(.system(size: 16))
                                .foregroundColor(.blue)
                                .padding(8)
                                .background(Color(white: 0.2))
                                .cornerRadius(8)
                        }
                        .padding(.trailing, 10)
                    }
                    .padding(.top, 30) // Extra padding at top
                    .padding(.bottom, 15)
                }
                .frame(height: 195)
                .background(styleContentBackground.opacity(0.95))
                
                // Event slots - scrollable
                ScrollView(showsIndicators: false) {
                    eventSlots
                }
            }
        }
        // SWIPE TO CHANGE DAYS
        .gesture(
            DragGesture()
                .onEnded { value in
                    if value.translation.width < -50 {
                        selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
                        let impact = UIImpactFeedbackGenerator(style: .light)
                        impact.impactOccurred()
                    } else if value.translation.width > 50 {
                        selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate) ?? selectedDate
                        let impact = UIImpactFeedbackGenerator(style: .light)
                        impact.impactOccurred()
                    }
                }
        )
    }
    
    private func weekNumber(for date: Date) -> Int {
        let calendar = Calendar.current
        return calendar.component(.weekOfYear, from: date)
    }
    
    // MARK: - Mini Calendar
    private var miniCalendar: some View {
        VStack(spacing: 8) {
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
            let calendar = Calendar.current
            let month = calendar.component(.month, from: selectedDate)
            let year = calendar.component(.year, from: selectedDate)
            let daysInMonth = calendar.range(of: .day, in: .month, for: selectedDate)?.count ?? 30
            let firstWeekday = calendar.component(.weekday, from: calendar.date(from: DateComponents(year: year, month: month, day: 1))!)
            let selectedDay = calendar.component(.day, from: selectedDate)
            
            VStack(spacing: 4) {
                ForEach(0..<6, id: \.self) { row in
                    HStack(spacing: 6) {
                        ForEach(0..<7, id: \.self) { col in
                            let dayOffset = row * 7 + col - (firstWeekday - 1) + 1
                            if dayOffset > 0 && dayOffset <= daysInMonth {
                                Button(action: {
                                    if let newDate = calendar.date(from: DateComponents(year: year, month: month, day: dayOffset)) {
                                        selectedDate = newDate
                                        let impact = UIImpactFeedbackGenerator(style: .light)
                                        impact.impactOccurred()
                                    }
                                }) {
                                    Text("\(dayOffset)")
                                        .font(.system(size: 11))
                                        .foregroundColor(dayOffset == selectedDay ? .white : .gray)
                                        .frame(width: 22, height: 22)
                                        .background(dayOffset == selectedDay ? Color.blue : Color.clear)
                                        .cornerRadius(11)
                                }
                                .buttonStyle(.plain)
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
                    // Hour label (12-hour format)
                    Text(formatHour(hour))
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                        .frame(width: 60, alignment: .trailing)
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
    
    // Convert 24-hour to 12-hour format
    private func formatHour(_ hour: Int) -> String {
        if hour == 0 {
            return "12:00 AM"
        } else if hour < 12 {
            return "\(hour):00 AM"
        } else if hour == 12 {
            return "12:00 PM"
        } else {
            return "\(hour - 12):00 PM"
        }
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
        let calendar = Calendar.current
        let month = calendar.component(.month, from: selectedDate)
        let year = calendar.component(.year, from: selectedDate)
        let monthName = selectedDate.formatted(.dateTime.month(.wide).year())
        let daysInMonth = calendar.range(of: .day, in: .month, for: selectedDate)?.count ?? 30
        let firstWeekday = calendar.component(.weekday, from: calendar.date(from: DateComponents(year: year, month: month, day: 1))!)
        let selectedDay = calendar.component(.day, from: selectedDate)
        
        return VStack(spacing: 20) {
            // Month navigation
            HStack {
                Button(action: {
                    if let newDate = calendar.date(byAdding: .month, value: -1, to: selectedDate) {
                        selectedDate = newDate
                    }
                }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.blue)
                        .font(.system(size: 20))
                }
                
                Spacer()
                
                Text(monthName)
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Button(action: {
                    if let newDate = calendar.date(byAdding: .month, value: 1, to: selectedDate) {
                        selectedDate = newDate
                    }
                }) {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.blue)
                        .font(.system(size: 20))
                }
            }
            .padding(.horizontal, 20)
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
                    ForEach(0..<6, id: \.self) { row in
                        HStack(spacing: 12) {
                            ForEach(0..<7, id: \.self) { col in
                                let dayOffset = row * 7 + col - (firstWeekday - 1) + 1
                                if dayOffset > 0 && dayOffset <= daysInMonth {
                                    Button(action: {
                                        if let newDate = calendar.date(from: DateComponents(year: year, month: month, day: dayOffset)) {
                                            selectedDate = newDate
                                            selectedTab = 0 // Switch to day view
                                        }
                                    }) {
                                        Text("\(dayOffset)")
                                            .font(.system(size: 18))
                                            .foregroundColor(dayOffset == selectedDay ? .white : .gray)
                                            .frame(maxWidth: .infinity)
                                            .frame(height: 50)
                                            .background(dayOffset == selectedDay ? Color.blue : Color(white: 0.2))
                                            .cornerRadius(8)
                                    }
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
        let calendar = Calendar.current
        let year = calendar.component(.year, from: selectedDate)
        
        return VStack(spacing: 0) {
            // Year navigation
            HStack {
                Button(action: {
                    if let newDate = calendar.date(byAdding: .year, value: -1, to: selectedDate) {
                        selectedDate = newDate
                    }
                }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.blue)
                        .font(.system(size: 20))
                }
                
                Spacer()
                
                Text("\(year)")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Button(action: {
                    if let newDate = calendar.date(byAdding: .year, value: 1, to: selectedDate) {
                        selectedDate = newDate
                    }
                }) {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.blue)
                        .font(.system(size: 20))
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 40)
            .padding(.bottom, 20)
            
            ScrollView {
                // 12 month mini calendars
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                    ForEach(1...12, id: \.self) { month in
                        Button(action: {
                            if let newDate = calendar.date(from: DateComponents(year: year, month: month, day: 1)) {
                                selectedDate = newDate
                                selectedTab = 2 // Go to month view
                            }
                        }) {
                            monthMiniCalendar(month: month, year: year)
                        }
                    }
                }
                .padding(.horizontal, 20)
            }
        }
        .gesture(
            DragGesture()
                .onEnded { value in
                    if value.translation.width < -50 {
                        if let newDate = calendar.date(byAdding: .year, value: 1, to: selectedDate) {
                            selectedDate = newDate
                        }
                    } else if value.translation.width > 50 {
                        if let newDate = calendar.date(byAdding: .year, value: -1, to: selectedDate) {
                            selectedDate = newDate
                        }
                    }
                }
        )
    }
    
    private func monthMiniCalendar(month: Int, year: Int) -> some View {
        let monthName = DateFormatter().monthSymbols[month - 1].prefix(3)
        let currentMonth = Calendar.current.component(.month, from: selectedDate)
        let currentYear = Calendar.current.component(.year, from: selectedDate)
        let isCurrentMonth = (month == currentMonth && year == currentYear)
        
        return VStack(spacing: 8) {
            Text(String(monthName))
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(isCurrentMonth ? .blue : .white)
            
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
        .background(isCurrentMonth ? Color.blue.opacity(0.2) : Color(white: 0.2))
        .cornerRadius(12)
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
                    VStack(spacing: 20) {
                        NavigationLink(destination: notificationsSettings) {
                            settingRow(icon: "bell.fill", title: "Notifications", color: .blue)
                        }
                        
                        NavigationLink(destination: themesSettings) {
                            settingRow(icon: "paintbrush.fill", title: "Themes", color: .purple)
                        }
                        
                        NavigationLink(destination: exportSettings) {
                            settingRow(icon: "square.and.arrow.up.fill", title: "Export Data", color: .green)
                        }
                        
                        NavigationLink(destination: accountSettings) {
                            settingRow(icon: "person.fill", title: "Account", color: .orange)
                        }
                        
                        NavigationLink(destination: aboutSettings) {
                            settingRow(icon: "info.circle.fill", title: "About", color: .gray)
                        }
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
    
    // MARK: - Settings Screens
    private var notificationsSettings: some View {
        ZStack {
            Color(white: 0.12).ignoresSafeArea()
            VStack(spacing: 20) {
                Toggle("Daily Reminders", isOn: .constant(true))
                    .padding()
                    .background(Color(white: 0.2))
                    .cornerRadius(12)
                
                Toggle("Task Notifications", isOn: .constant(true))
                    .padding()
                    .background(Color(white: 0.2))
                    .cornerRadius(12)
                
                Toggle("Sleep Reminders", isOn: .constant(false))
                    .padding()
                    .background(Color(white: 0.2))
                    .cornerRadius(12)
                
                Spacer()
            }
            .padding(20)
            .navigationTitle("Notifications")
        }
    }
    
    private var themesSettings: some View {
        ZStack {
            Color(white: 0.12).ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 25) {
                    // Color Themes
                    Text("Color Themes")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                    
                    VStack(spacing: 15) {
                        ForEach([("Default", Color.blue), ("Ocean Blue", Color.cyan), ("Lavender Dream", Color.purple), ("Forest Green", Color.green), ("Sunset Orange", Color.orange), ("Rose Pink", Color.pink)], id: \.0) { theme in
                            Button(action: {
                                selectedTheme = theme.0
                            }) {
                                HStack {
                                    Text(theme.0)
                                        .foregroundColor(.white)
                                    Spacer()
                                    Circle()
                                        .fill(theme.1)
                                        .frame(width: 30, height: 30)
                                    if selectedTheme == theme.0 {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.green)
                                    }
                                }
                                .padding()
                                .background(Color(white: 0.2))
                                .cornerRadius(12)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    
                    // Visual Styles
                    Text("Visual Styles")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 20)
                        .padding(.top, 20)
                    
                    VStack(spacing: 15) {
                        ForEach(["Modern", "Antique Calendar", "Hello Kitty", "Thunderstorm", "Minimalist", "Nature"], id: \.self) { style in
                            Button(action: {
                                selectedStyle = style
                            }) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(style)
                                            .foregroundColor(.white)
                                            .font(.system(size: 17, weight: .medium))
                                        Text(styleDescription(style))
                                            .foregroundColor(.gray)
                                            .font(.system(size: 13))
                                    }
                                    Spacer()
                                    if selectedStyle == style {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.green)
                                    }
                                }
                                .padding()
                                .background(Color(white: 0.2))
                                .cornerRadius(12)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
                .padding(.vertical, 20)
            }
            .navigationTitle("Themes & Styles")
        }
    }
    
    private func styleDescription(_ style: String) -> String {
        switch style {
        case "Modern": return "Clean dark interface"
        case "Antique Calendar": return "Vintage aged paper texture"
        case "Hello Kitty": return "Pink with polka dots & hearts"
        case "Thunderstorm": return "Dark storm clouds background"
        case "Minimalist": return "Pure white simplicity"
        case "Nature": return "Green leaves & forest vibes"
        default: return ""
        }
    }
    
    private var exportSettings: some View {
        ZStack {
            Color(white: 0.12).ignoresSafeArea()
            VStack(spacing: 20) {
                Button(action: {}) {
                    HStack {
                        Image(systemName: "doc.text")
                        Text("Export as PDF")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                
                Button(action: {}) {
                    HStack {
                        Image(systemName: "square.and.arrow.up")
                        Text("Export as CSV")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                
                Spacer()
            }
            .padding(20)
            .navigationTitle("Export Data")
        }
    }
    
    private var accountSettings: some View {
        ZStack {
            Color(white: 0.12).ignoresSafeArea()
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Email")
                        .foregroundColor(.gray)
                    Text("user@example.com")
                        .foregroundColor(.white)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color(white: 0.2))
                .cornerRadius(12)
                
                Button(action: {}) {
                    Text("Sign Out")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }
                
                Spacer()
            }
            .padding(20)
            .navigationTitle("Account")
        }
    }
    
    private var aboutSettings: some View {
        ZStack {
            Color(white: 0.12).ignoresSafeArea()
            VStack(spacing: 20) {
                Text("Plannio")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Version 1.0.0")
                    .foregroundColor(.gray)
                
                Text("Your personal planner and organizer")
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding()
                
                Spacer()
            }
            .padding(20)
            .navigationTitle("About")
        }
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

