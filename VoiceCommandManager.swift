import SwiftUI
import Speech
import AVFoundation

// MARK: - Voice Command Manager
class VoiceCommandManager: NSObject, ObservableObject {
    // Speech Recognition
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    // Published Properties
    @Published var isRecording = false
    @Published var transcribedText = ""
    @Published var isAuthorized = false
    @Published var errorMessage: String?
    
    override init() {
        super.init()
        requestAuthorization()
    }
    
    // MARK: - Authorization
    func requestAuthorization() {
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                switch authStatus {
                case .authorized:
                    self?.isAuthorized = true
                case .denied:
                    self?.errorMessage = "Speech recognition access denied"
                case .restricted:
                    self?.errorMessage = "Speech recognition restricted on this device"
                case .notDetermined:
                    self?.errorMessage = "Speech recognition not yet authorized"
                @unknown default:
                    self?.errorMessage = "Unknown authorization status"
                }
            }
        }
    }
    
    // MARK: - Recording Control
    func startRecording() {
        guard isAuthorized else {
            errorMessage = "Please authorize speech recognition first"
            return
        }
        
        // Cancel any existing task
        if recognitionTask != nil {
            recognitionTask?.cancel()
            recognitionTask = nil
        }
        
        // Configure audio session
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            errorMessage = "Failed to set up audio session: \(error.localizedDescription)"
            return
        }
        
        // Create recognition request
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        guard let recognitionRequest = recognitionRequest else {
            errorMessage = "Unable to create recognition request"
            return
        }
        
        recognitionRequest.shouldReportPartialResults = true
        
        // Get audio input node
        let inputNode = audioEngine.inputNode
        
        // Start recognition task
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            var isFinal = false
            
            if let result = result {
                DispatchQueue.main.async {
                    self?.transcribedText = result.bestTranscription.formattedString
                }
                isFinal = result.isFinal
            }
            
            if error != nil || isFinal {
                self?.audioEngine.stop()
                inputNode.removeTap(onBus: 0)
                
                self?.recognitionRequest = nil
                self?.recognitionTask = nil
                
                DispatchQueue.main.async {
                    self?.isRecording = false
                }
            }
        }
        
        // Configure microphone input
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        // Start audio engine
        audioEngine.prepare()
        do {
            try audioEngine.start()
            DispatchQueue.main.async {
                self.isRecording = true
                self.transcribedText = ""
            }
        } catch {
            errorMessage = "Audio engine failed to start: \(error.localizedDescription)"
        }
    }
    
    func stopRecording() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        isRecording = false
    }
    
    // MARK: - Command Parsing
    func parseVoiceCommand(_ text: String) -> Task? {
        let lowercased = text.lowercased()
        
        // Extract task title
        var title = text
        var category: String?
        var priority: Priority = .medium
        var dueDate: Date?
        
        // Parse priority
        if lowercased.contains("high priority") || lowercased.contains("urgent") || lowercased.contains("important") {
            priority = .high
            title = title.replacingOccurrences(of: "high priority", with: "", options: .caseInsensitive)
            title = title.replacingOccurrences(of: "urgent", with: "", options: .caseInsensitive)
            title = title.replacingOccurrences(of: "important", with: "", options: .caseInsensitive)
        } else if lowercased.contains("low priority") {
            priority = .low
            title = title.replacingOccurrences(of: "low priority", with: "", options: .caseInsensitive)
        }
        
        // Parse category
        let categories = TaskCategory.defaultCategories.map { $0.name.lowercased() }
        for cat in categories {
            if lowercased.contains(cat) {
                category = cat.capitalized
                break
            }
        }
        
        // Parse due date
        if lowercased.contains("today") {
            dueDate = Date()
            title = title.replacingOccurrences(of: "today", with: "", options: .caseInsensitive)
        } else if lowercased.contains("tomorrow") {
            dueDate = Calendar.current.date(byAdding: .day, value: 1, to: Date())
            title = title.replacingOccurrences(of: "tomorrow", with: "", options: .caseInsensitive)
        } else if lowercased.contains("next week") {
            dueDate = Calendar.current.date(byAdding: .weekOfYear, value: 1, to: Date())
            title = title.replacingOccurrences(of: "next week", with: "", options: .caseInsensitive)
        }
        
        // Clean up title
        title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Remove common command phrases
        let commandPhrases = ["add task", "create task", "new task", "remind me to", "i need to"]
        for phrase in commandPhrases {
            title = title.replacingOccurrences(of: phrase, with: "", options: .caseInsensitive)
        }
        
        title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !title.isEmpty else { return nil }
        
        return Task(
            title: title,
            category: category,
            priority: priority,
            dueDate: dueDate
        )
    }
    
    // MARK: - Smart Suggestions
    func getSuggestedCategory(from text: String) -> String? {
        let lowercased = text.lowercased()
        
        // Work-related keywords
        if lowercased.contains("meeting") || lowercased.contains("email") || 
           lowercased.contains("presentation") || lowercased.contains("deadline") {
            return "Work"
        }
        
        // Shopping keywords
        if lowercased.contains("buy") || lowercased.contains("purchase") || 
           lowercased.contains("groceries") || lowercased.contains("store") {
            return "Shopping"
        }
        
        // Health keywords
        if lowercased.contains("doctor") || lowercased.contains("appointment") || 
           lowercased.contains("medicine") || lowercased.contains("hospital") {
            return "Health"
        }
        
        // Fitness keywords
        if lowercased.contains("gym") || lowercased.contains("workout") || 
           lowercased.contains("exercise") || lowercased.contains("run") {
            return "Fitness"
        }
        
        // Social keywords
        if lowercased.contains("friend") || lowercased.contains("party") || 
           lowercased.contains("dinner") || lowercased.contains("lunch") {
            return "Social"
        }
        
        return nil
    }
}

// MARK: - Voice Command Button View
struct VoiceCommandButtonView: View {
    @StateObject private var voiceManager = VoiceCommandManager()
    @StateObject private var dataManager = DataManager.shared
    @State private var showingTaskPreview = false
    @State private var parsedTask: Task?
    
    var body: some View {
        VStack {
            Button(action: toggleRecording) {
                ZStack {
                    Circle()
                        .fill(voiceManager.isRecording ? Color.red : Color.accentColor)
                        .frame(width: 60, height: 60)
                        .shadow(color: Color.black.opacity(0.3), radius: 8, x: 0, y: 4)
                    
                    if voiceManager.isRecording {
                        Image(systemName: "waveform")
                            .font(.system(size: 24))
                            .foregroundColor(.white)
                            .symbolEffect(.pulse, isActive: voiceManager.isRecording)
                    } else {
                        Image(systemName: "mic.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.white)
                    }
                }
            }
            .disabled(!voiceManager.isAuthorized)
            
            if voiceManager.isRecording {
                Text("Listening...")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .padding(.top, 4)
            }
        }
        .sheet(isPresented: $showingTaskPreview) {
            if let task = parsedTask {
                VoiceTaskPreviewView(task: task, transcribedText: voiceManager.transcribedText)
            }
        }
        .onChange(of: voiceManager.transcribedText) { _, newValue in
            if !newValue.isEmpty && !voiceManager.isRecording {
                // Parse and show preview
                if let task = voiceManager.parseVoiceCommand(newValue) {
                    parsedTask = task
                    showingTaskPreview = true
                }
            }
        }
        .alert("Voice Recognition Error", isPresented: .constant(voiceManager.errorMessage != nil)) {
            Button("OK") { voiceManager.errorMessage = nil }
        } message: {
            if let error = voiceManager.errorMessage {
                Text(error)
            }
        }
    }
    
    private func toggleRecording() {
        if voiceManager.isRecording {
            voiceManager.stopRecording()
        } else {
            voiceManager.startRecording()
        }
    }
}

// MARK: - Voice Task Preview View
struct VoiceTaskPreviewView: View {
    let task: Task
    let transcribedText: String
    @Environment(\.dismiss) var dismiss
    @StateObject private var dataManager = DataManager.shared
    
    @State private var editedTitle: String
    @State private var editedCategory: String?
    @State private var editedPriority: Priority
    @State private var editedDueDate: Date?
    @State private var hasDueDate: Bool
    
    init(task: Task, transcribedText: String) {
        self.task = task
        self.transcribedText = transcribedText
        _editedTitle = State(initialValue: task.title)
        _editedCategory = State(initialValue: task.category)
        _editedPriority = State(initialValue: task.priority)
        _editedDueDate = State(initialValue: task.dueDate)
        _hasDueDate = State(initialValue: task.dueDate != nil)
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("What I Heard")) {
                    Text(transcribedText)
                        .foregroundColor(.secondary)
                        .italic()
                }
                
                Section(header: Text("Task Details")) {
                    TextField("Task title", text: $editedTitle)
                    
                    Picker("Category", selection: $editedCategory) {
                        Text("None").tag(nil as String?)
                        ForEach(dataManager.categories) { category in
                            Text(category.name).tag(category.name as String?)
                        }
                    }
                    
                    Picker("Priority", selection: $editedPriority) {
                        ForEach(Priority.allCases, id: \.self) { priority in
                            HStack {
                                Text(priority.emoji)
                                Text(priority.rawValue.capitalized)
                            }
                            .tag(priority)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                }
                
                Section(header: Text("Due Date")) {
                    Toggle("Set due date", isOn: $hasDueDate)
                    
                    if hasDueDate {
                        DatePicker("Date", selection: Binding(
                            get: { editedDueDate ?? Date() },
                            set: { editedDueDate = $0 }
                        ), displayedComponents: [.date, .hourAndMinute])
                    }
                }
            }
            .navigationTitle("Confirm Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        createTask()
                    }
                    .disabled(editedTitle.isEmpty)
                }
            }
        }
    }
    
    private func createTask() {
        let newTask = Task(
            title: editedTitle,
            category: editedCategory,
            priority: editedPriority,
            dueDate: hasDueDate ? editedDueDate : nil
        )
        
        dataManager.addTask(newTask)
        
        // Haptic feedback
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(.success)
        
        dismiss()
    }
}

// MARK: - Preview
struct VoiceCommandButtonView_Previews: PreviewProvider {
    static var previews: some View {
        VoiceCommandButtonView()
    }
}
