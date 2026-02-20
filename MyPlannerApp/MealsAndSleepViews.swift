import SwiftUI

// MARK: - Meal Model
struct Meal: Identifiable, Codable {
    let id: UUID
    var name: String
    var time: String
    var type: MealType
    var notes: String?
    
    init(id: UUID = UUID(), name: String, time: String, type: MealType, notes: String? = nil) {
        self.id = id
        self.name = name
        self.time = time
        self.type = type
        self.notes = notes
    }
}

enum MealType: String, CaseIterable, Codable {
    case breakfast = "Breakfast"
    case lunch = "Lunch"
    case dinner = "Dinner"
    case snack = "Snack"
    case other = "Other"
    
    var icon: String {
        switch self {
        case .breakfast: return "☕️"
        case .lunch: return "🥗"
        case .dinner: return "🍽"
        case .snack: return "🍎"
        case .other: return "🍴"
        }
    }
}

// MARK: - Meals View
struct MealsView: View {
    @AppStorage("savedMeals") private var savedMealsData: Data = Data()
    @State private var meals: [Meal] = []
    @State private var showingAddMeal = false
    @State private var editingMeal: Meal?
    
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
            
            if meals.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "fork.knife")
                        .font(.system(size: 60))
                        .foregroundColor(.gray)
                    
                    Text("No meals planned")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Button(action: addDefaultMeals) {
                        Text("Add Default Meals")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 12)
                            .background(Color.accentColor)
                            .cornerRadius(10)
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List {
                    ForEach(meals) { meal in
                        MealRowView(meal: meal)
                            .onTapGesture {
                                editingMeal = meal
                            }
                    }
                    .onDelete(perform: deleteMeal)
                }
            }
        }
        .sheet(isPresented: $showingAddMeal) {
            AddMealView(meals: $meals, onSave: saveMeals)
        }
        .sheet(item: $editingMeal) { meal in
            EditMealView(meal: meal, meals: $meals, onSave: saveMeals)
        }
        .onAppear {
            loadMeals()
            if meals.isEmpty {
                addDefaultMeals()
            }
        }
    }
    
    private func addDefaultMeals() {
        meals = [
            Meal(name: "Breakfast", time: "8:00 AM", type: .breakfast),
            Meal(name: "Lunch", time: "12:00 PM", type: .lunch),
            Meal(name: "Dinner", time: "6:00 PM", type: .dinner)
        ]
        saveMeals()
    }
    
    private func deleteMeal(at offsets: IndexSet) {
        meals.remove(atOffsets: offsets)
        saveMeals()
    }
    
    private func saveMeals() {
        if let encoded = try? JSONEncoder().encode(meals) {
            savedMealsData = encoded
        }
    }
    
    private func loadMeals() {
        if let decoded = try? JSONDecoder().decode([Meal].self, from: savedMealsData) {
            meals = decoded
        }
    }
}

// MARK: - Meal Row View
struct MealRowView: View {
    let meal: Meal
    
    var body: some View {
        HStack(spacing: 12) {
            Text(meal.type.icon)
                .font(.system(size: 32))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(meal.name)
                    .font(.headline)
                
                Text(meal.time)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                if let notes = meal.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .lineLimit(1)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 8)
    }
}

// MARK: - Add Meal View
struct AddMealView: View {
    @Binding var meals: [Meal]
    let onSave: () -> Void
    @Environment(\.dismiss) var dismiss
    
    @State private var name = ""
    @State private var selectedType: MealType = .breakfast
    @State private var selectedHour = 12
    @State private var selectedMinute = 0
    @State private var selectedPeriod = "AM"
    @State private var notes = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Meal Details")) {
                    TextField("Meal name", text: $name)
                    
                    Picker("Type", selection: $selectedType) {
                        ForEach(MealType.allCases, id: \.self) { type in
                            HStack {
                                Text(type.icon)
                                Text(type.rawValue)
                            }
                            .tag(type)
                        }
                    }
                }
                
                Section(header: Text("Time (12-Hour Format)")) {
                    HStack {
                        Picker("Hour", selection: $selectedHour) {
                            ForEach(1...12, id: \.self) { hour in
                                Text("\(hour)").tag(hour)
                            }
                        }
                        .frame(width: 80)
                        
                        Text(":")
                        
                        Picker("Minute", selection: $selectedMinute) {
                            ForEach(0..<60, id: \.self) { minute in
                                Text(String(format: "%02d", minute)).tag(minute)
                            }
                        }
                        .frame(width: 80)
                        
                        Picker("", selection: $selectedPeriod) {
                            Text("AM").tag("AM")
                            Text("PM").tag("PM")
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        .frame(width: 100)
                    }
                }
                
                Section(header: Text("Notes (Optional)")) {
                    TextEditor(text: $notes)
                        .frame(height: 80)
                }
            }
            .navigationTitle("Add Meal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        let timeString = "\(selectedHour):\(String(format: "%02d", selectedMinute)) \(selectedPeriod)"
                        let newMeal = Meal(name: name, time: timeString, type: selectedType, notes: notes.isEmpty ? nil : notes)
                        meals.append(newMeal)
                        onSave()
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
}

// MARK: - Edit Meal View
struct EditMealView: View {
    let meal: Meal
    @Binding var meals: [Meal]
    let onSave: () -> Void
    @Environment(\.dismiss) var dismiss
    
    @State private var name = ""
    @State private var selectedType: MealType = .breakfast
    @State private var selectedHour = 12
    @State private var selectedMinute = 0
    @State private var selectedPeriod = "AM"
    @State private var notes = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Meal Details")) {
                    TextField("Meal name", text: $name)
                    
                    Picker("Type", selection: $selectedType) {
                        ForEach(MealType.allCases, id: \.self) { type in
                            HStack {
                                Text(type.icon)
                                Text(type.rawValue)
                            }
                            .tag(type)
                        }
                    }
                }
                
                Section(header: Text("Time (12-Hour Format)")) {
                    HStack {
                        Picker("Hour", selection: $selectedHour) {
                            ForEach(1...12, id: \.self) { hour in
                                Text("\(hour)").tag(hour)
                            }
                        }
                        .frame(width: 80)
                        
                        Text(":")
                        
                        Picker("Minute", selection: $selectedMinute) {
                            ForEach(0..<60, id: \.self) { minute in
                                Text(String(format: "%02d", minute)).tag(minute)
                            }
                        }
                        .frame(width: 80)
                        
                        Picker("", selection: $selectedPeriod) {
                            Text("AM").tag("AM")
                            Text("PM").tag("PM")
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        .frame(width: 100)
                    }
                }
                
                Section(header: Text("Notes (Optional)")) {
                    TextEditor(text: $notes)
                        .frame(height: 80)
                }
            }
            .navigationTitle("Edit Meal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        if let index = meals.firstIndex(where: { $0.id == meal.id }) {
                            let timeString = "\(selectedHour):\(String(format: "%02d", selectedMinute)) \(selectedPeriod)"
                            meals[index] = Meal(
                                id: meal.id,
                                name: name,
                                time: timeString,
                                type: selectedType,
                                notes: notes.isEmpty ? nil : notes
                            )
                            onSave()
                            dismiss()
                        }
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
        .onAppear {
            name = meal.name
            selectedType = meal.type
            notes = meal.notes ?? ""
            
            // Parse time
            let components = meal.time.components(separatedBy: " ")
            if components.count == 2 {
                selectedPeriod = components[1]
                let timeComponents = components[0].components(separatedBy: ":")
                if timeComponents.count == 2 {
                    selectedHour = Int(timeComponents[0]) ?? 12
                    selectedMinute = Int(timeComponents[1]) ?? 0
                }
            }
        }
    }
}

// MARK: - Sleep Tracking View
struct SleepTrackingView: View {
    @AppStorage("savedBedtime") private var savedBedtime = "10:00 PM"
    @AppStorage("savedWakeTime") private var savedWakeTime = "7:00 AM"
    @State private var showingEditSleep = false
    
    var body: some View {
        VStack(spacing: 20) {
            // Header
            HStack {
                Text("Sleep Schedule")
                    .font(.title2)
                    .fontWeight(.bold)
                
                Spacer()
                
                Button(action: { showingEditSleep = true }) {
                    Image(systemName: "pencil.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.accentColor)
                }
            }
            .padding()
            
            VStack(spacing: 24) {
                // Sleep Schedule Card
                VStack(spacing: 16) {
                    HStack {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("🌙 Bedtime")
                                .font(.headline)
                                .foregroundColor(.secondary)
                            
                            Text(savedBedtime)
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.accentColor)
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 8) {
                            Text("☀️ Wake Time")
                                .font(.headline)
                                .foregroundColor(.secondary)
                            
                            Text(savedWakeTime)
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.orange)
                        }
                    }
                    
                    Divider()
                    
                    HStack {
                        Image(systemName: "bed.double.fill")
                            .foregroundColor(.purple)
                        
                        Text("Sleep Duration: \(calculateSleepDuration())")
                            .font(.headline)
                        
                        Spacer()
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                // Tips
                VStack(alignment: .leading, spacing: 12) {
                    Text("Sleep Tips")
                        .font(.headline)
                    
                    TipRow(icon: "💤", text: "Aim for 7-9 hours of sleep")
                    TipRow(icon: "📱", text: "Avoid screens 1 hour before bed")
                    TipRow(icon: "🌡️", text: "Keep bedroom cool (60-67°F)")
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
            .padding()
            
            Spacer()
        }
        .sheet(isPresented: $showingEditSleep) {
            EditSleepScheduleView(
                bedtime: $savedBedtime,
                wakeTime: $savedWakeTime,
                isPresented: $showingEditSleep
            )
        }
    }
    
    private func calculateSleepDuration() -> String {
        let bedComponents = parseTime(savedBedtime)
        let wakeComponents = parseTime(savedWakeTime)
        
        let bedHour = bedComponents.hour
        let bedMinute = bedComponents.minute
        var wakeHour = wakeComponents.hour
        let wakeMinute = wakeComponents.minute
        
        // If wake time is earlier than bed time, add 24 hours
        if wakeHour < bedHour || (wakeHour == bedHour && wakeMinute < bedMinute) {
            wakeHour += 24
        }
        
        let totalMinutes = (wakeHour * 60 + wakeMinute) - (bedHour * 60 + bedMinute)
        let hours = totalMinutes / 60
        let minutes = totalMinutes % 60
        
        if minutes == 0 {
            return "\(hours) hours"
        } else {
            return "\(hours)h \(minutes)m"
        }
    }
    
    private func parseTime(_ time: String) -> (hour: Int, minute: Int) {
        let components = time.components(separatedBy: " ")
        guard components.count == 2 else { return (0, 0) }
        
        let timeComponents = components[0].components(separatedBy: ":")
        guard timeComponents.count == 2 else { return (0, 0) }
        
        var hour = Int(timeComponents[0]) ?? 0
        let minute = Int(timeComponents[1]) ?? 0
        let period = components[1]
        
        // Convert to 24-hour format
        if period == "PM" && hour != 12 {
            hour += 12
        } else if period == "AM" && hour == 12 {
            hour = 0
        }
        
        return (hour, minute)
    }
}

struct TipRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Text(icon)
                .font(.title3)
            
            Text(text)
                .font(.subheadline)
            
            Spacer()
        }
    }
}

// MARK: - Edit Sleep Schedule View
struct EditSleepScheduleView: View {
    @Binding var bedtime: String
    @Binding var wakeTime: String
    @Binding var isPresented: Bool
    
    @State private var bedHour = 10
    @State private var bedMinute = 0
    @State private var bedPeriod = "PM"
    
    @State private var wakeHour = 7
    @State private var wakeMinute = 0
    @State private var wakePeriod = "AM"
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Bedtime (12-Hour Format)")) {
                    HStack {
                        Picker("Hour", selection: $bedHour) {
                            ForEach(1...12, id: \.self) { hour in
                                Text("\(hour)").tag(hour)
                            }
                        }
                        .frame(width: 80)
                        
                        Text(":")
                        
                        Picker("Minute", selection: $bedMinute) {
                            ForEach(0..<60, id: \.self) { minute in
                                Text(String(format: "%02d", minute)).tag(minute)
                            }
                        }
                        .frame(width: 80)
                        
                        Picker("", selection: $bedPeriod) {
                            Text("AM").tag("AM")
                            Text("PM").tag("PM")
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        .frame(width: 100)
                    }
                }
                
                Section(header: Text("Wake Time (12-Hour Format)")) {
                    HStack {
                        Picker("Hour", selection: $wakeHour) {
                            ForEach(1...12, id: \.self) { hour in
                                Text("\(hour)").tag(hour)
                            }
                        }
                        .frame(width: 80)
                        
                        Text(":")
                        
                        Picker("Minute", selection: $wakeMinute) {
                            ForEach(0..<60, id: \.self) { minute in
                                Text(String(format: "%02d", minute)).tag(minute)
                            }
                        }
                        .frame(width: 80)
                        
                        Picker("", selection: $wakePeriod) {
                            Text("AM").tag("AM")
                            Text("PM").tag("PM")
                        }
                        .pickerStyle(SegmentedPickerStyle())
                        .frame(width: 100)
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
                        bedtime = "\(bedHour):\(String(format: "%02d", bedMinute)) \(bedPeriod)"
                        wakeTime = "\(wakeHour):\(String(format: "%02d", wakeMinute)) \(wakePeriod)"
                        isPresented = false
                    }
                }
            }
        }
        .onAppear {
            // Parse bedtime
            let bedComponents = bedtime.components(separatedBy: " ")
            if bedComponents.count == 2 {
                bedPeriod = bedComponents[1]
                let timeComponents = bedComponents[0].components(separatedBy: ":")
                if timeComponents.count == 2 {
                    bedHour = Int(timeComponents[0]) ?? 10
                    bedMinute = Int(timeComponents[1]) ?? 0
                }
            }
            
            // Parse wake time
            let wakeComponents = wakeTime.components(separatedBy: " ")
            if wakeComponents.count == 2 {
                wakePeriod = wakeComponents[1]
                let timeComponents = wakeComponents[0].components(separatedBy: ":")
                if timeComponents.count == 2 {
                    wakeHour = Int(timeComponents[0]) ?? 7
                    wakeMinute = Int(timeComponents[1]) ?? 0
                }
            }
        }
    }
}
