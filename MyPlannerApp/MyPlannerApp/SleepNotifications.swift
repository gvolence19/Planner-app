import SwiftUI
import Foundation
import UserNotifications
import AVFoundation

// MARK: - Sleep Notification Manager
class SleepNotificationManager: ObservableObject {
    static let shared = SleepNotificationManager()
    
    @Published var bedtimeHour: Int = 22 // 10:00 PM
    @Published var bedtimeMinute: Int = 0
    @Published var wakeTimeHour: Int = 7 // 7:00 AM
    @Published var wakeTimeMinute: Int = 0
    @Published var notificationsEnabled: Bool = false
    @Published var wakeAlarmEnabled: Bool = false
    @Published var selectedWakeSound: WakeAlarmSound = .gentle
    
    // Notification categories
    private let windDownCategory = "WIND_DOWN_CATEGORY"
    private let bedtimeCategory = "BEDTIME_CATEGORY"
    private let wakeAlarmCategory = "WAKE_ALARM_CATEGORY"
    
    init() {
        loadSettings()
        setupNotificationCategories()
    }
    
    // MARK: - Setup
    func setupNotificationCategories() {
        let center = UNUserNotificationCenter.current()
        
        // Wind Down category (1 hour before bed)
        let windDownCategory = UNNotificationCategory(
            identifier: windDownCategory,
            actions: [],
            intentIdentifiers: [],
            options: .customDismissAction
        )
        
        // Bedtime category
        let bedtimeCategory = UNNotificationCategory(
            identifier: bedtimeCategory,
            actions: [],
            intentIdentifiers: [],
            options: .customDismissAction
        )
        
        // Wake Alarm category (with snooze)
        let snoozeAction = UNNotificationAction(
            identifier: "SNOOZE_ACTION",
            title: "Snooze (10 min)",
            options: []
        )
        
        let wakeCategory = UNNotificationCategory(
            identifier: wakeAlarmCategory,
            actions: [snoozeAction],
            intentIdentifiers: [],
            options: .customDismissAction
        )
        
        center.setNotificationCategories([windDownCategory, bedtimeCategory, wakeCategory])
    }
    
    // MARK: - Schedule Notifications
    func scheduleAllNotifications() {
        guard notificationsEnabled else { return }
        
        cancelAllNotifications()
        
        // Schedule wind down (1 hour before bed)
        scheduleWindDownNotification()
        
        // Schedule bedtime
        scheduleBedtimeNotification()
    }
    
    func scheduleWakeAlarm() {
        guard wakeAlarmEnabled else {
            cancelWakeAlarm()
            return
        }
        
        let content = UNMutableNotificationContent()
        content.title = "⏰ Wake Up!"
        content.body = "Good morning! Time to start your day."
        content.categoryIdentifier = wakeAlarmCategory
        content.sound = selectedWakeSound.notificationSound
        content.interruptionLevel = .timeSensitive
        
        // Set wake time
        var dateComponents = DateComponents()
        dateComponents.hour = wakeTimeHour
        dateComponents.minute = wakeTimeMinute
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(
            identifier: "wake_alarm",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error scheduling wake alarm: \(error)")
            }
        }
    }
    
    private func scheduleWindDownNotification() {
        let content = UNMutableNotificationContent()
        content.title = "🌙 Wind Down Time"
        content.body = "It's 1 hour before bedtime. Consider putting your phone down and starting your bedtime routine."
        content.categoryIdentifier = windDownCategory
        content.sound = UNNotificationSound(named: UNNotificationSoundName("wind_down.caf"))
        
        // Calculate 1 hour before bedtime
        var windDownHour = bedtimeHour - 1
        var windDownMinute = bedtimeMinute
        
        if windDownHour < 0 {
            windDownHour += 24
        }
        
        var dateComponents = DateComponents()
        dateComponents.hour = windDownHour
        dateComponents.minute = windDownMinute
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(
            identifier: "wind_down",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error scheduling wind down: \(error)")
            }
        }
    }
    
    private func scheduleBedtimeNotification() {
        let content = UNMutableNotificationContent()
        content.title = "😴 Bedtime"
        content.body = "Time for bed! Get a good night's sleep."
        content.categoryIdentifier = bedtimeCategory
        content.sound = UNNotificationSound(named: UNNotificationSoundName("bedtime.caf"))
        
        var dateComponents = DateComponents()
        dateComponents.hour = bedtimeHour
        dateComponents.minute = bedtimeMinute
        
        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        let request = UNNotificationRequest(
            identifier: "bedtime",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Error scheduling bedtime: \(error)")
            }
        }
    }
    
    // MARK: - Cancel
    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(
            withIdentifiers: ["wind_down", "bedtime"]
        )
    }
    
    func cancelWakeAlarm() {
        UNUserNotificationCenter.current().removePendingNotificationRequests(
            withIdentifiers: ["wake_alarm"]
        )
    }
    
    // MARK: - Snooze
    func snoozeWakeAlarm() {
        // Schedule alarm 10 minutes from now
        let content = UNMutableNotificationContent()
        content.title = "⏰ Wake Up!"
        content.body = "Snooze is over. Time to wake up!"
        content.categoryIdentifier = wakeAlarmCategory
        content.sound = selectedWakeSound.notificationSound
        content.interruptionLevel = .timeSensitive
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 600, repeats: false) // 10 minutes
        let request = UNNotificationRequest(
            identifier: "wake_alarm_snooze",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Persistence
    func saveSettings() {
        UserDefaults.standard.set(bedtimeHour, forKey: "bedtimeHour")
        UserDefaults.standard.set(bedtimeMinute, forKey: "bedtimeMinute")
        UserDefaults.standard.set(wakeTimeHour, forKey: "wakeTimeHour")
        UserDefaults.standard.set(wakeTimeMinute, forKey: "wakeTimeMinute")
        UserDefaults.standard.set(notificationsEnabled, forKey: "sleepNotificationsEnabled")
        UserDefaults.standard.set(wakeAlarmEnabled, forKey: "wakeAlarmEnabled")
        UserDefaults.standard.set(selectedWakeSound.rawValue, forKey: "selectedWakeSound")
    }
    
    func loadSettings() {
        bedtimeHour = UserDefaults.standard.integer(forKey: "bedtimeHour")
        bedtimeMinute = UserDefaults.standard.integer(forKey: "bedtimeMinute")
        wakeTimeHour = UserDefaults.standard.integer(forKey: "wakeTimeHour")
        wakeTimeMinute = UserDefaults.standard.integer(forKey: "wakeTimeMinute")
        notificationsEnabled = UserDefaults.standard.bool(forKey: "sleepNotificationsEnabled")
        wakeAlarmEnabled = UserDefaults.standard.bool(forKey: "wakeAlarmEnabled")
        
        if let soundRaw = UserDefaults.standard.string(forKey: "selectedWakeSound"),
           let sound = WakeAlarmSound(rawValue: soundRaw) {
            selectedWakeSound = sound
        }
        
        // Set defaults if not set
        if bedtimeHour == 0 && bedtimeMinute == 0 {
            bedtimeHour = 22
        }
        if wakeTimeHour == 0 && wakeTimeMinute == 0 {
            wakeTimeHour = 7
        }
    }
}

// MARK: - Wake Alarm Sounds
enum WakeAlarmSound: String, CaseIterable {
    case gentle = "Gentle Chimes"
    case energetic = "Energetic Beat"
    case nature = "Nature Sounds"
    case classic = "Classic Alarm"
    case peaceful = "Peaceful Piano"
    
    var displayName: String {
        self.rawValue
    }
    
    var icon: String {
        switch self {
        case .gentle: return "music.note"
        case .energetic: return "bolt.fill"
        case .nature: return "leaf.fill"
        case .classic: return "bell.fill"
        case .peaceful: return "piano"
        }
    }
    
    var notificationSound: UNNotificationSound {
        switch self {
        case .gentle:
            return UNNotificationSound(named: UNNotificationSoundName("gentle_chimes.caf"))
        case .energetic:
            return UNNotificationSound(named: UNNotificationSoundName("energetic_beat.caf"))
        case .nature:
            return UNNotificationSound(named: UNNotificationSoundName("nature_sounds.caf"))
        case .classic:
            return UNNotificationSound.default
        case .peaceful:
            return UNNotificationSound(named: UNNotificationSoundName("peaceful_piano.caf"))
        }
    }
    
    var description: String {
        switch self {
        case .gentle: return "Soft, calming chimes to ease you awake"
        case .energetic: return "Upbeat rhythm to energize your morning"
        case .nature: return "Birds and water for a natural wake-up"
        case .classic: return "Traditional alarm sound"
        case .peaceful: return "Gentle piano melody to start your day"
        }
    }
}

// MARK: - Sleep Notifications Settings View
struct SleepNotificationsView: View {
    @StateObject private var notificationManager = SleepNotificationManager.shared
    @EnvironmentObject var themeManager: ThemeManager
    @State private var showingSoundPicker = false
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        Form {
            // Sleep Notifications Section
            Section(header: Text("Sleep Notifications"), footer: Text("Get reminded to wind down 1 hour before bed and when it's time to sleep")) {
                Toggle("Enable Sleep Reminders", isOn: $notificationManager.notificationsEnabled)
                    .onChange(of: notificationManager.notificationsEnabled) { enabled in
                        notificationManager.saveSettings()
                        if enabled {
                            notificationManager.scheduleAllNotifications()
                        } else {
                            notificationManager.cancelAllNotifications()
                        }
                    }
                
                if notificationManager.notificationsEnabled {
                    // Bedtime Picker
                    DatePicker("Bedtime",
                              selection: Binding(
                                get: { createDate(hour: notificationManager.bedtimeHour, minute: notificationManager.bedtimeMinute) },
                                set: { newDate in
                                    let components = Calendar.current.dateComponents([.hour, .minute], from: newDate)
                                    notificationManager.bedtimeHour = components.hour ?? 22
                                    notificationManager.bedtimeMinute = components.minute ?? 0
                                    notificationManager.saveSettings()
                                    notificationManager.scheduleAllNotifications()
                                }
                              ),
                              displayedComponents: .hourAndMinute)
                    
                    // Wind Down Time Display
                    HStack {
                        Image(systemName: "moon.stars.fill")
                            .foregroundColor(theme.primaryColor.color)
                        Text("Wind Down Alert")
                        Spacer()
                        Text(windDownTimeString())
                            .foregroundColor(.secondary)
                    }
                    
                    // Notification Previews
                    notificationPreview(
                        icon: "moon.stars.fill",
                        title: "Wind Down",
                        time: windDownTimeString(),
                        body: "1 hour before bedtime - Put your phone down",
                        color: theme.secondaryColor.color
                    )
                    
                    notificationPreview(
                        icon: "bed.double.fill",
                        title: "Bedtime",
                        time: bedtimeString(),
                        body: "Time for bed! Get a good night's sleep.",
                        color: theme.primaryColor.color
                    )
                }
            }
            
            // Wake Alarm Section
            Section(header: Text("Wake Alarm"), footer: Text("Set an alarm to wake you up with your choice of sound")) {
                Toggle("Enable Wake Alarm", isOn: $notificationManager.wakeAlarmEnabled)
                    .onChange(of: notificationManager.wakeAlarmEnabled) { enabled in
                        notificationManager.saveSettings()
                        notificationManager.scheduleWakeAlarm()
                    }
                
                if notificationManager.wakeAlarmEnabled {
                    // Wake Time Picker
                    DatePicker("Wake Time",
                              selection: Binding(
                                get: { createDate(hour: notificationManager.wakeTimeHour, minute: notificationManager.wakeTimeMinute) },
                                set: { newDate in
                                    let components = Calendar.current.dateComponents([.hour, .minute], from: newDate)
                                    notificationManager.wakeTimeHour = components.hour ?? 7
                                    notificationManager.wakeTimeMinute = components.minute ?? 0
                                    notificationManager.saveSettings()
                                    notificationManager.scheduleWakeAlarm()
                                }
                              ),
                              displayedComponents: .hourAndMinute)
                    
                    // Alarm Sound Picker
                    Button(action: { showingSoundPicker = true }) {
                        HStack {
                            Image(systemName: notificationManager.selectedWakeSound.icon)
                                .foregroundColor(theme.primaryColor.color)
                            Text("Alarm Sound")
                            Spacer()
                            Text(notificationManager.selectedWakeSound.displayName)
                                .foregroundColor(.secondary)
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14))
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    // Sleep Duration
                    HStack {
                        Image(systemName: "moon.zzz.fill")
                            .foregroundColor(theme.secondaryColor.color)
                        Text("Sleep Duration")
                        Spacer()
                        Text(sleepDurationString())
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            // Test Notifications
            if notificationManager.notificationsEnabled || notificationManager.wakeAlarmEnabled {
                Section(header: Text("Test"), footer: Text("Test notifications to hear the sounds (appears in 5 seconds)")) {
                    Button(action: { testWindDownNotification() }) {
                        HStack {
                            Image(systemName: "moon.stars.fill")
                                .foregroundColor(theme.secondaryColor.color)
                            Text("Test Wind Down Alert")
                            Spacer()
                        }
                    }
                    
                    Button(action: { testBedtimeNotification() }) {
                        HStack {
                            Image(systemName: "bed.double.fill")
                                .foregroundColor(theme.primaryColor.color)
                            Text("Test Bedtime Alert")
                            Spacer()
                        }
                    }
                    
                    if notificationManager.wakeAlarmEnabled {
                        Button(action: { testWakeAlarm() }) {
                            HStack {
                                Image(systemName: "alarm.fill")
                                    .foregroundColor(.orange)
                                Text("Test Wake Alarm")
                                Spacer()
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Sleep Notifications")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showingSoundPicker) {
            AlarmSoundPickerView()
                .environmentObject(themeManager)
        }
    }
    
    // MARK: - Helper Views
    private func notificationPreview(icon: String, title: String, time: String, body: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Text(title)
                    .font(.system(size: 14, weight: .semibold))
                Spacer()
                Text(time)
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
            }
            
            Text(body)
                .font(.system(size: 13))
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
    
    // MARK: - Helpers
    private func createDate(hour: Int, minute: Int) -> Date {
        let calendar = Calendar.current
        var components = calendar.dateComponents([.year, .month, .day], from: Date())
        components.hour = hour
        components.minute = minute
        return calendar.date(from: components) ?? Date()
    }
    
    private func windDownTimeString() -> String {
        var hour = notificationManager.bedtimeHour - 1
        if hour < 0 { hour += 24 }
        return formatTime(hour: hour, minute: notificationManager.bedtimeMinute)
    }
    
    private func bedtimeString() -> String {
        return formatTime(hour: notificationManager.bedtimeHour, minute: notificationManager.bedtimeMinute)
    }
    
    private func formatTime(hour: Int, minute: Int) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        let date = createDate(hour: hour, minute: minute)
        return formatter.string(from: date)
    }
    
    private func sleepDurationString() -> String {
        var duration = notificationManager.wakeTimeHour - notificationManager.bedtimeHour
        if duration < 0 { duration += 24 }
        return "\(duration) hours"
    }
    
    // MARK: - Test Notifications
    private func testWindDownNotification() {
        let content = UNMutableNotificationContent()
        content.title = "🌙 Wind Down Time"
        content.body = "It's 1 hour before bedtime. Consider putting your phone down."
        content.sound = UNNotificationSound(named: UNNotificationSoundName("wind_down.caf"))
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    private func testBedtimeNotification() {
        let content = UNMutableNotificationContent()
        content.title = "😴 Bedtime"
        content.body = "Time for bed! Get a good night's sleep."
        content.sound = UNNotificationSound(named: UNNotificationSoundName("bedtime.caf"))
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
    
    private func testWakeAlarm() {
        let content = UNMutableNotificationContent()
        content.title = "⏰ Wake Up!"
        content.body = "Good morning! Time to start your day."
        content.sound = notificationManager.selectedWakeSound.notificationSound
        content.interruptionLevel = .timeSensitive
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 5, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
}

// MARK: - Alarm Sound Picker
struct AlarmSoundPickerView: View {
    @StateObject private var notificationManager = SleepNotificationManager.shared
    @EnvironmentObject var themeManager: ThemeManager
    @Environment(\.dismiss) var dismiss
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        NavigationView {
            List {
                ForEach(WakeAlarmSound.allCases, id: \.self) { sound in
                    Button(action: {
                        notificationManager.selectedWakeSound = sound
                        notificationManager.saveSettings()
                        notificationManager.scheduleWakeAlarm()
                        dismiss()
                    }) {
                        HStack(spacing: 12) {
                            Image(systemName: sound.icon)
                                .font(.system(size: 24))
                                .foregroundColor(theme.primaryColor.color)
                                .frame(width: 40)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(sound.displayName)
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(.primary)
                                
                                Text(sound.description)
                                    .font(.system(size: 13))
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            if notificationManager.selectedWakeSound == sound {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(theme.primaryColor.color)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Alarm Sound")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}
