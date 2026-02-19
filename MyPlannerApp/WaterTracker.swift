import SwiftUI
import UserNotifications

// MARK: - Water Entry Model
struct WaterEntry: Identifiable, Codable {
    let id: UUID
    let amount: Double // in ounces
    let timestamp: Date
    
    init(id: UUID = UUID(), amount: Double, timestamp: Date = Date()) {
        self.id = id
        self.amount = amount
        self.timestamp = timestamp
    }
}

// MARK: - Water Goal Settings
struct WaterGoalSettings: Codable {
    var dailyGoalOunces: Double = 64.0
    var containerSizes: [Double] = [8, 12, 16, 20, 24, 32] // Quick add options
    var reminderTimes: [ReminderTime] = [
        ReminderTime(hour: 9, minute: 0, enabled: true, label: "Morning"),
        ReminderTime(hour: 14, minute: 0, enabled: true, label: "Afternoon"),
        ReminderTime(hour: 19, minute: 0, enabled: true, label: "Evening")
    ]
}

struct ReminderTime: Identifiable, Codable {
    var id = UUID()
    var hour: Int
    var minute: Int
    var enabled: Bool
    var label: String
}

// MARK: - Water Tracker Manager
class WaterTrackerManager: ObservableObject {
    @Published var todayEntries: [WaterEntry] = []
    @Published var settings: WaterGoalSettings = WaterGoalSettings()
    @Published var notificationsEnabled: Bool = false
    
    private let entriesKey = "water_entries"
    private let settingsKey = "water_settings"
    
    init() {
        loadData()
        checkNotificationStatus()
    }
    
    // MARK: - Data Management
    func loadData() {
        // Load settings
        if let settingsData = UserDefaults.standard.data(forKey: settingsKey),
           let decoded = try? JSONDecoder().decode(WaterGoalSettings.self, from: settingsData) {
            settings = decoded
        }
        
        // Load today's entries
        if let entriesData = UserDefaults.standard.data(forKey: entriesKey),
           let allEntries = try? JSONDecoder().decode([WaterEntry].self, from: entriesData) {
            // Filter to today only
            todayEntries = allEntries.filter { Calendar.current.isDateInToday($0.timestamp) }
        }
    }
    
    func saveData() {
        // Save settings
        if let encoded = try? JSONEncoder().encode(settings) {
            UserDefaults.standard.set(encoded, forKey: settingsKey)
        }
        
        // Save entries
        if let encoded = try? JSONEncoder().encode(todayEntries) {
            UserDefaults.standard.set(encoded, forKey: entriesKey)
        }
    }
    
    // MARK: - Water Tracking
    func addWater(amount: Double) {
        let entry = WaterEntry(amount: amount)
        todayEntries.append(entry)
        saveData()
    }
    
    func removeEntry(_ entry: WaterEntry) {
        todayEntries.removeAll { $0.id == entry.id }
        saveData()
    }
    
    func resetToday() {
        todayEntries.removeAll()
        saveData()
    }
    
    // MARK: - Calculations
    var totalToday: Double {
        todayEntries.reduce(0) { $0 + $1.amount }
    }
    
    var progress: Double {
        min(totalToday / settings.dailyGoalOunces, 1.0)
    }
    
    var remainingOunces: Double {
        max(settings.dailyGoalOunces - totalToday, 0)
    }
    
    var isGoalMet: Bool {
        totalToday >= settings.dailyGoalOunces
    }
    
    // MARK: - Notifications
    func checkNotificationStatus() {
        UNUserNotificationCenter.current().getNotificationSettings { settings in
            DispatchQueue.main.async {
                self.notificationsEnabled = settings.authorizationStatus == .authorized
            }
        }
    }
    
    func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            DispatchQueue.main.async {
                self.notificationsEnabled = granted
                if granted {
                    self.scheduleReminders()
                }
            }
        }
    }
    
    func scheduleReminders() {
        // Remove existing notifications
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        
        guard notificationsEnabled else { return }
        
        for reminder in settings.reminderTimes where reminder.enabled {
            let content = UNMutableNotificationContent()
            content.title = "💧 Stay Hydrated!"
            content.body = "Time for your \(reminder.label.lowercased()) water. Keep up the good work!"
            content.sound = .default
            
            var dateComponents = DateComponents()
            dateComponents.hour = reminder.hour
            dateComponents.minute = reminder.minute
            
            let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
            let request = UNNotificationRequest(identifier: "water-\(reminder.id.uuidString)", content: content, trigger: trigger)
            
            UNUserNotificationCenter.current().add(request)
        }
    }
    
    func updateSettings(_ newSettings: WaterGoalSettings) {
        settings = newSettings
        saveData()
        scheduleReminders()
    }
}

// MARK: - Water Tracker View
struct WaterTrackerView: View {
    @StateObject private var tracker = WaterTrackerManager()
    @State private var showingAddWater = false
    @State private var showingSettings = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Water Tracker")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Spacer()
                
                Button(action: { showingSettings = true }) {
                    Image(systemName: "gear")
                        .font(.title3)
                        .foregroundColor(.accentColor)
                }
            }
            .padding()
            
            ScrollView {
                VStack(spacing: 24) {
                    // Progress Circle
                    ZStack {
                        Circle()
                            .stroke(Color(.systemGray5), lineWidth: 20)
                            .frame(width: 200, height: 200)
                        
                        Circle()
                            .trim(from: 0, to: tracker.progress)
                            .stroke(
                                LinearGradient(
                                    colors: [.blue, .cyan],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                style: StrokeStyle(lineWidth: 20, lineCap: .round)
                            )
                            .frame(width: 200, height: 200)
                            .rotationEffect(.degrees(-90))
                            .animation(.spring(), value: tracker.progress)
                        
                        VStack(spacing: 4) {
                            Text("💧")
                                .font(.system(size: 40))
                            
                            Text("\(Int(tracker.totalToday))")
                                .font(.system(size: 48, weight: .bold))
                            
                            Text("oz / \(Int(tracker.settings.dailyGoalOunces)) oz")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical)
                    
                    // Goal Status
                    if tracker.isGoalMet {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Goal achieved! Great job! 🎉")
                                .font(.headline)
                        }
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(12)
                    } else {
                        VStack(spacing: 8) {
                            Text("Keep going!")
                                .font(.headline)
                            Text("\(Int(tracker.remainingOunces)) oz to go")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    
                    // Quick Add Buttons
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Quick Add")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 12) {
                            ForEach(tracker.settings.containerSizes, id: \.self) { size in
                                Button(action: { tracker.addWater(amount: size) }) {
                                    VStack(spacing: 4) {
                                        Image(systemName: "drop.fill")
                                            .font(.title2)
                                        Text("\(Int(size)) oz")
                                            .font(.subheadline)
                                            .fontWeight(.medium)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(Color.blue.opacity(0.1))
                                    .foregroundColor(.blue)
                                    .cornerRadius(12)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Custom Amount Button
                    Button(action: { showingAddWater = true }) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Add Custom Amount")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                    }
                    .padding(.horizontal)
                    
                    // Today's History
                    if !tracker.todayEntries.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("Today's History")
                                    .font(.headline)
                                
                                Spacer()
                                
                                Button("Reset") {
                                    tracker.resetToday()
                                }
                                .font(.subheadline)
                                .foregroundColor(.red)
                            }
                            .padding(.horizontal)
                            
                            ForEach(tracker.todayEntries.sorted(by: { $0.timestamp > $1.timestamp })) { entry in
                                HStack {
                                    Image(systemName: "drop.fill")
                                        .foregroundColor(.blue)
                                    
                                    Text("\(Int(entry.amount)) oz")
                                        .font(.subheadline)
                                    
                                    Spacer()
                                    
                                    Text(entry.timestamp, style: .time)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                    
                                    Button(action: { tracker.removeEntry(entry) }) {
                                        Image(systemName: "xmark.circle.fill")
                                            .foregroundColor(.gray)
                                    }
                                }
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            }
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.bottom, 20)
            }
        }
        .sheet(isPresented: $showingAddWater) {
            AddCustomWaterView(tracker: tracker)
        }
        .sheet(isPresented: $showingSettings) {
            WaterTrackerSettingsView(tracker: tracker)
        }
    }
}

// MARK: - Add Custom Water View
struct AddCustomWaterView: View {
    @ObservedObject var tracker: WaterTrackerManager
    @Environment(\.dismiss) var dismiss
    @State private var customAmount = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Amount (oz)")) {
                    TextField("Enter ounces", text: $customAmount)
                        .keyboardType(.decimalPad)
                }
                
                Section {
                    Button("Add Water") {
                        if let amount = Double(customAmount), amount > 0 {
                            tracker.addWater(amount: amount)
                            dismiss()
                        }
                    }
                    .disabled(customAmount.isEmpty)
                }
            }
            .navigationTitle("Add Custom Amount")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Water Tracker Settings View
struct WaterTrackerSettingsView: View {
    @ObservedObject var tracker: WaterTrackerManager
    @Environment(\.dismiss) var dismiss
    @State private var settings: WaterGoalSettings
    
    init(tracker: WaterTrackerManager) {
        self.tracker = tracker
        _settings = State(initialValue: tracker.settings)
    }
    
    var body: some View {
        NavigationView {
            Form {
                // Daily Goal
                Section(header: Text("Daily Goal")) {
                    HStack {
                        Text("Goal")
                        Spacer()
                        TextField("", value: $settings.dailyGoalOunces, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 80)
                        Text("oz")
                            .foregroundColor(.secondary)
                    }
                    
                    Picker("Preset Goals", selection: $settings.dailyGoalOunces) {
                        Text("48 oz (6 cups)").tag(48.0)
                        Text("64 oz (8 cups) - Recommended").tag(64.0)
                        Text("80 oz (10 cups)").tag(80.0)
                        Text("96 oz (12 cups)").tag(96.0)
                        Text("128 oz (16 cups)").tag(128.0)
                    }
                }
                
                // Notifications
                Section(header: Text("Reminders"), footer: Text("Get reminded to drink water throughout the day")) {
                    if !tracker.notificationsEnabled {
                        Button("Enable Notifications") {
                            tracker.requestNotificationPermission()
                        }
                        .foregroundColor(.blue)
                    } else {
                        ForEach($settings.reminderTimes) { $reminder in
                            VStack(spacing: 8) {
                                Toggle(reminder.label, isOn: $reminder.enabled)
                                
                                if reminder.enabled {
                                    HStack {
                                        Text("Time:")
                                            .foregroundColor(.secondary)
                                        
                                        Spacer()
                                        
                                        Picker("Hour", selection: $reminder.hour) {
                                            ForEach(0..<24, id: \.self) { hour in
                                                Text(formatHour(hour)).tag(hour)
                                            }
                                        }
                                        .frame(width: 100)
                                        
                                        Text(":")
                                        
                                        Picker("Minute", selection: $reminder.minute) {
                                            ForEach([0, 15, 30, 45], id: \.self) { minute in
                                                Text(String(format: "%02d", minute)).tag(minute)
                                            }
                                        }
                                        .frame(width: 80)
                                    }
                                    .font(.subheadline)
                                }
                            }
                        }
                    }
                }
                
                // Container Sizes
                Section(header: Text("Quick Add Sizes (oz)"), footer: Text("Customize your frequently used container sizes")) {
                    ForEach($settings.containerSizes.indices, id: \.self) { index in
                        HStack {
                            Image(systemName: "drop.fill")
                                .foregroundColor(.blue)
                            
                            TextField("Size", value: $settings.containerSizes[index], format: .number)
                                .keyboardType(.numberPad)
                            
                            Text("oz")
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .navigationTitle("Water Tracker Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        tracker.updateSettings(settings)
                        dismiss()
                    }
                }
            }
        }
    }
    
    private func formatHour(_ hour: Int) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h a"
        let date = Calendar.current.date(bySettingHour: hour, minute: 0, second: 0, of: Date()) ?? Date()
        return formatter.string(from: date)
    }
}
