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
        GeometryReader { geo in
            VStack(spacing: 0) {
                // Top section - FIXED AND VISIBLE
                HStack(alignment: .top, spacing: 0) {
                    // Mini calendar - LEFT SIDE
                    VStack(alignment: .leading, spacing: 10) {
                        miniCalendar
                    }
                    .frame(width: 180)
                    .padding(.leading, 15)
                    .padding(.top, 15)
                    
                    Spacer()
                    
                    // BIG DATE - CENTER
                    VStack(spacing: 2) {
                        Text(selectedDate.formatted(.dateTime.month(.wide).year()))
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.gray)
                        
                        Text(selectedDate.formatted(.dateTime.day()))
                            .font(.system(size: 90, weight: .bold))
                            .foregroundColor(.white)
                        
                        Text(selectedDate.formatted(.dateTime.weekday(.wide)) + ", Week \(weekNumber(for: selectedDate))")
                            .font(.system(size: 14))
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity)
                    
                    Spacer()
                    
                    // Menu button - RIGHT
                    Button(action: {}) {
                        Image(systemName: "line.3.horizontal")
                            .font(.system(size: 18))
                            .foregroundColor(.blue)
                            .padding(10)
                            .background(Color(white: 0.2))
                            .cornerRadius(8)
                    }
                    .padding(.trailing, 15)
                    .padding(.top, 15)
                }
                .frame(height: 180)
                .background(Color(white: 0.12))
                
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
                        // Swipe left - next day
                        selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate) ?? selectedDate
                        let impact = UIImpactFeedbackGenerator(style: .light)
                        impact.impactOccurred()
                    } else if value.translation.width > 50 {
                        // Swipe right - previous day
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
                VStack(spacing: 15) {
                    ForEach(["Ocean Blue", "Lavender Dream", "Forest Green", "Sunset Orange", "Rose Pink"], id: \.self) { theme in
                        Button(action: {}) {
                            HStack {
                                Text(theme)
                                    .foregroundColor(.white)
                                Spacer()
                                Circle()
                                    .fill(Color.blue)
                                    .frame(width: 30, height: 30)
                            }
                            .padding()
                            .background(Color(white: 0.2))
                            .cornerRadius(12)
                        }
                    }
                }
                .padding(20)
            }
            .navigationTitle("Themes")
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

