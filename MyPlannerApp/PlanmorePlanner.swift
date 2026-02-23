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
    @State private var showAISuggestions = false
    @State private var showVoiceCommand = false
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    // Tabs matching post-it note style - THEMED based on selected style
    var tabs: [(String, Color)] {
        switch selectedStyle {
        case "Antique Calendar":
            return [
                ("Day", Color(red: 0.8, green: 0.7, blue: 0.5)),
                ("Week", Color(red: 0.85, green: 0.75, blue: 0.55)),
                ("Month", Color(red: 0.9, green: 0.8, blue: 0.6)),
                ("Year", Color(red: 0.78, green: 0.68, blue: 0.48)),
                ("Tasks", Color(red: 0.82, green: 0.72, blue: 0.52)),
                ("Notes", Color(red: 0.88, green: 0.78, blue: 0.58))
            ]
        case "Hello Kitty":
            return [
                ("Day", Color.pink),
                ("Week", Color.pink.opacity(0.8)),
                ("Month", Color(red: 1.0, green: 0.8, blue: 0.9)),
                ("Year", Color(red: 1.0, green: 0.6, blue: 0.8)),
                ("Tasks", Color.pink.opacity(0.9)),
                ("Notes", Color(red: 1.0, green: 0.7, blue: 0.85))
            ]
        case "Thunderstorm":
            return [
                ("Day", Color(white: 0.3)),
                ("Week", Color(white: 0.35)),
                ("Month", Color(white: 0.4)),
                ("Year", Color.yellow.opacity(0.7)),
                ("Tasks", Color(white: 0.45)),
                ("Notes", Color(white: 0.38))
            ]
        case "Nature":
            return [
                ("Day", Color.green),
                ("Week", Color.green.opacity(0.8)),
                ("Month", Color(red: 0.6, green: 0.9, blue: 0.6)),
                ("Year", Color(red: 0.4, green: 0.8, blue: 0.4)),
                ("Tasks", Color.green.opacity(0.9)),
                ("Notes", Color(red: 0.5, green: 0.85, blue: 0.5))
            ]
        default:
            return [
                ("Day", Color(red: 0.3, green: 0.3, blue: 0.35)),
                ("Week", Color(red: 1.0, green: 0.95, blue: 0.4)),
                ("Month", Color(red: 0.5, green: 0.85, blue: 0.6)),
                ("Year", Color(red: 0.7, green: 0.85, blue: 1.0)),
                ("Tasks", Color(red: 1.0, green: 0.7, blue: 0.8)),
                ("Notes", Color(red: 1.0, green: 0.85, blue: 0.6))
            ]
        }
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background with style
                styleBackground
                    .ignoresSafeArea()
                
                HStack(spacing: 0) {
                    // MAIN CONTENT AREA - Give more space, less covered by tabs
                    mainContent
                        .frame(maxWidth: geometry.size.width - 100) // More space away from tabs
                        .background(styleContentBackground)
                    
                    // POST-IT NOTE TABS
                    postItTabs
                        .frame(width: 100)
                        .background(Color(white: 0.15))
                }
            }
        }
        .ignoresSafeArea()
        .preferredColorScheme(styleColorScheme)
        .sheet(isPresented: $showSettings) {
            settingsSheet
        }
        .sheet(isPresented: $showVoiceCommand) {
            voiceCommandSheet
        }
    }
    
    // Dynamic color scheme based on style
    private var styleColorScheme: ColorScheme? {
        switch selectedStyle {
        case "Antique Calendar", "Hello Kitty", "Minimalist", "Nature":
            return .light
        default:
            return .dark
        }
    }
    
    // MARK: - Style Backgrounds (Image-like themes)
    private var styleBackground: some View {
        ZStack {
            switch selectedStyle {
            case "Antique Calendar":
                // REALISTIC VINTAGE PAPER TEXTURE
                ZStack {
                    // Base aged paper color
                    LinearGradient(
                        colors: [
                            Color(red: 0.92, green: 0.87, blue: 0.75),
                            Color(red: 0.88, green: 0.82, blue: 0.68),
                            Color(red: 0.85, green: 0.78, blue: 0.65)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    
                    // Paper fiber texture simulation
                    ForEach(0..<200, id: \.self) { i in
                        Rectangle()
                            .fill(Color.brown.opacity(0.02))
                            .frame(width: CGFloat.random(in: 20...100), height: 1)
                            .rotationEffect(.degrees(Double.random(in: -15...15)))
                            .offset(
                                x: CGFloat.random(in: -200...200),
                                y: CGFloat.random(in: -400...400)
                            )
                    }
                    
                    // Age spots and stains
                    ForEach(0..<30, id: \.self) { i in
                        Circle()
                            .fill(Color(red: 0.6, green: 0.5, blue: 0.3).opacity(0.1))
                            .frame(width: CGFloat.random(in: 20...80))
                            .blur(radius: 15)
                            .offset(
                                x: CGFloat.random(in: -180...180),
                                y: CGFloat.random(in: -400...400)
                            )
                    }
                    
                    // Worn edges effect
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [Color.clear, Color(red: 0.7, green: 0.6, blue: 0.4).opacity(0.2)],
                                startPoint: .center,
                                endPoint: .trailing
                            )
                        )
                }
                
            case "Hello Kitty":
                // KAWAII PINK DREAMLAND (not copyrighted Hello Kitty, but similar aesthetic)
                ZStack {
                    // Soft pink gradient like cotton candy
                    LinearGradient(
                        colors: [
                            Color(red: 1.0, green: 0.8, blue: 0.9),
                            Color(red: 1.0, green: 0.85, blue: 0.92),
                            Color(red: 0.98, green: 0.75, blue: 0.88)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    
                    // Soft pastel clouds
                    ForEach(0..<15, id: \.self) { i in
                        Ellipse()
                            .fill(Color.white.opacity(0.4))
                            .frame(width: CGFloat(80 + i * 15), height: CGFloat(50 + i * 8))
                            .blur(radius: 20)
                            .offset(
                                x: CGFloat((i % 4) * 100 - 150),
                                y: CGFloat((i / 4) * 180 - 350)
                            )
                    }
                    
                    // Sparkles
                    ForEach(0..<40, id: \.self) { i in
                        Image(systemName: "sparkles")
                            .font(.system(size: CGFloat(10 + i % 20)))
                            .foregroundColor(.white.opacity(0.5))
                            .offset(
                                x: CGFloat((i % 6) * 70 - 180),
                                y: CGFloat((i / 6) * 130 - 400)
                            )
                    }
                    
                    // Floating hearts
                    ForEach(0..<25, id: \.self) { i in
                        Image(systemName: "heart.fill")
                            .font(.system(size: CGFloat(15 + i % 25)))
                            .foregroundColor(Color.pink.opacity(0.3))
                            .offset(
                                x: CGFloat((i % 5) * 80 - 160),
                                y: CGFloat((i / 5) * 160 - 380)
                            )
                            .rotationEffect(.degrees(Double(i * 20)))
                    }
                    
                    // Soft bokeh circles (like dreamy photography)
                    ForEach(0..<20, id: \.self) { i in
                        Circle()
                            .fill(
                                RadialGradient(
                                    colors: [Color.white.opacity(0.3), Color.clear],
                                    center: .center,
                                    startRadius: 0,
                                    endRadius: 40
                                )
                            )
                            .frame(width: CGFloat(40 + i * 8))
                            .offset(
                                x: CGFloat((i % 4) * 110 - 160),
                                y: CGFloat((i / 4) * 170 - 400)
                            )
                    }
                }
                
            case "Thunderstorm":
                // REAL THUNDERSTORM PHOTO (user's image)
                Image("thunderstorm-background")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .ignoresSafeArea()
                
            case "Minimalist":
                // CLEAN WHITE WITH SUBTLE TEXTURE
                ZStack {
                    Color.white
                    
                    // Subtle paper texture
                    ForEach(0..<100, id: \.self) { i in
                        Rectangle()
                            .fill(Color.gray.opacity(0.01))
                            .frame(width: CGFloat.random(in: 50...150), height: 1)
                            .rotationEffect(.degrees(Double.random(in: -5...5)))
                            .offset(
                                x: CGFloat.random(in: -200...200),
                                y: CGFloat.random(in: -400...400)
                            )
                    }
                }
                
            case "Nature":
                // LUSH FOREST WITH LEAVES
                ZStack {
                    // Rich green forest gradient
                    LinearGradient(
                        colors: [
                            Color(red: 0.2, green: 0.5, blue: 0.3),
                            Color(red: 0.25, green: 0.55, blue: 0.35),
                            Color(red: 0.3, green: 0.6, blue: 0.4)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    
                    // Leaf layers (multiple depths for realism)
                    ForEach(0..<50, id: \.self) { i in
                        Image(systemName: "leaf.fill")
                            .font(.system(size: CGFloat(20 + i % 50)))
                            .foregroundColor(Color.green.opacity(0.15))
                            .rotationEffect(.degrees(Double(i * 25)))
                            .offset(
                                x: CGFloat((i % 6) * 70 - 180),
                                y: CGFloat((i / 6) * 100 - 400)
                            )
                    }
                    
                    // Darker leaves for depth
                    ForEach(0..<30, id: \.self) { i in
                        Image(systemName: "leaf.fill")
                            .font(.system(size: CGFloat(30 + i % 40)))
                            .foregroundColor(Color(red: 0.15, green: 0.4, blue: 0.2).opacity(0.2))
                            .rotationEffect(.degrees(Double(i * 30)))
                            .offset(
                                x: CGFloat((i % 5) * 90 - 180),
                                y: CGFloat((i / 5) * 130 - 350)
                            )
                    }
                    
                    // Light filtering through leaves effect
                    ForEach(0..<10, id: \.self) { i in
                        Circle()
                            .fill(
                                RadialGradient(
                                    colors: [Color(red: 0.9, green: 1.0, blue: 0.7).opacity(0.2), Color.clear],
                                    center: .center,
                                    startRadius: 0,
                                    endRadius: 60
                                )
                            )
                            .frame(width: 80)
                            .offset(
                                x: CGFloat((i % 3) * 130 - 130),
                                y: CGFloat((i / 3) * 200 - 300)
                            )
                            .blur(radius: 20)
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
                Color(red: 0.97, green: 0.94, blue: 0.88).opacity(0.5) // Very transparent
            case "Hello Kitty":
                Color.white.opacity(0.4) // Very transparent
            case "Thunderstorm":
                Color(white: 0.12).opacity(0.6) // Semi-transparent
            case "Minimalist":
                Color.white.opacity(0.9)
            case "Nature":
                Color.white.opacity(0.4) // Very transparent
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
        ScrollView {
            VStack(spacing: 0) {
                // HEADER WITH GUARANTEED SPACE
                VStack(spacing: 15) {
                    // Mini calendar at TOP
                    miniCalendar
                        .padding(.top, 30)
                    
                    // BIG DATE IN MIDDLE - VERY PROMINENT AND THEMED
                    VStack(spacing: 8) {
                        Text(selectedDate.formatted(.dateTime.month(.abbreviated)))
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(themedTextColor)
                        
                        Text("\(Calendar.current.component(.day, from: selectedDate))")
                            .font(.system(size: 100, weight: .bold))
                            .foregroundColor(themedAccentColor)
                        
                        Text(selectedDate.formatted(.dateTime.weekday(.wide)))
                            .font(.system(size: 16))
                            .foregroundColor(themedTextColor)
                        
                        Text(String(Calendar.current.component(.year, from: selectedDate)))
                            .font(.system(size: 14))
                            .foregroundColor(themedTextColor)
                    }
                    .padding(.bottom, 20)
                    
                    // Buttons
                    HStack(spacing: 15) {
                        Button(action: { showVoiceCommand = true }) {
                            HStack {
                                Image(systemName: "mic.fill")
                                Text("Voice")
                            }
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(LinearGradient(colors: [.purple, .blue], startPoint: .leading, endPoint: .trailing))
                            .cornerRadius(20)
                        }
                        
                        Button(action: {}) {
                            HStack {
                                Image(systemName: "plus")
                                Text("Event")
                            }
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.blue)
                            .cornerRadius(20)
                        }
                    }
                    .padding(.bottom, 20)
                }
                
                // Event slots
                eventSlots
                    .padding(.top, 20)
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
    
    // MARK: - Mini Calendar
    private var miniCalendar: some View {
        VStack(spacing: 12) {
            // Day headers - THEMED
            HStack(spacing: 10) {
                ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { day in
                    Text(day)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(themedTextColor)
                        .frame(width: 32)
                }
            }
            
            // Calendar grid - FULLY THEMED
            let calendar = Calendar.current
            let month = calendar.component(.month, from: selectedDate)
            let year = calendar.component(.year, from: selectedDate)
            let daysInMonth = calendar.range(of: .day, in: .month, for: selectedDate)?.count ?? 30
            let firstWeekday = calendar.component(.weekday, from: calendar.date(from: DateComponents(year: year, month: month, day: 1))!)
            let selectedDay = calendar.component(.day, from: selectedDate)
            
            VStack(spacing: 8) {
                ForEach(0..<6, id: \.self) { row in
                    HStack(spacing: 10) {
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
                                        .font(.system(size: 15, weight: .medium))
                                        .foregroundColor(dayOffset == selectedDay ? .white : themedTextColor)
                                        .frame(width: 32, height: 32)
                                        .background(dayOffset == selectedDay ? themedAccentColor : themedCellBackground)
                                        .cornerRadius(16)
                                }
                                .buttonStyle(.plain)
                            } else {
                                Text("")
                                    .frame(width: 32, height: 32)
                            }
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Themed Colors
    private var themedTextColor: Color {
        switch selectedStyle {
        case "Antique Calendar": return Color(red: 0.4, green: 0.3, blue: 0.2)
        case "Hello Kitty": return .pink
        case "Thunderstorm": return .gray
        case "Minimalist": return .black
        case "Nature": return Color(red: 0.2, green: 0.5, blue: 0.2)
        default: return .gray
        }
    }
    
    private var themedAccentColor: Color {
        switch selectedStyle {
        case "Antique Calendar": return Color(red: 0.6, green: 0.4, blue: 0.2)
        case "Hello Kitty": return .pink
        case "Thunderstorm": return .yellow
        case "Minimalist": return .black
        case "Nature": return .green
        default: return .blue
        }
    }
    
    private var themedCellBackground: Color {
        switch selectedStyle {
        case "Antique Calendar": return Color(red: 0.95, green: 0.92, blue: 0.85).opacity(0.5)
        case "Hello Kitty": return Color.pink.opacity(0.1)
        case "Thunderstorm": return Color(white: 0.2).opacity(0.3)
        case "Minimalist": return Color.white
        case "Nature": return Color.green.opacity(0.1)
        default: return Color.clear
        }
    }
    
    // MARK: - Event Slots
    private var eventSlots: some View {
        VStack(spacing: 0) {
            ForEach(0..<24, id: \.self) { hour in
                HStack(spacing: 0) {
                    // Hour label - THEMED
                    Text(formatHour(hour))
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(themedTextColor)
                        .frame(width: 70, alignment: .trailing)
                        .padding(.trailing, 10)
                    
                    // Event line - THEMED
                    Rectangle()
                        .fill(themedTextColor.opacity(0.2))
                        .frame(height: 1)
                    
                    Spacer()
                }
                .frame(height: 60)
                .background(themedCellBackground.opacity(0.3))
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
                
                // YEAR WITHOUT COMMA - using String interpolation
                Text(String(year))
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
                    // Header with AI button
                    HStack {
                        Text("My Tasks")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.white)
                        
                        Spacer()
                        
                        // AI Suggestions Button
                        Button(action: {
                            showAISuggestions = true
                        }) {
                            HStack(spacing: 6) {
                                Image(systemName: "sparkles")
                                Text("AI")
                            }
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(
                                LinearGradient(colors: [Color.purple, Color.blue], startPoint: .leading, endPoint: .trailing)
                            )
                            .cornerRadius(20)
                        }
                    }
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
        .sheet(isPresented: $showAISuggestions) {
            aiSuggestionsSheet
        }
    }
    
    // AI Suggestions Sheet
    private var aiSuggestionsSheet: some View {
        NavigationView {
            ZStack {
                Color(white: 0.12).ignoresSafeArea()
                
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // AI Task Suggestions
                        Text("AI Task Suggestions")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                        
                        VStack(spacing: 12) {
                            aiSuggestionCard("Review quarterly reports", category: "Work", icon: "chart.bar.fill", color: .blue)
                            aiSuggestionCard("Schedule dentist appointment", category: "Health", icon: "heart.fill", color: .red)
                            aiSuggestionCard("Buy groceries for the week", category: "Shopping", icon: "cart.fill", color: .green)
                            aiSuggestionCard("Call mom", category: "Personal", icon: "phone.fill", color: .purple)
                            aiSuggestionCard("Workout session", category: "Fitness", icon: "figure.run", color: .orange)
                        }
                        .padding(.horizontal, 20)
                        
                        // AI Templates
                        Text("AI Templates")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.top, 20)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 15) {
                                templateCard("Morning Routine", icon: "sunrise.fill", color: .orange)
                                templateCard("Work Day", icon: "briefcase.fill", color: .blue)
                                templateCard("Workout Plan", icon: "figure.strengthtraining.traditional", color: .red)
                                templateCard("Meal Prep", icon: "fork.knife", color: .green)
                                templateCard("Study Session", icon: "book.fill", color: .purple)
                            }
                            .padding(.horizontal, 20)
                        }
                        
                        // Smart Grocery Suggestions
                        Text("Smart Grocery List")
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 20)
                            .padding(.top, 20)
                        
                        VStack(spacing: 12) {
                            groceryCategory("Vegetables", items: ["Broccoli", "Carrots", "Spinach"])
                            groceryCategory("Fruits", items: ["Apples", "Bananas", "Oranges"])
                            groceryCategory("Protein", items: ["Chicken", "Eggs", "Greek Yogurt"])
                            groceryCategory("Pantry", items: ["Rice", "Pasta", "Olive Oil"])
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.vertical, 20)
                }
            }
            .navigationTitle("AI Assistant")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        showAISuggestions = false
                    }
                    .foregroundColor(.blue)
                }
            }
        }
        .preferredColorScheme(.dark)
    }
    
    private func aiSuggestionCard(_ title: String, category: String, icon: String, color: Color) -> some View {
        HStack(spacing: 15) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.2))
                    .frame(width: 50, height: 50)
                
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.system(size: 20))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white)
                
                Text(category)
                    .font(.system(size: 13))
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            Button(action: {}) {
                Image(systemName: "plus.circle.fill")
                    .foregroundColor(.blue)
                    .font(.system(size: 24))
            }
        }
        .padding()
        .background(Color(white: 0.2))
        .cornerRadius(12)
    }
    
    private func templateCard(_ title: String, icon: String, color: Color) -> some View {
        VStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.2))
                    .frame(width: 60, height: 60)
                
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.system(size: 28))
            }
            
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
        }
        .frame(width: 120)
        .padding()
        .background(Color(white: 0.2))
        .cornerRadius(12)
    }
    
    private func groceryCategory(_ category: String, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(category)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
            
            ForEach(items, id: \.self) { item in
                HStack {
                    Image(systemName: "circle")
                        .foregroundColor(.gray)
                    Text(item)
                        .foregroundColor(.white)
                    Spacer()
                    Button(action: {}) {
                        Image(systemName: "plus.circle")
                            .foregroundColor(.green)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .padding()
        .background(Color(white: 0.2))
        .cornerRadius(12)
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
    
    // MARK: - Voice Command Sheet
    private var voiceCommandSheet: some View {
        NavigationView {
            ZStack {
                Color(white: 0.12).ignoresSafeArea()
                
                VStack(spacing: 30) {
                    Spacer()
                    
                    // Microphone animation
                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(colors: [Color.purple.opacity(0.3), Color.blue.opacity(0.3)], startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                            .frame(width: 150, height: 150)
                        
                        Circle()
                            .stroke(
                                LinearGradient(colors: [Color.purple, Color.blue], startPoint: .topLeading, endPoint: .bottomTrailing),
                                lineWidth: 4
                            )
                            .frame(width: 120, height: 120)
                        
                        Image(systemName: "mic.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.white)
                    }
                    
                    Text("Listening...")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundColor(.white)
                    
                    Text("Try saying:")
                        .font(.system(size: 16))
                        .foregroundColor(.gray)
                    
                    VStack(alignment: .leading, spacing: 12) {
                        voiceCommandExample("\"Add task: Buy groceries\"")
                        voiceCommandExample("\"Create event tomorrow at 3pm\"")
                        voiceCommandExample("\"Show my tasks for today\"")
                        voiceCommandExample("\"Set reminder for Monday\"")
                    }
                    .padding(.horizontal, 20)
                    
                    Spacer()
                    
                    Button(action: {
                        showVoiceCommand = false
                    }) {
                        Text("Cancel")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(white: 0.2))
                            .cornerRadius(12)
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Voice Command")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        showVoiceCommand = false
                    }
                    .foregroundColor(.blue)
                }
            }
        }
        .preferredColorScheme(.dark)
    }
    
    private func voiceCommandExample(_ text: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "quote.bubble.fill")
                .foregroundColor(.blue)
            Text(text)
                .font(.system(size: 15))
                .foregroundColor(.white)
        }
    }
}

