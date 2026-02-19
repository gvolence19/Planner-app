import SwiftUI
import UserNotifications

// MARK: - Event Models
enum EventType: String, CaseIterable, Codable {
    case birthday = "Birthday"
    case anniversary = "Anniversary"
    case holiday = "Holiday"
    case custom = "Custom Event"
    
    var icon: String {
        switch self {
        case .birthday: return "🎂"
        case .anniversary: return "💕"
        case .holiday: return "🎉"
        case .custom: return "⭐️"
        }
    }
    
    var color: Color {
        switch self {
        case .birthday: return .pink
        case .anniversary: return .red
        case .holiday: return .purple
        case .custom: return .blue
        }
    }
}

struct LifeEvent: Identifiable, Codable {
    let id: UUID
    var name: String
    var date: Date
    var type: EventType
    var isRecurring: Bool
    var notes: String?
    var notificationEnabled: Bool
    var notificationDaysBefore: Int // 0 = day of, 1 = day before, etc.
    
    init(id: UUID = UUID(), name: String, date: Date, type: EventType, isRecurring: Bool = true, notes: String? = nil, notificationEnabled: Bool = true, notificationDaysBefore: Int = 1) {
        self.id = id
        self.name = name
        self.date = date
        self.type = type
        self.isRecurring = isRecurring
        self.notes = notes
        self.notificationEnabled = notificationEnabled
        self.notificationDaysBefore = notificationDaysBefore
    }
    
    // Get the next occurrence date
    var nextOccurrence: Date {
        guard isRecurring else { return date }
        
        let calendar = Calendar.current
        let now = Date()
        
        // Get components from the original date
        let components = calendar.dateComponents([.month, .day], from: date)
        
        // Try this year
        var nextComponents = calendar.dateComponents([.year], from: now)
        nextComponents.month = components.month
        nextComponents.day = components.day
        
        if let thisYear = calendar.date(from: nextComponents), thisYear >= now {
            return thisYear
        }
        
        // Next year
        nextComponents.year! += 1
        return calendar.date(from: nextComponents) ?? date
    }
    
    // Days until next occurrence
    var daysUntil: Int {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        let eventDate = calendar.startOfDay(for: nextOccurrence)
        let components = calendar.dateComponents([.day], from: today, to: eventDate)
        return components.day ?? 0
    }
    
    // Years since original date (for age/anniversary)
    var yearsSince: Int? {
        guard isRecurring else { return nil }
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year], from: date, to: Date())
        return components.year
    }
}

// MARK: - Events Manager
class EventsManager: ObservableObject {
    @Published var events: [LifeEvent] = []
    @Published var notificationsEnabled: Bool = false
    
    private let eventsKey = "saved_events"
    
    init() {
        loadEvents()
        checkNotificationStatus()
        loadDefaultHolidays()
    }
    
    // MARK: - Data Management
    func loadEvents() {
        if let data = UserDefaults.standard.data(forKey: eventsKey),
           let decoded = try? JSONDecoder().decode([LifeEvent].self, from: data) {
            events = decoded
        }
    }
    
    func saveEvents() {
        if let encoded = try? JSONEncoder().encode(events) {
            UserDefaults.standard.set(encoded, forKey: eventsKey)
        }
        scheduleAllNotifications()
    }
    
    func addEvent(_ event: LifeEvent) {
        events.append(event)
        saveEvents()
    }
    
    func updateEvent(_ event: LifeEvent) {
        if let index = events.firstIndex(where: { $0.id == event.id }) {
            events[index] = event
            saveEvents()
        }
    }
    
    func deleteEvent(_ event: LifeEvent) {
        events.removeAll { $0.id == event.id }
        cancelNotification(for: event)
        saveEvents()
    }
    
    // MARK: - Default Holidays
    func loadDefaultHolidays() {
        // Only add if no holidays exist
        let hasHolidays = events.contains { $0.type == .holiday }
        guard !hasHolidays else { return }
        
        let calendar = Calendar.current
        let year = calendar.component(.year, from: Date())
        
        let defaultHolidays: [(String, Int, Int)] = [
            ("New Year's Day", 1, 1),
            ("Valentine's Day", 2, 14),
            ("St. Patrick's Day", 3, 17),
            ("Easter Sunday", 4, 9), // Approximate
            ("Mother's Day", 5, 14), // Approximate
            ("Father's Day", 6, 18), // Approximate
            ("Independence Day", 7, 4),
            ("Halloween", 10, 31),
            ("Thanksgiving", 11, 23), // Approximate
            ("Christmas", 12, 25),
            ("New Year's Eve", 12, 31)
        ]
        
        for (name, month, day) in defaultHolidays {
            var components = DateComponents()
            components.year = year
            components.month = month
            components.day = day
            
            if let date = calendar.date(from: components) {
                let holiday = LifeEvent(
                    name: name,
                    date: date,
                    type: .holiday,
                    isRecurring: true,
                    notificationDaysBefore: 1
                )
                events.append(holiday)
            }
        }
        
        saveEvents()
    }
    
    // MARK: - Sorting
    func upcomingEvents(limit: Int? = nil) -> [LifeEvent] {
        let sorted = events.sorted { $0.daysUntil < $1.daysUntil }
        if let limit = limit {
            return Array(sorted.prefix(limit))
        }
        return sorted
    }
    
    func eventsByType(_ type: EventType) -> [LifeEvent] {
        events.filter { $0.type == type }.sorted { $0.daysUntil < $1.daysUntil }
    }
    
    func eventsToday() -> [LifeEvent] {
        events.filter { $0.daysUntil == 0 }
    }
    
    func eventsThisWeek() -> [LifeEvent] {
        events.filter { $0.daysUntil <= 7 && $0.daysUntil >= 0 }
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
                    self.scheduleAllNotifications()
                }
            }
        }
    }
    
    func scheduleAllNotifications() {
        // Remove all existing
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        
        guard notificationsEnabled else { return }
        
        for event in events where event.notificationEnabled {
            scheduleNotification(for: event)
        }
    }
    
    private func scheduleNotification(for event: LifeEvent) {
        let calendar = Calendar.current
        let notificationDate = calendar.date(byAdding: .day, value: -event.notificationDaysBefore, to: event.nextOccurrence)!
        
        let content = UNMutableNotificationContent()
        content.title = "\(event.type.icon) \(event.type.rawValue) Reminder"
        
        if event.notificationDaysBefore == 0 {
            content.body = "Today is \(event.name)!"
            if let years = event.yearsSince, years > 0 {
                content.body += " (\(years) year\(years == 1 ? "" : "s"))"
            }
        } else {
            let daysText = event.notificationDaysBefore == 1 ? "tomorrow" : "in \(event.notificationDaysBefore) days"
            content.body = "\(event.name) is \(daysText)!"
        }
        
        content.sound = .default
        
        let components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: notificationDate)
        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        
        let request = UNNotificationRequest(identifier: "event-\(event.id.uuidString)", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }
    
    private func cancelNotification(for event: LifeEvent) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["event-\(event.id.uuidString)"])
    }
}

// MARK: - Events & Milestones View
struct EventsAndMilestonesView: View {
    @StateObject private var eventsManager = EventsManager()
    @State private var showingAddEvent = false
    @State private var selectedFilter: EventType?
    
    var filteredEvents: [LifeEvent] {
        if let filter = selectedFilter {
            return eventsManager.eventsByType(filter)
        }
        return eventsManager.upcomingEvents()
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Events & Milestones")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Spacer()
                
                Button(action: { showingAddEvent = true }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title3)
                        .foregroundColor(.accentColor)
                }
            }
            .padding()
            
            // Filter Tabs
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    FilterChip(title: "All", isSelected: selectedFilter == nil) {
                        selectedFilter = nil
                    }
                    
                    ForEach(EventType.allCases, id: \.self) { type in
                        FilterChip(
                            title: "\(type.icon) \(type.rawValue)",
                            isSelected: selectedFilter == type
                        ) {
                            selectedFilter = type
                        }
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical, 8)
            
            // Today's Events (if any)
            if !eventsManager.eventsToday().isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("🎉 Today!")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    ForEach(eventsManager.eventsToday()) { event in
                        TodayEventCard(event: event)
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
                .background(Color.accentColor.opacity(0.1))
            }
            
            // Events List
            ScrollView {
                LazyVStack(spacing: 16) {
                    if filteredEvents.isEmpty {
                        EmptyEventsView(filter: selectedFilter)
                    } else {
                        ForEach(filteredEvents) { event in
                            EventCard(event: event, eventsManager: eventsManager)
                        }
                    }
                }
                .padding()
            }
        }
        .sheet(isPresented: $showingAddEvent) {
            AddEventView(eventsManager: eventsManager)
        }
    }
}

// MARK: - Filter Chip
struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.accentColor : Color(.systemGray5))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
    }
}

// MARK: - Today Event Card
struct TodayEventCard: View {
    let event: LifeEvent
    
    var body: some View {
        HStack(spacing: 12) {
            Text(event.type.icon)
                .font(.system(size: 32))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(event.name)
                    .font(.headline)
                
                if let years = event.yearsSince, years > 0 {
                    Text("\(years) year\(years == 1 ? "" : "s")")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            
            Spacer()
            
            Text("TODAY")
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(event.type.color)
                .cornerRadius(8)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: event.type.color.opacity(0.3), radius: 4)
    }
}

// MARK: - Event Card
struct EventCard: View {
    let event: LifeEvent
    @ObservedObject var eventsManager: EventsManager
    @State private var showingDetails = false
    
    var body: some View {
        Button(action: { showingDetails = true }) {
            VStack(spacing: 12) {
                HStack {
                    // Icon
                    Text(event.type.icon)
                        .font(.system(size: 32))
                    
                    // Info
                    VStack(alignment: .leading, spacing: 4) {
                        Text(event.name)
                            .font(.headline)
                            .foregroundColor(.primary)
                        
                        Text(event.type.rawValue)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    // Countdown
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("\(event.daysUntil)")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(event.type.color)
                        
                        Text(event.daysUntil == 1 ? "day" : "days")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                // Date & Years
                HStack {
                    Text(event.nextOccurrence, style: .date)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    if let years = event.yearsSince, years > 0 {
                        Text("\(years) year\(years == 1 ? "" : "s")")
                            .font(.subheadline)
                            .foregroundColor(event.type.color)
                            .fontWeight(.medium)
                    }
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .sheet(isPresented: $showingDetails) {
            EventDetailView(event: event, eventsManager: eventsManager)
        }
    }
}

// MARK: - Empty Events View
struct EmptyEventsView: View {
    let filter: EventType?
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: filter == nil ? "calendar.badge.plus" : "calendar.badge.exclamationmark")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text(filter == nil ? "No events yet" : "No \(filter!.rawValue.lowercased())s")
                .font(.headline)
            
            Text("Add your first \(filter?.rawValue.lowercased() ?? "event") to start tracking!")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

// MARK: - Add Event View
struct AddEventView: View {
    @ObservedObject var eventsManager: EventsManager
    @Environment(\.dismiss) var dismiss
    
    @State private var name = ""
    @State private var date = Date()
    @State private var type: EventType = .birthday
    @State private var isRecurring = true
    @State private var notes = ""
    @State private var notificationEnabled = true
    @State private var notificationDaysBefore = 1
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Event Details")) {
                    TextField("Name", text: $name)
                    
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                    
                    Picker("Type", selection: $type) {
                        ForEach(EventType.allCases, id: \.self) { type in
                            HStack {
                                Text(type.icon)
                                Text(type.rawValue)
                            }
                            .tag(type)
                        }
                    }
                    
                    Toggle("Recurring (Annual)", isOn: $isRecurring)
                }
                
                Section(header: Text("Notes (Optional)")) {
                    TextEditor(text: $notes)
                        .frame(height: 80)
                }
                
                Section(header: Text("Reminder")) {
                    Toggle("Enable Notification", isOn: $notificationEnabled)
                    
                    if notificationEnabled {
                        Picker("Remind Me", selection: $notificationDaysBefore) {
                            Text("On the day").tag(0)
                            Text("1 day before").tag(1)
                            Text("2 days before").tag(2)
                            Text("3 days before").tag(3)
                            Text("1 week before").tag(7)
                        }
                    }
                }
            }
            .navigationTitle("New Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        let event = LifeEvent(
                            name: name,
                            date: date,
                            type: type,
                            isRecurring: isRecurring,
                            notes: notes.isEmpty ? nil : notes,
                            notificationEnabled: notificationEnabled,
                            notificationDaysBefore: notificationDaysBefore
                        )
                        eventsManager.addEvent(event)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

// MARK: - Event Detail View
struct EventDetailView: View {
    let event: LifeEvent
    @ObservedObject var eventsManager: EventsManager
    @Environment(\.dismiss) var dismiss
    @State private var showingEdit = false
    @State private var showingDeleteConfirmation = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Countdown
                    VStack(spacing: 8) {
                        Text(event.type.icon)
                            .font(.system(size: 64))
                        
                        Text("\(event.daysUntil)")
                            .font(.system(size: 72, weight: .bold))
                            .foregroundColor(event.type.color)
                        
                        Text(event.daysUntil == 0 ? "TODAY!" : event.daysUntil == 1 ? "day away" : "days away")
                            .font(.title3)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    
                    // Details
                    VStack(alignment: .leading, spacing: 16) {
                        EventDetailRow(label: "Name", value: event.name)
                        EventDetailRow(label: "Type", value: event.type.rawValue)
                        EventDetailRow(label: "Date", value: event.nextOccurrence.formatted(date: .long, time: .omitted))
                        
                        if event.isRecurring, let years = event.yearsSince, years > 0 {
                            EventDetailRow(label: "Years", value: "\(years) year\(years == 1 ? "" : "s")")
                        }
                        
                        EventDetailRow(label: "Recurring", value: event.isRecurring ? "Yes (Annual)" : "No")
                        
                        if let notes = event.notes, !notes.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Notes")
                                    .font(.headline)
                                    .foregroundColor(.secondary)
                                
                                Text(notes)
                                    .font(.body)
                            }
                        }
                        
                        if event.notificationEnabled {
                            let reminderText = event.notificationDaysBefore == 0 ? "On the day" :
                                             event.notificationDaysBefore == 1 ? "1 day before" :
                                             event.notificationDaysBefore == 7 ? "1 week before" :
                                             "\(event.notificationDaysBefore) days before"
                            EventDetailRow(label: "Reminder", value: reminderText)
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Actions
                    VStack(spacing: 12) {
                        Button(action: { showingEdit = true }) {
                            Label("Edit Event", systemImage: "pencil")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.accentColor)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                        }
                        
                        Button(role: .destructive, action: { showingDeleteConfirmation = true }) {
                            Label("Delete Event", systemImage: "trash")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red.opacity(0.1))
                                .foregroundColor(.red)
                                .cornerRadius(10)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle(event.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .sheet(isPresented: $showingEdit) {
            EditEventView(event: event, eventsManager: eventsManager)
        }
        .alert("Delete Event", isPresented: $showingDeleteConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                eventsManager.deleteEvent(event)
                dismiss()
            }
        } message: {
            Text("Are you sure you want to delete \(event.name)?")
        }
    }
}

struct EventDetailRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.headline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.body)
        }
    }
}

// MARK: - Edit Event View
struct EditEventView: View {
    let event: LifeEvent
    @ObservedObject var eventsManager: EventsManager
    @Environment(\.dismiss) var dismiss
    
    @State private var name = ""
    @State private var date = Date()
    @State private var type: EventType = .birthday
    @State private var isRecurring = true
    @State private var notes = ""
    @State private var notificationEnabled = true
    @State private var notificationDaysBefore = 1
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Event Details")) {
                    TextField("Name", text: $name)
                    
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                    
                    Picker("Type", selection: $type) {
                        ForEach(EventType.allCases, id: \.self) { type in
                            HStack {
                                Text(type.icon)
                                Text(type.rawValue)
                            }
                            .tag(type)
                        }
                    }
                    
                    Toggle("Recurring (Annual)", isOn: $isRecurring)
                }
                
                Section(header: Text("Notes (Optional)")) {
                    TextEditor(text: $notes)
                        .frame(height: 80)
                }
                
                Section(header: Text("Reminder")) {
                    Toggle("Enable Notification", isOn: $notificationEnabled)
                    
                    if notificationEnabled {
                        Picker("Remind Me", selection: $notificationDaysBefore) {
                            Text("On the day").tag(0)
                            Text("1 day before").tag(1)
                            Text("2 days before").tag(2)
                            Text("3 days before").tag(3)
                            Text("1 week before").tag(7)
                        }
                    }
                }
            }
            .navigationTitle("Edit Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        var updatedEvent = event
                        updatedEvent.name = name
                        updatedEvent.date = date
                        updatedEvent.type = type
                        updatedEvent.isRecurring = isRecurring
                        updatedEvent.notes = notes.isEmpty ? nil : notes
                        updatedEvent.notificationEnabled = notificationEnabled
                        updatedEvent.notificationDaysBefore = notificationDaysBefore
                        
                        eventsManager.updateEvent(updatedEvent)
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
        .onAppear {
            name = event.name
            date = event.date
            type = event.type
            isRecurring = event.isRecurring
            notes = event.notes ?? ""
            notificationEnabled = event.notificationEnabled
            notificationDaysBefore = event.notificationDaysBefore
        }
    }
}
