import SwiftUI
import EventKit

// MARK: - Calendar Provider
enum CalendarProvider: String, CaseIterable, Codable {
    case apple = "Apple Calendar"
    case google = "Google Calendar"
    case outlook = "Outlook Calendar"
    
    var icon: String {
        switch self {
        case .apple: return "calendar"
        case .google: return "g.circle.fill"
        case .outlook: return "envelope.circle.fill"
        }
    }
    
    var color: Color {
        switch self {
        case .apple: return .blue
        case .google: return .red
        case .outlook: return .cyan
        }
    }
}

// MARK: - Connected Calendar
struct ConnectedCalendar: Identifiable, Codable {
    let id: UUID
    var provider: CalendarProvider
    var calendarId: String
    var name: String
    var isEnabled: Bool
    var syncDirection: SyncDirection
    
    init(id: UUID = UUID(), provider: CalendarProvider, calendarId: String, name: String, isEnabled: Bool = true, syncDirection: SyncDirection = .twoWay) {
        self.id = id
        self.provider = provider
        self.calendarId = calendarId
        self.name = name
        self.isEnabled = isEnabled
        self.syncDirection = syncDirection
    }
}

enum SyncDirection: String, CaseIterable, Codable {
    case import = "Import Only"
    case export = "Export Only"
    case twoWay = "Two-Way Sync"
    
    var description: String {
        switch self {
        case .import: return "Import events from this calendar"
        case .export: return "Export tasks to this calendar"
        case .twoWay: return "Keep calendars in sync"
        }
    }
}

// MARK: - Multi Calendar Manager
class MultiCalendarManager: ObservableObject {
    @Published var connectedCalendars: [ConnectedCalendar] = []
    @Published var appleCalendars: [EKCalendar] = []
    @Published var isAuthorized = false
    @Published var lastSyncDate: Date?
    
    private let eventStore = EKEventStore()
    private let calendarsKey = "connected_calendars"
    private let lastSyncKey = "last_calendar_sync"
    
    init() {
        loadConnectedCalendars()
        checkAuthorization()
    }
    
    // MARK: - Authorization
    func checkAuthorization() {
        if #available(iOS 17.0, *) {
            isAuthorized = EKEventStore.authorizationStatus(for: .event) == .fullAccess
        } else {
            isAuthorized = EKEventStore.authorizationStatus(for: .event) == .authorized
        }
        
        if isAuthorized {
            fetchAppleCalendars()
        }
    }
    
    func requestAuthorization() async {
        if #available(iOS 17.0, *) {
            do {
                let granted = try await eventStore.requestFullAccessToEvents()
                await MainActor.run {
                    self.isAuthorized = granted
                    if granted {
                        self.fetchAppleCalendars()
                    }
                }
            } catch {
                await MainActor.run {
                    self.isAuthorized = false
                }
            }
        } else {
            eventStore.requestAccess(to: .event) { [weak self] granted, error in
                DispatchQueue.main.async {
                    self?.isAuthorized = granted
                    if granted {
                        self?.fetchAppleCalendars()
                    }
                }
            }
        }
    }
    
    // MARK: - Apple Calendar
    func fetchAppleCalendars() {
        appleCalendars = eventStore.calendars(for: .event).filter { $0.allowsContentModifications }
    }
    
    // MARK: - Data Management
    func loadConnectedCalendars() {
        if let data = UserDefaults.standard.data(forKey: calendarsKey),
           let decoded = try? JSONDecoder().decode([ConnectedCalendar].self, from: data) {
            connectedCalendars = decoded
        }
        
        if let syncDate = UserDefaults.standard.object(forKey: lastSyncKey) as? Date {
            lastSyncDate = syncDate
        }
    }
    
    func saveConnectedCalendars() {
        if let encoded = try? JSONEncoder().encode(connectedCalendars) {
            UserDefaults.standard.set(encoded, forKey: calendarsKey)
        }
    }
    
    func connectAppleCalendar(_ calendar: EKCalendar, syncDirection: SyncDirection) {
        let connected = ConnectedCalendar(
            provider: .apple,
            calendarId: calendar.calendarIdentifier,
            name: calendar.title,
            syncDirection: syncDirection
        )
        connectedCalendars.append(connected)
        saveConnectedCalendars()
    }
    
    func disconnectCalendar(_ calendar: ConnectedCalendar) {
        connectedCalendars.removeAll { $0.id == calendar.id }
        saveConnectedCalendars()
    }
    
    func toggleCalendar(_ calendar: ConnectedCalendar) {
        if let index = connectedCalendars.firstIndex(where: { $0.id == calendar.id }) {
            connectedCalendars[index].isEnabled.toggle()
            saveConnectedCalendars()
        }
    }
    
    func updateSyncDirection(_ calendar: ConnectedCalendar, direction: SyncDirection) {
        if let index = connectedCalendars.firstIndex(where: { $0.id == calendar.id }) {
            connectedCalendars[index].syncDirection = direction
            saveConnectedCalendars()
        }
    }
    
    // MARK: - Sync
    func syncAllCalendars() {
        // This would sync all enabled calendars
        lastSyncDate = Date()
        UserDefaults.standard.set(lastSyncDate, forKey: lastSyncKey)
    }
}

// MARK: - Calendar Integration View
struct CalendarIntegrationView: View {
    @StateObject private var calendarManager = MultiCalendarManager()
    @State private var showingAppleCalendarPicker = false
    @State private var showingGoogleInstructions = false
    @State private var showingOutlookInstructions = false
    
    var body: some View {
        NavigationView {
            List {
                // Authorization Section
                if !calendarManager.isAuthorized {
                    Section {
                        VStack(spacing: 12) {
                            Image(systemName: "calendar.badge.exclamationmark")
                                .font(.system(size: 50))
                                .foregroundColor(.orange)
                            
                            Text("Calendar Access Required")
                                .font(.headline)
                            
                            Text("Grant access to integrate your calendars with the app")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                            
                            Button("Grant Access") {
                                _Concurrency.Task {
                                    await calendarManager.requestAuthorization()
                                }
                            }
                            .buttonStyle(.borderedProminent)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                    }
                }
                
                // Connected Calendars
                if !calendarManager.connectedCalendars.isEmpty {
                    Section(header: Text("Connected Calendars")) {
                        ForEach(calendarManager.connectedCalendars) { calendar in
                            ConnectedCalendarRow(
                                calendar: calendar,
                                calendarManager: calendarManager
                            )
                        }
                    }
                }
                
                // Last Sync
                if let lastSync = calendarManager.lastSyncDate {
                    Section {
                        HStack {
                            Text("Last Sync")
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(lastSync, style: .relative)
                                .foregroundColor(.secondary)
                        }
                        
                        Button(action: { calendarManager.syncAllCalendars() }) {
                            HStack {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                Text("Sync Now")
                            }
                        }
                    }
                }
                
                // Add Calendar Options
                if calendarManager.isAuthorized {
                    Section(header: Text("Add Calendar")) {
                        Button(action: { showingAppleCalendarPicker = true }) {
                            HStack {
                                Image(systemName: CalendarProvider.apple.icon)
                                    .foregroundColor(CalendarProvider.apple.color)
                                Text(CalendarProvider.apple.rawValue)
                                Spacer()
                                Image(systemName: "plus.circle")
                            }
                        }
                        
                        Button(action: { showingGoogleInstructions = true }) {
                            HStack {
                                Image(systemName: CalendarProvider.google.icon)
                                    .foregroundColor(CalendarProvider.google.color)
                                Text(CalendarProvider.google.rawValue)
                                Spacer()
                                Image(systemName: "plus.circle")
                            }
                        }
                        
                        Button(action: { showingOutlookInstructions = true }) {
                            HStack {
                                Image(systemName: CalendarProvider.outlook.icon)
                                    .foregroundColor(CalendarProvider.outlook.color)
                                Text(CalendarProvider.outlook.rawValue)
                                Spacer()
                                Image(systemName: "plus.circle")
                            }
                        }
                    }
                }
                
                // Instructions
                Section(header: Text("How It Works")) {
                    VStack(alignment: .leading, spacing: 8) {
                        InstructionRow(
                            icon: "arrow.down.circle",
                            text: "Import Only: Bring events into the app"
                        )
                        InstructionRow(
                            icon: "arrow.up.circle",
                            text: "Export Only: Send tasks to calendar"
                        )
                        InstructionRow(
                            icon: "arrow.triangle.2.circlepath",
                            text: "Two-Way: Keep everything in sync"
                        )
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Calendar Integration")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showingAppleCalendarPicker) {
                AppleCalendarPickerView(calendarManager: calendarManager)
            }
            .sheet(isPresented: $showingGoogleInstructions) {
                GoogleCalendarInstructionsView()
            }
            .sheet(isPresented: $showingOutlookInstructions) {
                OutlookCalendarInstructionsView()
            }
        }
    }
}

// MARK: - Connected Calendar Row
struct ConnectedCalendarRow: View {
    let calendar: ConnectedCalendar
    @ObservedObject var calendarManager: MultiCalendarManager
    @State private var showingOptions = false
    
    var body: some View {
        HStack {
            Image(systemName: calendar.provider.icon)
                .foregroundColor(calendar.provider.color)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(calendar.name)
                    .font(.headline)
                
                Text(calendar.syncDirection.rawValue)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Toggle("", isOn: Binding(
                get: { calendar.isEnabled },
                set: { _ in calendarManager.toggleCalendar(calendar) }
            ))
            
            Button(action: { showingOptions = true }) {
                Image(systemName: "ellipsis.circle")
                    .foregroundColor(.gray)
            }
        }
        .sheet(isPresented: $showingOptions) {
            CalendarOptionsView(calendar: calendar, calendarManager: calendarManager)
        }
    }
}

// MARK: - Calendar Options View
struct CalendarOptionsView: View {
    let calendar: ConnectedCalendar
    @ObservedObject var calendarManager: MultiCalendarManager
    @Environment(\.dismiss) var dismiss
    @State private var selectedDirection: SyncDirection
    
    init(calendar: ConnectedCalendar, calendarManager: MultiCalendarManager) {
        self.calendar = calendar
        self.calendarManager = calendarManager
        _selectedDirection = State(initialValue: calendar.syncDirection)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Calendar Info")) {
                    HStack {
                        Text("Name")
                        Spacer()
                        Text(calendar.name)
                            .foregroundColor(.secondary)
                    }
                    
                    HStack {
                        Text("Provider")
                        Spacer()
                        Label(calendar.provider.rawValue, systemImage: calendar.provider.icon)
                            .foregroundColor(calendar.provider.color)
                    }
                }
                
                Section(header: Text("Sync Direction")) {
                    ForEach(SyncDirection.allCases, id: \.self) { direction in
                        Button(action: { selectedDirection = direction }) {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(direction.rawValue)
                                        .foregroundColor(.primary)
                                    Text(direction.description)
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                if selectedDirection == direction {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.accentColor)
                                }
                            }
                        }
                    }
                }
                
                Section {
                    Button(role: .destructive, action: {
                        calendarManager.disconnectCalendar(calendar)
                        dismiss()
                    }) {
                        Label("Disconnect Calendar", systemImage: "trash")
                    }
                }
            }
            .navigationTitle("Calendar Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        calendarManager.updateSyncDirection(calendar, direction: selectedDirection)
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Apple Calendar Picker
struct AppleCalendarPickerView: View {
    @ObservedObject var calendarManager: MultiCalendarManager
    @Environment(\.dismiss) var dismiss
    @State private var selectedCalendar: EKCalendar?
    @State private var syncDirection: SyncDirection = .twoWay
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Select Calendar")) {
                    ForEach(calendarManager.appleCalendars, id: \.calendarIdentifier) { calendar in
                        Button(action: { selectedCalendar = calendar }) {
                            HStack {
                                Circle()
                                    .fill(Color(calendar.cgColor))
                                    .frame(width: 12, height: 12)
                                
                                Text(calendar.title)
                                    .foregroundColor(.primary)
                                
                                Spacer()
                                
                                if selectedCalendar?.calendarIdentifier == calendar.calendarIdentifier {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.accentColor)
                                }
                            }
                        }
                    }
                }
                
                Section(header: Text("Sync Direction")) {
                    Picker("Direction", selection: $syncDirection) {
                        ForEach(SyncDirection.allCases, id: \.self) { direction in
                            Text(direction.rawValue).tag(direction)
                        }
                    }
                    .pickerStyle(.inline)
                }
            }
            .navigationTitle("Add Apple Calendar")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Connect") {
                        if let calendar = selectedCalendar {
                            calendarManager.connectAppleCalendar(calendar, syncDirection: syncDirection)
                            dismiss()
                        }
                    }
                    .disabled(selectedCalendar == nil)
                }
            }
        }
    }
}

// MARK: - Google Calendar Instructions
struct GoogleCalendarInstructionsView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(spacing: 12) {
                        Image(systemName: "g.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.red)
                        
                        Text("Connect Google Calendar")
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    
                    InstructionStep(
                        number: 1,
                        title: "Add to Apple Calendar",
                        description: "Open iPhone Settings → Calendar → Accounts → Add Account → Google"
                    )
                    
                    InstructionStep(
                        number: 2,
                        title: "Sign In",
                        description: "Enter your Google email and password to connect your account"
                    )
                    
                    InstructionStep(
                        number: 3,
                        title: "Enable Calendar Sync",
                        description: "Toggle on 'Calendars' in the account settings"
                    )
                    
                    InstructionStep(
                        number: 4,
                        title: "Return to App",
                        description: "Come back here and select your Google calendar from the Apple Calendar list"
                    )
                    
                    Text("💡 Tip: Your Google calendars will appear in the Apple Calendar list once synced with iOS.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                }
                .padding()
            }
            .navigationTitle("Google Calendar Setup")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Outlook Calendar Instructions
struct OutlookCalendarInstructionsView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(spacing: 12) {
                        Image(systemName: "envelope.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.cyan)
                        
                        Text("Connect Outlook Calendar")
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    
                    InstructionStep(
                        number: 1,
                        title: "Add to Apple Calendar",
                        description: "Open iPhone Settings → Calendar → Accounts → Add Account → Exchange or Outlook.com"
                    )
                    
                    InstructionStep(
                        number: 2,
                        title: "Enter Credentials",
                        description: "Sign in with your Microsoft/Outlook email and password"
                    )
                    
                    InstructionStep(
                        number: 3,
                        title: "Enable Calendar Sync",
                        description: "Make sure 'Calendars' is toggled on in account settings"
                    )
                    
                    InstructionStep(
                        number: 4,
                        title: "Return to App",
                        description: "Your Outlook calendars will now appear in the Apple Calendar list"
                    )
                    
                    Text("💡 Tip: Both personal Outlook.com and work Microsoft 365 calendars are supported.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                }
                .padding()
            }
            .navigationTitle("Outlook Calendar Setup")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Helper Views
struct InstructionRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.accentColor)
                .frame(width: 24)
            
            Text(text)
                .font(.subheadline)
        }
    }
}

struct InstructionStep: View {
    let number: Int
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.accentColor)
                    .frame(width: 32, height: 32)
                
                Text("\(number)")
                    .font(.headline)
                    .foregroundColor(.white)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
}
