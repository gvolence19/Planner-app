import SwiftUI

// MARK: - Simplified Planner Content Views
// Designed specifically for the planner format with generous spacing and large, clear UI

// MARK: - Simple Calendar View for Planner
struct SimplePlannerCalendar: View {
    @State private var selectedDate = Date()
    
    var body: some View {
        VStack(spacing: 25) {
            // Month header
            Text(selectedDate.formatted(.dateTime.month(.wide).year()))
                .font(.system(size: 22, weight: .semibold, design: .serif))
                .foregroundColor(.black)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Calendar grid
            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: 7), spacing: 15) {
                // Day headers
                ForEach(["S", "M", "T", "W", "T", "F", "S"], id: \.self) { day in
                    Text(day)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.gray)
                }
                
                // Date cells (simplified - just showing a month)
                ForEach(1...31, id: \.self) { day in
                    Text("\(day)")
                        .font(.system(size: 16))
                        .foregroundColor(.black)
                        .frame(width: 36, height: 36)
                        .background(
                            Circle()
                                .fill(day == 17 ? Color.blue : Color.clear)
                        )
                        .foregroundColor(day == 17 ? .white : .black)
                }
            }
            
            Spacer(minLength: 20)
            
            // Today's events
            VStack(alignment: .leading, spacing: 15) {
                Text("Today's Schedule")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.black)
                
                eventItem(time: "9:00 AM", title: "Morning Meeting", color: .blue)
                eventItem(time: "2:00 PM", title: "Project Review", color: .green)
                eventItem(time: "4:30 PM", title: "Team Sync", color: .orange)
            }
            
            Spacer()
        }
        .padding(.vertical, 10)
    }
    
    private func eventItem(time: String, title: String, color: Color) -> some View {
        HStack(spacing: 15) {
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(time)
                    .font(.system(size: 13))
                    .foregroundColor(.gray)
                Text(title)
                    .font(.system(size: 16))
                    .foregroundColor(.black)
            }
            
            Spacer()
        }
    }
}

// MARK: - Simple Tasks View for Planner
struct SimplePlannerTasks: View {
    @State private var tasks = [
        ("Complete project proposal", false),
        ("Review design mockups", false),
        ("Send follow-up emails", true),
        ("Prepare presentation", false),
        ("Team standup meeting", true)
    ]
    
    var body: some View {
        VStack(spacing: 25) {
            // Header
            HStack {
                Text("My Tasks")
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundColor(.black)
                
                Spacer()
                
                Button(action: {}) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.green)
                }
            }
            
            // Task list
            VStack(spacing: 18) {
                ForEach(tasks.indices, id: \.self) { index in
                    taskRow(task: tasks[index].0, completed: tasks[index].1)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 10)
    }
    
    private func taskRow(task: String, completed: Bool) -> some View {
        HStack(spacing: 15) {
            // Checkbox
            ZStack {
                Circle()
                    .strokeBorder(completed ? Color.green : Color.gray.opacity(0.4), lineWidth: 2)
                    .frame(width: 24, height: 24)
                
                if completed {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.green)
                }
            }
            
            // Task text
            Text(task)
                .font(.system(size: 17))
                .foregroundColor(completed ? .gray : .black)
                .strikethrough(completed)
            
            Spacer()
        }
    }
}

// MARK: - Simple Grocery View for Planner
struct SimplePlannerGrocery: View {
    @State private var items = [
        ("Milk", false),
        ("Bread", false),
        ("Eggs", true),
        ("Chicken", false),
        ("Vegetables", false),
        ("Fruit", true),
        ("Cheese", false)
    ]
    
    var body: some View {
        VStack(spacing: 25) {
            // Header
            HStack {
                Text("Shopping List")
                    .font(.system(size: 22, weight: .semibold, design: .serif))
                    .foregroundColor(.black)
                
                Spacer()
                
                Button(action: {}) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 28))
                        .foregroundColor(.orange)
                }
            }
            
            // Grocery list
            VStack(spacing: 18) {
                ForEach(items.indices, id: \.self) { index in
                    groceryRow(item: items[index].0, checked: items[index].1)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 10)
    }
    
    private func groceryRow(item: String, checked: Bool) -> some View {
        HStack(spacing: 15) {
            // Checkbox
            ZStack {
                RoundedRectangle(cornerRadius: 6)
                    .strokeBorder(checked ? Color.orange : Color.gray.opacity(0.4), lineWidth: 2)
                    .frame(width: 24, height: 24)
                
                if checked {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.orange)
                }
            }
            
            // Item text
            Text(item)
                .font(.system(size: 17))
                .foregroundColor(checked ? .gray : .black)
                .strikethrough(checked)
            
            Spacer()
        }
    }
}

// MARK: - Simple Sleep View for Planner
struct SimplePlannerSleep: View {
    var body: some View {
        VStack(spacing: 25) {
            // Header
            Text("Sleep Tracker")
                .font(.system(size: 22, weight: .semibold, design: .serif))
                .foregroundColor(.black)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Sleep goal
            VStack(spacing: 15) {
                HStack {
                    Text("Sleep Goal")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(.black)
                    Spacer()
                    Text("8 hours")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.purple)
                }
                
                // Progress bar
                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.purple.opacity(0.2))
                            .frame(height: 12)
                        
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.purple)
                            .frame(width: geometry.size.width * 0.75, height: 12)
                    }
                }
                .frame(height: 12)
            }
            .padding(.vertical, 10)
            
            // Recent sleep
            VStack(alignment: .leading, spacing: 15) {
                Text("This Week")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.black)
                
                sleepEntry(day: "Monday", hours: 7.5)
                sleepEntry(day: "Tuesday", hours: 8.0)
                sleepEntry(day: "Wednesday", hours: 6.5)
                sleepEntry(day: "Thursday", hours: 7.8)
                sleepEntry(day: "Friday", hours: 8.2)
            }
            
            Spacer()
        }
        .padding(.vertical, 10)
    }
    
    private func sleepEntry(day: String, hours: Double) -> some View {
        HStack(spacing: 15) {
            Text(day)
                .font(.system(size: 16))
                .foregroundColor(.black)
                .frame(width: 100, alignment: .leading)
            
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.purple.opacity(0.2))
                    .frame(height: 8)
                
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.purple)
                    .frame(width: CGFloat(hours / 10.0) * 150, height: 8)
            }
            .frame(width: 150)
            
            Text(String(format: "%.1fh", hours))
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.purple)
        }
    }
}

// MARK: - Simple Settings View for Planner
struct SimplePlannerSettings: View {
    var body: some View {
        VStack(spacing: 25) {
            // Header
            Text("Settings")
                .font(.system(size: 22, weight: .semibold, design: .serif))
                .foregroundColor(.black)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Settings options
            VStack(spacing: 20) {
                settingRow(icon: "bell.fill", title: "Notifications", color: .blue)
                settingRow(icon: "paintbrush.fill", title: "Themes", color: .purple)
                settingRow(icon: "square.and.arrow.up.fill", title: "Export Data", color: .green)
                settingRow(icon: "person.fill", title: "Account", color: .orange)
                settingRow(icon: "info.circle.fill", title: "About", color: .gray)
            }
            
            Spacer()
        }
        .padding(.vertical, 10)
    }
    
    private func settingRow(icon: String, title: String, color: Color) -> some View {
        HStack(spacing: 15) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(color)
                    .frame(width: 36, height: 36)
                
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(.white)
            }
            
            Text(title)
                .font(.system(size: 17))
                .foregroundColor(.black)
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.gray.opacity(0.5))
        }
        .padding(.vertical, 5)
    }
}
