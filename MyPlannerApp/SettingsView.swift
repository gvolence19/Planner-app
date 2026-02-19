import SwiftUI

struct SettingsView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    @EnvironmentObject var themeManager: ThemeManager
    @State private var showingCategoryManager = false
    @State private var showingAbout = false
    @State private var notificationsEnabled = true
    @AppStorage("isDarkMode") private var isDarkMode = false
    
    var body: some View {
        NavigationView {
            List {
                // Premium Section
                Section {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(dataManager.isPremium ? "Premium Plan" : "Free Plan")
                                .font(.headline)
                            Text(dataManager.isPremium ? "All features unlocked" : "Upgrade to unlock all features")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        if !dataManager.isPremium {
                            Button("Upgrade") {
                                upgradetoPremium()
                            }
                            .buttonStyle(.borderedProminent)
                        } else {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(.green)
                                .font(.title2)
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                // Premium Features
                if dataManager.isPremium {
                    Section(header: Text("Premium Features")) {
                        // TODO: Add WidgetGalleryView.swift to Xcode project first
                        // NavigationLink {
                        //     WidgetGalleryView()
                        // } label: {
                        //     Label("Home Screen Widgets", systemImage: "square.grid.2x2.fill")
                        // }
                        
                        NavigationLink {
                            CalendarIntegrationView()
                        } label: {
                            Label("Calendar Integration", systemImage: "calendar.badge.clock")
                        }
                    }
                    
                    // Calendar Sync Section
                    if CalendarSyncManager().syncEnabled {
                        Section(header: Text("Calendar Sync"), footer: syncFooter) {
                            CalendarSyncStatusRow()
                        }
                    }
                } else {
                    Section(header: Text("Premium Features"), footer: Text("Upgrade to Premium to unlock these features")) {
                        // TODO: Add WidgetGalleryView.swift to Xcode project first
                        // HStack {
                        //     Label("Home Screen Widgets", systemImage: "square.grid.2x2.fill")
                        //     Spacer()
                        //     Image(systemName: "lock.fill")
                        //         .foregroundColor(.secondary)
                        // }
                        // .foregroundColor(.secondary)
                        
                        HStack {
                            Label("Calendar Integration", systemImage: "calendar.badge.clock")
                            Spacer()
                            Image(systemName: "lock.fill")
                                .foregroundColor(.secondary)
                        }
                        .foregroundColor(.secondary)
                    }
                }
                
                // App Settings
                Section(header: Text("Preferences")) {
                    // Appearance Picker
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Appearance", systemImage: isDarkMode ? "moon.fill" : "sun.max.fill")
                            .font(.subheadline)
                        
                        Picker("Appearance", selection: $isDarkMode) {
                            Text("☀️ Light").tag(false)
                            Text("🌙 Dark").tag(true)
                        }
                        .pickerStyle(.segmented)
                    }
                    .padding(.vertical, 4)
                    
                    NavigationLink {
                        ThemeSelectorView()
                    } label: {
                        HStack {
                            Label("Color Theme", systemImage: "paintpalette")
                            Spacer()
                            Text(themeManager.currentTheme.emoji)
                            Text(themeManager.currentTheme.name)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Toggle("Notifications", isOn: $notificationsEnabled)
                    
                    NavigationLink {
                        SleepNotificationsView()
                            .environmentObject(themeManager)
                    } label: {
                        Label("Sleep Notifications & Alarm", systemImage: "moon.zzz.fill")
                    }
                    
                    NavigationLink {
                        CategoryManagerView()
                    } label: {
                        Label("Manage Categories", systemImage: "tag")
                    }
                }
                
                // Data Management
                Section(header: Text("Data")) {
                    Button(action: exportData) {
                        Label("Export Data", systemImage: "square.and.arrow.up")
                    }
                    
                    Button(action: importData) {
                        Label("Import Data", systemImage: "square.and.arrow.down")
                    }
                    
                    Button(role: .destructive, action: clearAllData) {
                        Label("Clear All Data", systemImage: "trash")
                    }
                }
                
                // Siri Shortcuts
                if #available(iOS 16.0, *) {
                    Section(header: Text("Siri & Shortcuts")) {
                        NavigationLink {
                            SiriTipsView()
                        } label: {
                            Label("Siri Commands", systemImage: "waveform")
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Voice Commands Available")
                                .font(.subheadline)
                            Text("\"Add a task in Plannio\"")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .italic()
                        }
                        .padding(.vertical, 4)
                    }
                }
                
                // About
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    Button(action: { showingAbout = true }) {
                        Label("About Planner", systemImage: "info.circle")
                    }
                    
                    Link(destination: URL(string: "https://example.com/privacy")!) {
                        Label("Privacy Policy", systemImage: "hand.raised")
                    }
                    
                    Link(destination: URL(string: "https://example.com/terms")!) {
                        Label("Terms of Service", systemImage: "doc.text")
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .sheet(isPresented: $showingAbout) {
            AboutView()
        }
    }
    
    private func upgradetoPremium() {
        // In a real app, this would trigger an in-app purchase
        dataManager.isPremium = true
        dataManager.savePremiumStatus()
    }
    
    private func exportData() {
        // Export functionality
        print("Exporting data...")
    }
    
    private func importData() {
        // Import functionality
        print("Importing data...")
    }
    
    private func clearAllData() {
        dataManager.tasks.removeAll()
        dataManager.groceryItems.removeAll()
        dataManager.saveTasks()
        dataManager.saveGroceryItems()
    }
}

// MARK: - Category Manager View
struct CategoryManagerView: View {
    @StateObject private var dataManager = DataManager.shared
    @State private var showingAddCategory = false
    
    var body: some View {
        List {
            ForEach(dataManager.categories) { category in
                HStack {
                    Text(category.icon)
                        .font(.title2)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(category.name)
                            .font(.headline)
                        
                        Text("\(tasksCount(for: category)) tasks")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Circle()
                        .fill(category.swiftUIColor)
                        .frame(width: 20, height: 20)
                }
                .padding(.vertical, 4)
            }
            .onDelete(perform: deleteCategories)
        }
        .navigationTitle("Categories")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: { showingAddCategory = true }) {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showingAddCategory) {
            AddCategorySheet(isPresented: $showingAddCategory)
        }
    }
    
    private func tasksCount(for category: TaskCategory) -> Int {
        dataManager.tasks.filter { $0.category == category.name }.count
    }
    
    private func deleteCategories(at offsets: IndexSet) {
        for index in offsets {
            let category = dataManager.categories[index]
            dataManager.deleteCategory(category)
        }
    }
}

// MARK: - Add Category Sheet
struct AddCategorySheet: View {
    @Binding var isPresented: Bool
    @StateObject private var dataManager = DataManager.shared
    
    @State private var name = ""
    @State private var icon = "📝"
    @State private var selectedColor = "bg-blue-500"
    
    private let availableIcons = ["📝", "💼", "🏠", "🛒", "🏥", "📚", "✈️", "💰", "💪", "👥", "🎮", "🎨", "🎵", "🍔", "⚽️", "🚗"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Category Details")) {
                    TextField("Category name", text: $name)
                }
                
                Section(header: Text("Icon")) {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 8), spacing: 12) {
                        ForEach(availableIcons, id: \.self) { emoji in
                            Button(action: { icon = emoji }) {
                                Text(emoji)
                                    .font(.title2)
                                    .padding(8)
                                    .background(icon == emoji ? Color.accentColor.opacity(0.2) : Color.clear)
                                    .cornerRadius(8)
                            }
                        }
                    }
                }
                
                Section(header: Text("Color")) {
                    Text("Color selection coming soon")
                        .foregroundColor(.secondary)
                }
            }
            .navigationTitle("New Category")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { isPresented = false }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        addCategory()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
    
    private func addCategory() {
        let category = TaskCategory(name: name, color: selectedColor, icon: icon)
        dataManager.addCategory(category)
        isPresented = false
    }
}

// MARK: - About View
struct AboutView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.accentColor)
                    
                    Text("Plannio")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Version 1.0.0")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Divider()
                        .padding(.horizontal, 40)
                    
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Features")
                            .font(.headline)
                        
                        featureRow(icon: "checkmark.circle", title: "Task Management", description: "Organize your tasks with categories, priorities, and due dates")
                        
                        featureRow(icon: "calendar", title: "Calendar View", description: "Visualize your tasks in a beautiful calendar interface")
                        
                        featureRow(icon: "cart", title: "Grocery Lists", description: "Keep track of your shopping needs")
                        
                        featureRow(icon: "fork.knife", title: "Meal Planning", description: "Plan your meals with reminders (Premium)")
                        
                        featureRow(icon: "moon.zzz", title: "Sleep Tracking", description: "Maintain healthy sleep habits (Premium)")
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, 32)
            }
            .navigationTitle("About")
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
    
    private func featureRow(icon: String, title: String, description: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.accentColor)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private var syncFooter: some View {
        Text("Calendar syncs automatically every 5 minutes. Tap 'Sync Now' for immediate sync.")
    }
}

// MARK: - Calendar Sync Status Row
struct CalendarSyncStatusRow: View {
    @StateObject private var syncManager = CalendarSyncManager()
    @EnvironmentObject var themeManager: ThemeManager
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    
    var body: some View {
        VStack(spacing: 12) {
            // Last Sync Info
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Last Sync")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    if let lastSync = syncManager.lastSyncDate {
                        Text(timeAgoString(from: lastSync))
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.primary)
                    } else {
                        Text("Never")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                // Sync Stats
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Tasks Synced")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Text("\(syncManager.syncStats.lastSyncedCount)")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(theme.primaryColor.color)
                }
            }
            
            // Manual Sync Button
            Button(action: {
                syncManager.manualSync()
            }) {
                HStack(spacing: 8) {
                    if syncManager.isSyncing {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(0.8)
                    } else {
                        Image(systemName: "arrow.triangle.2.circlepath")
                            .font(.system(size: 16, weight: .semibold))
                    }
                    
                    Text(syncManager.isSyncing ? "Syncing..." : "Sync Now")
                        .font(.system(size: 16, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    LinearGradient(
                        colors: syncManager.isSyncing 
                            ? [Color.gray, Color.gray.opacity(0.8)]
                            : [theme.primaryColor.color, theme.secondaryColor.color],
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                )
                .cornerRadius(10)
            }
            .disabled(syncManager.isSyncing)
            
            // Auto-sync indicator
            HStack(spacing: 6) {
                Circle()
                    .fill(Color.green)
                    .frame(width: 8, height: 8)
                
                Text("Auto-sync every 5 minutes")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
            }
        }
    }
    
    private func timeAgoString(from date: Date) -> String {
        let now = Date()
        let seconds = Int(now.timeIntervalSince(date))
        
        if seconds < 60 {
            return "Just now"
        } else if seconds < 3600 {
            let minutes = seconds / 60
            return "\(minutes) minute\(minutes == 1 ? "" : "s") ago"
        } else if seconds < 86400 {
            let hours = seconds / 3600
            return "\(hours) hour\(hours == 1 ? "" : "s") ago"
        } else {
            let days = seconds / 86400
            return "\(days) day\(days == 1 ? "" : "s") ago"
        }
    }
}

// MARK: - Preview
struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(ThemeManager.shared)
    }
}
