import SwiftUI

// MARK: - Meals View
struct MealsView: View {
    @StateObject private var dataManager = DataManager.shared
    @State private var selectedMealType: MealType = .breakfast
    @State private var showingAddMeal = false
    
    enum MealType: String, CaseIterable {
        case breakfast = "Breakfast"
        case lunch = "Lunch"
        case dinner = "Dinner"
        case snack = "Snack"
        
        var icon: String {
            switch self {
            case .breakfast: return "☕️"
            case .lunch: return "🥗"
            case .dinner: return "🍽"
            case .snack: return "🍎"
            }
        }
        
        var defaultTime: String {
            switch self {
            case .breakfast: return "08:00"
            case .lunch: return "12:00"
            case .dinner: return "18:00"
            case .snack: return "15:00"
            }
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Meal Planning")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Spacer()
                
                Button(action: { showingAddMeal = true }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.accentColor)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .shadow(color: Color.black.opacity(0.05), radius: 2, y: 2)
            
            // Meal Type Selector
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(MealType.allCases, id: \.self) { type in
                        mealTypeButton(for: type)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 12)
            }
            .background(Color(.systemGroupedBackground))
            
            // Meal Tasks
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(mealTasks) { task in
                        TaskRowView(task: task)
                    }
                }
                .padding()
            }
        }
        .sheet(isPresented: $showingAddMeal) {
            AddMealReminderSheet(mealType: selectedMealType, isPresented: $showingAddMeal)
        }
    }
    
    private func mealTypeButton(for type: MealType) -> some View {
        Button(action: { selectedMealType = type }) {
            HStack(spacing: 8) {
                Text(type.icon)
                Text(type.rawValue)
            }
            .font(.system(size: 14, weight: selectedMealType == type ? .semibold : .regular))
            .foregroundColor(selectedMealType == type ? .white : .primary)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(selectedMealType == type ? Color.accentColor : Color(.systemGray6))
            .cornerRadius(20)
        }
    }
    
    private var mealTasks: [Task] {
        dataManager.tasks.filter { task in
            task.category == "Meals" || task.title.lowercased().contains(selectedMealType.rawValue.lowercased())
        }
    }
}

// MARK: - Add Meal Reminder Sheet
struct AddMealReminderSheet: View {
    let mealType: MealsView.MealType
    @Binding var isPresented: Bool
    @StateObject private var dataManager = DataManager.shared
    
    @State private var mealName = ""
    @State private var time: String
    @State private var recurring: RecurringOption = .daily
    @State private var notes = ""
    
    init(mealType: MealsView.MealType, isPresented: Binding<Bool>) {
        self.mealType = mealType
        self._isPresented = isPresented
        _time = State(initialValue: mealType.defaultTime)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Meal Details")) {
                    TextField("Meal name", text: $mealName)
                    TextField("Time (HH:MM)", text: $time)
                        .keyboardType(.numbersAndPunctuation)
                }
                
                Section(header: Text("Recurring")) {
                    Picker("Repeat", selection: $recurring) {
                        ForEach(RecurringOption.allCases, id: \.self) { option in
                            Text(option.displayName).tag(option)
                        }
                    }
                }
                
                Section(header: Text("Notes")) {
                    TextEditor(text: $notes)
                        .frame(minHeight: 60)
                }
            }
            .navigationTitle("Add \(mealType.rawValue) Reminder")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { isPresented = false }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") { addMealReminder() }
                        .disabled(mealName.isEmpty)
                }
            }
        }
    }
    
    private func addMealReminder() {
        let task = Task(
            title: "\(mealType.icon) \(mealName)",
            description: notes.isEmpty ? nil : notes,
            category: "Meals",
            priority: .medium,
            recurring: recurring,
            startTime: time
        )
        
        dataManager.addTask(task)
        isPresented = false
    }
}

// MARK: - Sleep View
struct SleepView: View {
    @StateObject private var dataManager = DataManager.shared
    @State private var bedtime = "22:00"
    @State private var wakeTime = "07:00"
    @State private var showingEditSleep = false
    
    var body: some View {
        VStack(spacing: 20) {
            // Header
            HStack {
                Text("Sleep Tracking")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Spacer()
                
                Button(action: { showingEditSleep = true }) {
                    Image(systemName: "gearshape")
                        .font(.system(size: 20))
                        .foregroundColor(.accentColor)
                }
            }
            .padding()
            .background(Color(.systemBackground))
            .shadow(color: Color.black.opacity(0.05), radius: 2, y: 2)
            
            ScrollView {
                VStack(spacing: 24) {
                    // Sleep Schedule Card
                    VStack(spacing: 16) {
                        Image(systemName: "moon.zzz.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.indigo)
                        
                        Text("Sleep Schedule")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        HStack(spacing: 40) {
                            VStack(spacing: 8) {
                                Text("🌙 Bedtime")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Text(bedtime)
                                    .font(.title2)
                                    .fontWeight(.bold)
                            }
                            
                            VStack(spacing: 8) {
                                Text("☀️ Wake Up")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                                Text(wakeTime)
                                    .font(.title2)
                                    .fontWeight(.bold)
                            }
                        }
                        
                        Text(sleepDuration)
                            .font(.headline)
                            .foregroundColor(.accentColor)
                            .padding(.top, 8)
                    }
                    .padding(24)
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 4)
                    
                    // Sleep Tips
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Sleep Tips")
                            .font(.headline)
                        
                        sleepTip(icon: "🌙", text: "Maintain a consistent sleep schedule")
                        sleepTip(icon: "📵", text: "Avoid screens 1 hour before bed")
                        sleepTip(icon: "🏃", text: "Exercise regularly, but not before bed")
                        sleepTip(icon: "☕️", text: "Limit caffeine intake after 2 PM")
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
        }
        .background(Color(.systemGroupedBackground))
        .sheet(isPresented: $showingEditSleep) {
            EditSleepScheduleSheet(
                bedtime: $bedtime,
                wakeTime: $wakeTime,
                isPresented: $showingEditSleep
            )
        }
    }
    
    private func sleepTip(icon: String, text: String) -> some View {
        HStack(spacing: 12) {
            Text(icon)
                .font(.title3)
            Text(text)
                .font(.subheadline)
            Spacer()
        }
    }
    
    private var sleepDuration: String {
        // Simple calculation - in a real app you'd parse the time strings properly
        let bedHour = Int(bedtime.prefix(2)) ?? 22
        let wakeHour = Int(wakeTime.prefix(2)) ?? 7
        
        var hours = wakeHour - bedHour
        if hours < 0 {
            hours += 24
        }
        
        return "\(hours) hours of sleep"
    }
}

// MARK: - Edit Sleep Schedule Sheet
struct EditSleepScheduleSheet: View {
    @Binding var bedtime: String
    @Binding var wakeTime: String
    @Binding var isPresented: Bool
    
    @State private var tempBedtime: String
    @State private var tempWakeTime: String
    
    init(bedtime: Binding<String>, wakeTime: Binding<String>, isPresented: Binding<Bool>) {
        self._bedtime = bedtime
        self._wakeTime = wakeTime
        self._isPresented = isPresented
        _tempBedtime = State(initialValue: bedtime.wrappedValue)
        _tempWakeTime = State(initialValue: wakeTime.wrappedValue)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Sleep Schedule")) {
                    HStack {
                        Text("Bedtime")
                        Spacer()
                        TextField("HH:MM", text: $tempBedtime)
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.numbersAndPunctuation)
                    }
                    
                    HStack {
                        Text("Wake Time")
                        Spacer()
                        TextField("HH:MM", text: $tempWakeTime)
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.numbersAndPunctuation)
                    }
                }
            }
            .navigationTitle("Edit Sleep Schedule")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { isPresented = false }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        bedtime = tempBedtime
                        wakeTime = tempWakeTime
                        isPresented = false
                    }
                }
            }
        }
    }
}

// MARK: - Previews
struct MealsView_Previews: PreviewProvider {
    static var previews: some View {
        MealsView()
    }
}

struct SleepView_Previews: PreviewProvider {
    static var previews: some View {
        SleepView()
    }
}
