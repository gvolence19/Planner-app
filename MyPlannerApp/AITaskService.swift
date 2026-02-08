import SwiftUI
import NaturalLanguage

// MARK: - AI Task Service
class AITaskService: ObservableObject {
    @Published var suggestions: [AITaskSuggestion] = []
    @Published var isAnalyzing = false
    
    private let tagger = NLTagger(tagSchemes: [.lexicalClass, .nameType, .lemma])
    private var patternLearner = PatternLearningEngine()
    
    struct AITaskSuggestion: Identifiable {
        let id = UUID()
        let title: String
        let category: String?
        let priority: Priority
        let confidence: Double
        let reason: String
        let suggestedTime: String?
        let suggestedDuration: String?
    }
    
    // MARK: - Natural Language Processing
    func parseNaturalLanguageInput(_ input: String) -> TaskCreationData {
        var data = TaskCreationData()
        data.title = input
        
        // Extract entities
        tagger.string = input
        let range = input.startIndex..<input.endIndex
        
        var extractedInfo: [String] = []
        
        tagger.enumerateTags(in: range, unit: .word, scheme: .nameType) { tag, tokenRange in
            if let tag = tag {
                let token = String(input[tokenRange])
                extractedInfo.append("\(tag.rawValue): \(token)")
                
                // Extract location
                if tag == .placeName {
                    data.location = token
                }
            }
            return true
        }
        
        // Parse priority keywords
        let lowercased = input.lowercased()
        if lowercased.contains("urgent") || lowercased.contains("asap") || lowercased.contains("critical") {
            data.priority = .high
        } else if lowercased.contains("whenever") || lowercased.contains("someday") {
            data.priority = .low
        }
        
        // Parse time expressions
        if let timeInfo = extractTimeInformation(from: input) {
            data.startTime = timeInfo.time
            data.dueDate = timeInfo.date
        }
        
        // Parse duration
        if let duration = extractDuration(from: input) {
            data.duration = duration
        }
        
        // Suggest category
        data.category = suggestCategory(from: input)
        data.aiCategory = data.category
        data.isAISuggested = true
        
        return data
    }
    
    private func extractTimeInformation(from text: String) -> (time: String?, date: Date?)? {
        let lowercased = text.lowercased()
        var time: String?
        var date: Date?
        
        // Time patterns
        let timePattern = #"\b([01]?[0-9]|2[0-3]):([0-5][0-9])\b"#
        if let match = lowercased.range(of: timePattern, options: .regularExpression) {
            time = String(lowercased[match])
        }
        
        // Date keywords
        let calendar = Calendar.current
        if lowercased.contains("today") {
            date = Date()
        } else if lowercased.contains("tomorrow") {
            date = calendar.date(byAdding: .day, value: 1, to: Date())
        } else if lowercased.contains("next week") {
            date = calendar.date(byAdding: .weekOfYear, value: 1, to: Date())
        } else if lowercased.contains("next month") {
            date = calendar.date(byAdding: .month, value: 1, to: Date())
        }
        
        return (time, date)
    }
    
    private func extractDuration(from text: String) -> String? {
        let lowercased = text.lowercased()
        
        // Pattern for "X minutes", "X hours"
        let durationPattern = #"\b(\d+)\s*(minute|min|hour|hr)s?\b"#
        guard let match = lowercased.range(of: durationPattern, options: .regularExpression) else {
            return nil
        }
        
        let matchText = String(lowercased[match])
        
        // Extract number
        let numberPattern = #"\d+"#
        guard let numberMatch = matchText.range(of: numberPattern, options: .regularExpression) else {
            return nil
        }
        
        let number = Int(matchText[numberMatch]) ?? 0
        
        // Convert to minutes
        if matchText.contains("hour") || matchText.contains("hr") {
            return String(number * 60)
        } else {
            return String(number)
        }
    }
    
    private func suggestCategory(from text: String) -> String? {
        let lowercased = text.lowercased()
        
        // Category keywords mapping
        let categoryKeywords: [String: [String]] = [
            "Work": ["meeting", "email", "presentation", "deadline", "project", "client", "office"],
            "Shopping": ["buy", "purchase", "groceries", "store", "shop", "market"],
            "Health": ["doctor", "appointment", "medicine", "hospital", "dentist", "checkup"],
            "Fitness": ["gym", "workout", "exercise", "run", "jog", "train", "yoga"],
            "Social": ["friend", "party", "dinner", "lunch", "coffee", "hangout", "meet"],
            "Personal": ["clean", "organize", "pay", "call", "home", "house"],
            "Education": ["study", "learn", "course", "class", "homework", "assignment", "read"]
        ]
        
        for (category, keywords) in categoryKeywords {
            for keyword in keywords {
                if lowercased.contains(keyword) {
                    return category
                }
            }
        }
        
        return nil
    }
    
    // MARK: - Generate Smart Suggestions
    func generateSuggestions(for input: String, basedOn tasks: [Task]) {
        isAnalyzing = true
        suggestions.removeAll()
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            guard let self = self else { return }
            
            // Analyze patterns
            let patterns = self.patternLearner.analyzePatterns(from: tasks)
            
            // Generate suggestions based on input and patterns
            var newSuggestions: [AITaskSuggestion] = []
            
            // Time-based suggestions
            if self.shouldSuggestTimeBasedTask(patterns: patterns) {
                if let timeSuggestion = self.generateTimeBasedSuggestion(patterns: patterns) {
                    newSuggestions.append(timeSuggestion)
                }
            }
            
            // Pattern-based suggestions
            if let patternSuggestions = self.generatePatternBasedSuggestions(patterns: patterns, input: input) {
                newSuggestions.append(contentsOf: patternSuggestions)
            }
            
            // Context-aware suggestions
            if let contextSuggestions = self.generateContextSuggestions(basedOn: tasks) {
                newSuggestions.append(contentsOf: contextSuggestions)
            }
            
            DispatchQueue.main.async {
                self.suggestions = Array(newSuggestions.prefix(5)) // Top 5 suggestions
                self.isAnalyzing = false
            }
        }
    }
    
    private func shouldSuggestTimeBasedTask(patterns: TaskPatterns) -> Bool {
        let hour = Calendar.current.component(.hour, from: Date())
        return hour >= 9 && hour <= 17 // Work hours
    }
    
    private func generateTimeBasedSuggestion(patterns: TaskPatterns) -> AITaskSuggestion? {
        let dayOfWeek = Calendar.current.component(.weekday, from: Date())
        
        // Check if there's a pattern for this day/time
        if let commonTask = patterns.frequentTasksByDay[dayOfWeek]?.first {
            return AITaskSuggestion(
                title: commonTask.title,
                category: commonTask.category,
                priority: commonTask.priority,
                confidence: 0.8,
                reason: "You often do this around this time",
                suggestedTime: commonTask.startTime,
                suggestedDuration: commonTask.duration
            )
        }
        
        return nil
    }
    
    private func generatePatternBasedSuggestions(patterns: TaskPatterns, input: String) -> [AITaskSuggestion]? {
        var suggestions: [AITaskSuggestion] = []
        
        // Find similar past tasks
        for (category, tasks) in patterns.tasksByCategory {
            if let match = findSimilarTask(input: input, in: tasks) {
                suggestions.append(AITaskSuggestion(
                    title: match.title,
                    category: category,
                    priority: match.priority,
                    confidence: 0.7,
                    reason: "Similar to tasks you've created before",
                    suggestedTime: match.startTime,
                    suggestedDuration: match.duration
                ))
            }
        }
        
        return suggestions.isEmpty ? nil : suggestions
    }
    
    private func findSimilarTask(input: String, in tasks: [Task]) -> Task? {
        let inputWords = Set(input.lowercased().split(separator: " ").map(String.init))
        
        var bestMatch: (task: Task, score: Double)?
        
        for task in tasks {
            let taskWords = Set(task.title.lowercased().split(separator: " ").map(String.init))
            let commonWords = inputWords.intersection(taskWords)
            let score = Double(commonWords.count) / Double(max(inputWords.count, taskWords.count))
            
            if score > 0.3 { // 30% similarity threshold
                if bestMatch == nil || score > bestMatch!.score {
                    bestMatch = (task, score)
                }
            }
        }
        
        return bestMatch?.task
    }
    
    private func generateContextSuggestions(basedOn tasks: [Task]) -> [AITaskSuggestion]? {
        var suggestions: [AITaskSuggestion] = []
        let now = Date()
        
        // Suggest follow-up tasks for incomplete high-priority tasks
        let incompleteTasks = tasks.filter { !$0.completed && $0.priority == .high }
        for task in incompleteTasks.prefix(2) {
            if let dueDate = task.dueDate, dueDate < now {
                suggestions.append(AITaskSuggestion(
                    title: "Follow up: \(task.title)",
                    category: task.category,
                    priority: .high,
                    confidence: 0.6,
                    reason: "This high-priority task is overdue",
                    suggestedTime: nil,
                    suggestedDuration: task.duration
                ))
            }
        }
        
        return suggestions.isEmpty ? nil : suggestions
    }
}

// MARK: - Pattern Learning Engine
class PatternLearningEngine {
    func analyzePatterns(from tasks: [Task]) -> TaskPatterns {
        var patterns = TaskPatterns()
        
        // Group by category
        patterns.tasksByCategory = Dictionary(grouping: tasks) { $0.category ?? "Other" }
        
        // Group by day of week
        for task in tasks {
            guard let dueDate = task.dueDate else { continue }
            let dayOfWeek = Calendar.current.component(.weekday, from: dueDate)
            
            if patterns.frequentTasksByDay[dayOfWeek] == nil {
                patterns.frequentTasksByDay[dayOfWeek] = []
            }
            patterns.frequentTasksByDay[dayOfWeek]?.append(task)
        }
        
        // Analyze completion patterns
        let completedTasks = tasks.filter { $0.completed }
        patterns.averageCompletionTime = calculateAverageCompletionTime(tasks: completedTasks)
        patterns.completionRate = Double(completedTasks.count) / Double(max(tasks.count, 1))
        
        // Find most productive hours
        patterns.mostProductiveHours = findMostProductiveHours(tasks: completedTasks)
        
        return patterns
    }
    
    private func calculateAverageCompletionTime(tasks: [Task]) -> TimeInterval {
        let durations = tasks.compactMap { task -> TimeInterval? in
            guard let duration = task.duration, let minutes = Double(duration) else { return nil }
            return minutes * 60
        }
        
        guard !durations.isEmpty else { return 0 }
        return durations.reduce(0, +) / Double(durations.count)
    }
    
    private func findMostProductiveHours(tasks: [Task]) -> [Int] {
        var hourCounts: [Int: Int] = [:]
        
        for task in tasks {
            guard let startTime = task.startTime,
                  let hour = extractHour(from: startTime) else { continue }
            hourCounts[hour, default: 0] += 1
        }
        
        let sorted = hourCounts.sorted { $0.value > $1.value }
        return Array(sorted.prefix(3).map { $0.key })
    }
    
    private func extractHour(from timeString: String) -> Int? {
        let components = timeString.split(separator: ":")
        return components.first.flatMap { Int($0) }
    }
}

// MARK: - Task Patterns
struct TaskPatterns {
    var tasksByCategory: [String: [Task]] = [:]
    var frequentTasksByDay: [Int: [Task]] = [:]
    var averageCompletionTime: TimeInterval = 0
    var completionRate: Double = 0
    var mostProductiveHours: [Int] = []
}

// MARK: - Task Creation Data
struct TaskCreationData {
    var title: String?
    var category: String?
    var priority: Priority?
    var location: String?
    var duration: String?
    var startTime: String?
    var dueDate: Date?
    var isAISuggested: Bool?
    var aiCategory: String?
}

// MARK: - AI Suggestions View
struct AITaskSuggestionsView: View {
    @StateObject private var aiService = AITaskService()
    @StateObject private var dataManager = DataManager.shared
    @State private var searchText = ""
    
    var body: some View {
        VStack {
            SearchBar(text: $searchText)
                .padding()
                .onChange(of: searchText) { newValue in
                    if newValue.count > 2 {
                        aiService.generateSuggestions(for: newValue, basedOn: dataManager.tasks)
                    }
                }
            
            if aiService.isAnalyzing {
                ProgressView("Analyzing...")
                    .padding()
            } else if aiService.suggestions.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                    Text("Type to get AI suggestions")
                        .foregroundColor(.secondary)
                }
                .frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: 12) {
                        ForEach(aiService.suggestions) { suggestion in
                            AISuggestionCard(suggestion: suggestion)
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("AI Suggestions")
    }
}

struct AISuggestionCard: View {
    let suggestion: AITaskService.AITaskSuggestion
    @StateObject private var dataManager = DataManager.shared
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundColor(.yellow)
                VStack(alignment: .leading) {
                    Text(suggestion.title)
                        .font(.headline)
                    Text(suggestion.reason)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                Text("\(Int(suggestion.confidence * 100))%")
                    .font(.caption)
                    .padding(4)
                    .background(Color.accentColor.opacity(0.2))
                    .cornerRadius(4)
            }
            
            HStack {
                if let category = suggestion.category {
                    Label(category, systemImage: "tag")
                        .font(.caption)
                }
                Circle().fill(suggestion.priority.color).frame(width: 8, height: 8)
                Text(suggestion.priority.rawValue)
                    .font(.caption)
            }
            
            Button(action: { createTask() }) {
                Text("Create Task")
                    .font(.subheadline)
                    .frame(maxWidth: .infinity)
                    .padding(8)
                    .background(Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    private func createTask() {
        let task = Task(
            title: suggestion.title,
            category: suggestion.category,
            priority: suggestion.priority,
            isAISuggested: true,
            aiCategory: suggestion.category,
            startTime: suggestion.suggestedTime,
            duration: suggestion.suggestedDuration
        )
        dataManager.addTask(task)
    }
}
