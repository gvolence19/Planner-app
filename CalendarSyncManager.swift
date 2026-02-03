import SwiftUI
import EventKit

// MARK: - Calendar Sync Manager
class CalendarSyncManager: NSObject, ObservableObject {
    private let eventStore = EKEventStore()
    
    @Published var isAuthorized = false
    @Published var calendars: [EKCalendar] = []
    @Published var selectedCalendar: EKCalendar?
    @Published var syncEnabled = false
    @Published var lastSyncDate: Date?
    @Published var errorMessage: String?
    
    // Sync statistics
    @Published var syncStats = SyncStats()
    
    override init() {
        super.init()
        loadSyncSettings()
        requestCalendarAccess()
    }
    
    // MARK: - Authorization
    func requestCalendarAccess() {
        eventStore.requestAccess(to: .event) { [weak self] granted, error in
            DispatchQueue.main.async {
                self?.isAuthorized = granted
                if granted {
                    self?.fetchCalendars()
                } else if let error = error {
                    self?.errorMessage = "Calendar access denied: \(error.localizedDescription)"
                }
            }
        }
    }
    
    // MARK: - Fetch Calendars
    func fetchCalendars() {
        guard isAuthorized else { return }
        
        calendars = eventStore.calendars(for: .event).filter { calendar in
            calendar.allowsContentModifications
        }
        
        // Set default calendar if none selected
        if selectedCalendar == nil {
            selectedCalendar = eventStore.defaultCalendarForNewEvents
        }
    }
    
    // MARK: - Sync Task to Calendar
    func syncTaskToCalendar(_ task: Task) {
        guard isAuthorized,
              let calendar = selectedCalendar,
              syncEnabled else { return }
        
        // Check if event already exists
        if let existingEventId = getEventId(for: task.id),
           let existingEvent = eventStore.event(withIdentifier: existingEventId) {
            updateEvent(existingEvent, with: task)
        } else {
            createEvent(for: task, in: calendar)
        }
    }
    
    private func createEvent(for task: Task, in calendar: EKCalendar) {
        let event = EKEvent(eventStore: eventStore)
        event.calendar = calendar
        event.title = task.title
        event.notes = task.description
        
        // Set dates
        if let dueDate = task.dueDate {
            event.startDate = dueDate
            
            if let duration = task.duration, let minutes = Int(duration) {
                event.endDate = dueDate.addingTimeInterval(TimeInterval(minutes * 60))
            } else {
                event.endDate = dueDate.addingTimeInterval(3600) // 1 hour default
            }
        } else {
            event.startDate = Date()
            event.endDate = Date().addingTimeInterval(3600)
        }
        
        // Set location
        if let location = task.location {
            event.location = location
        }
        
        // Add alarm based on priority
        let alarm: EKAlarm
        switch task.priority {
        case .high:
            alarm = EKAlarm(relativeOffset: -3600) // 1 hour before
        case .medium:
            alarm = EKAlarm(relativeOffset: -1800) // 30 minutes before
        case .low:
            alarm = EKAlarm(relativeOffset: -600) // 10 minutes before
        }
        event.addAlarm(alarm)
        
        // Save event
        do {
            try eventStore.save(event, span: .thisEvent)
            saveEventId(event.eventIdentifier, for: task.id)
            
            DispatchQueue.main.async {
                self.syncStats.tasksSynced += 1
                self.lastSyncDate = Date()
                self.saveSyncSettings()
            }
        } catch {
            DispatchQueue.main.async {
                self.errorMessage = "Failed to create calendar event: \(error.localizedDescription)"
                self.syncStats.syncErrors += 1
            }
        }
    }
    
    private func updateEvent(_ event: EKEvent, with task: Task) {
        event.title = task.title
        event.notes = task.description
        
        if let dueDate = task.dueDate {
            event.startDate = dueDate
            
            if let duration = task.duration, let minutes = Int(duration) {
                event.endDate = dueDate.addingTimeInterval(TimeInterval(minutes * 60))
            }
        }
        
        if let location = task.location {
            event.location = location
        }
        
        do {
            try eventStore.save(event, span: .thisEvent)
            
            DispatchQueue.main.async {
                self.lastSyncDate = Date()
                self.saveSyncSettings()
            }
        } catch {
            DispatchQueue.main.async {
                self.errorMessage = "Failed to update calendar event: \(error.localizedDescription)"
                self.syncStats.syncErrors += 1
            }
        }
    }
    
    // MARK: - Delete Event
    func deleteEventForTask(_ taskId: UUID) {
        guard let eventId = getEventId(for: taskId),
              let event = eventStore.event(withIdentifier: eventId) else { return }
        
        do {
            try eventStore.remove(event, span: .thisEvent)
            removeEventId(for: taskId)
        } catch {
            errorMessage = "Failed to delete calendar event: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Sync Calendar Events to Tasks
    func syncCalendarEventsToTasks() -> [Task] {
        guard isAuthorized, let calendar = selectedCalendar else { return [] }
        
        var tasks: [Task] = []
        
        // Fetch events for the next 30 days
        let startDate = Date()
        let endDate = Calendar.current.date(byAdding: .day, value: 30, to: startDate) ?? startDate
        
        let predicate = eventStore.predicateForEvents(withStart: startDate, end: endDate, calendars: [calendar])
        let events = eventStore.events(matching: predicate)
        
        for event in events {
            // Skip if already synced
            if isEventSynced(event.eventIdentifier) { continue }
            
            let task = Task(
                title: event.title ?? "Untitled Event",
                description: event.notes,
                dueDate: event.startDate,
                priority: .medium,
                location: event.location,
                duration: String(Int(event.endDate.timeIntervalSince(event.startDate) / 60))
            )
            
            tasks.append(task)
            
            DispatchQueue.main.async {
                self.syncStats.eventsImported += 1
            }
        }
        
        DispatchQueue.main.async {
            self.lastSyncDate = Date()
            self.saveSyncSettings()
        }
        
        return tasks
    }
    
    // MARK: - Two-Way Sync
    func performTwoWaySync(with tasks: [Task]) {
        guard syncEnabled else { return }
        
        // Sync tasks to calendar
        for task in tasks {
            if let dueDate = task.dueDate, dueDate > Date() {
                syncTaskToCalendar(task)
            }
        }
        
        // Import new calendar events
        let importedTasks = syncCalendarEventsToTasks()
        
        // Notify about imported tasks
        if !importedTasks.isEmpty {
            DispatchQueue.main.async {
                self.syncStats.lastImportCount = importedTasks.count
            }
        }
    }
    
    // MARK: - Persistence
    private func saveEventId(_ eventId: String, for taskId: UUID) {
        var mapping = getEventMapping()
        mapping[taskId.uuidString] = eventId
        UserDefaults.standard.set(mapping, forKey: "calendar_event_mapping")
    }
    
    private func getEventId(for taskId: UUID) -> String? {
        let mapping = getEventMapping()
        return mapping[taskId.uuidString]
    }
    
    private func removeEventId(for taskId: UUID) {
        var mapping = getEventMapping()
        mapping.removeValue(forKey: taskId.uuidString)
        UserDefaults.standard.set(mapping, forKey: "calendar_event_mapping")
    }
    
    private func getEventMapping() -> [String: String] {
        return UserDefaults.standard.dictionary(forKey: "calendar_event_mapping") as? [String: String] ?? [:]
    }
    
    private func isEventSynced(_ eventId: String) -> Bool {
        let mapping = getEventMapping()
        return mapping.values.contains(eventId)
    }
    
    private func saveSyncSettings() {
        UserDefaults.standard.set(syncEnabled, forKey: "calendar_sync_enabled")
        UserDefaults.standard.set(selectedCalendar?.calendarIdentifier, forKey: "selected_calendar_id")
        UserDefaults.standard.set(lastSyncDate, forKey: "last_sync_date")
        
        if let encoded = try? JSONEncoder().encode(syncStats) {
            UserDefaults.standard.set(encoded, forKey: "sync_stats")
        }
    }
    
    private func loadSyncSettings() {
        syncEnabled = UserDefaults.standard.bool(forKey: "calendar_sync_enabled")
        lastSyncDate = UserDefaults.standard.object(forKey: "last_sync_date") as? Date
        
        if let statsData = UserDefaults.standard.data(forKey: "sync_stats"),
           let decoded = try? JSONDecoder().decode(SyncStats.self, from: statsData) {
            syncStats = decoded
        }
    }
}

// MARK: - Sync Statistics
struct SyncStats: Codable {
    var tasksSynced: Int = 0
    var eventsImported: Int = 0
    var syncErrors: Int = 0
    var lastImportCount: Int = 0
}

// MARK: - Calendar Settings View
struct CalendarSettingsView: View {
    @StateObject private var syncManager = CalendarSyncManager()
    @StateObject private var dataManager = DataManager.shared
    @Environment(\.dismiss) var dismiss
    @State private var showingSyncConfirmation = false
    
    var body: some View {
        NavigationView {
            Form {
                // Authorization Status
                Section(header: Text("Calendar Access")) {
                    HStack {
                        Image(systemName: syncManager.isAuthorized ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundColor(syncManager.isAuthorized ? .green : .red)
                        
                        Text(syncManager.isAuthorized ? "Authorized" : "Not Authorized")
                        
                        Spacer()
                        
                        if !syncManager.isAuthorized {
                            Button("Request Access") {
                                syncManager.requestCalendarAccess()
                            }
                        }
                    }
                }
                
                if syncManager.isAuthorized {
                    // Sync Toggle
                    Section(header: Text("Sync Settings")) {
                        Toggle("Enable Calendar Sync", isOn: $syncManager.syncEnabled)
                            .onChange(of: syncManager.syncEnabled) { _, newValue in
                                if newValue {
                                    showingSyncConfirmation = true
                                }
                            }
                        
                        if syncManager.syncEnabled {
                            Picker("Calendar", selection: $syncManager.selectedCalendar) {
                                ForEach(syncManager.calendars, id: \.calendarIdentifier) { calendar in
                                    HStack {
                                        Circle()
                                            .fill(Color(cgColor: calendar.cgColor))
                                            .frame(width: 12, height: 12)
                                        Text(calendar.title)
                                    }
                                    .tag(calendar as EKCalendar?)
                                }
                            }
                        }
                    }
                    
                    // Sync Statistics
                    if syncManager.syncEnabled {
                        Section(header: Text("Sync Statistics")) {
                            HStack {
                                Label("Tasks Synced", systemImage: "arrow.triangle.2.circlepath")
                                Spacer()
                                Text("\(syncManager.syncStats.tasksSynced)")
                                    .foregroundColor(.secondary)
                            }
                            
                            HStack {
                                Label("Events Imported", systemImage: "arrow.down.circle")
                                Spacer()
                                Text("\(syncManager.syncStats.eventsImported)")
                                    .foregroundColor(.secondary)
                            }
                            
                            if syncManager.syncStats.syncErrors > 0 {
                                HStack {
                                    Label("Errors", systemImage: "exclamationmark.triangle")
                                    Spacer()
                                    Text("\(syncManager.syncStats.syncErrors)")
                                        .foregroundColor(.red)
                                }
                            }
                            
                            if let lastSync = syncManager.lastSyncDate {
                                HStack {
                                    Label("Last Sync", systemImage: "clock")
                                    Spacer()
                                    Text(formatDate(lastSync))
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        
                        // Manual Sync
                        Section {
                            Button(action: performManualSync) {
                                HStack {
                                    Image(systemName: "arrow.triangle.2.circlepath")
                                    Text("Sync Now")
                                }
                                .frame(maxWidth: .infinity)
                            }
                        }
                    }
                    
                    // How It Works
                    Section(header: Text("How It Works")) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("• Tasks with due dates are synced to your calendar")
                            Text("• Calendar events can be imported as tasks")
                            Text("• Changes sync automatically when enabled")
                            Text("• Reminders are set based on priority")
                        }
                        .font(.caption)
                        .foregroundColor(.secondary)
                    }
                }
            }
            .navigationTitle("Calendar Sync")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("Enable Calendar Sync?", isPresented: $showingSyncConfirmation) {
                Button("Cancel", role: .cancel) {
                    syncManager.syncEnabled = false
                }
                Button("Enable") {
                    performInitialSync()
                }
            } message: {
                Text("This will sync all your tasks with due dates to your selected calendar. Continue?")
            }
            .alert("Sync Error", isPresented: .constant(syncManager.errorMessage != nil)) {
                Button("OK") { syncManager.errorMessage = nil }
            } message: {
                if let error = syncManager.errorMessage {
                    Text(error)
                }
            }
        }
    }
    
    private func performInitialSync() {
        syncManager.performTwoWaySync(with: dataManager.tasks)
    }
    
    private func performManualSync() {
        syncManager.performTwoWaySync(with: dataManager.tasks)
        
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Preview
struct CalendarSettingsView_Previews: PreviewProvider {
    static var previews: some View {
        CalendarSettingsView()
    }
}
