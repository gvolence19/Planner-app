import SwiftUI
import Speech
import AVFoundation

// MARK: - Voice Command Manager
class VoiceCommandManager: NSObject, ObservableObject {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    @Published var isRecording = false
    @Published var transcribedText = ""
    @Published var isAuthorized = false
    @Published var errorMessage: String?
    
    override init() {
        super.init()
        requestAuthorization()
    }
    
    func requestAuthorization() {
        SFSpeechRecognizer.requestAuthorization { [weak self] authStatus in
            DispatchQueue.main.async {
                switch authStatus {
                case .authorized:
                    self?.isAuthorized = true
                case .denied, .restricted, .notDetermined:
                    self?.isAuthorized = false
                    self?.errorMessage = "Speech recognition not authorized"
                @unknown default:
                    self?.isAuthorized = false
                }
            }
        }
    }
    
    func startRecording() {
        guard isAuthorized else { return }
        
        if recognitionTask != nil {
            recognitionTask?.cancel()
            recognitionTask = nil
        }
        
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.record, mode: .measurement, options: .duckOthers)
            try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            return
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { return }
        recognitionRequest.shouldReportPartialResults = true
        
        let inputNode = audioEngine.inputNode
        
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest) { [weak self] result, error in
            if let result = result {
                DispatchQueue.main.async {
                    self?.transcribedText = result.bestTranscription.formattedString
                }
            }
            
            if error != nil || result?.isFinal == true {
                self?.audioEngine.stop()
                inputNode.removeTap(onBus: 0)
                self?.recognitionRequest = nil
                self?.recognitionTask = nil
                DispatchQueue.main.async {
                    self?.isRecording = false
                }
            }
        }
        
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        audioEngine.prepare()
        do {
            try audioEngine.start()
            DispatchQueue.main.async {
                self.isRecording = true
                self.transcribedText = ""
            }
        } catch { }
    }
    
    func stopRecording() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        isRecording = false
    }
    
    func parseVoiceCommand(_ text: String) -> Task? {
        let lowercased = text.lowercased()
        var title = text
        var category: String?
        var priority: Priority = .medium
        var dueDate: Date?
        
        if lowercased.contains("high priority") || lowercased.contains("urgent") {
            priority = .high
            title = title.replacingOccurrences(of: "high priority", with: "", options: .caseInsensitive)
            title = title.replacingOccurrences(of: "urgent", with: "", options: .caseInsensitive)
        } else if lowercased.contains("low priority") {
            priority = .low
            title = title.replacingOccurrences(of: "low priority", with: "", options: .caseInsensitive)
        }
        
        let categories = ["Work", "Personal", "Shopping", "Health", "Fitness"]
        for cat in categories {
            if lowercased.contains(cat.lowercased()) {
                category = cat
                break
            }
        }
        
        if lowercased.contains("today") {
            dueDate = Date()
            title = title.replacingOccurrences(of: "today", with: "", options: .caseInsensitive)
        } else if lowercased.contains("tomorrow") {
            dueDate = Calendar.current.date(byAdding: .day, value: 1, to: Date())
            title = title.replacingOccurrences(of: "tomorrow", with: "", options: .caseInsensitive)
        }
        
        title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let commandPhrases = ["add task", "create task", "new task", "remind me to"]
        for phrase in commandPhrases {
            title = title.replacingOccurrences(of: phrase, with: "", options: .caseInsensitive)
        }
        title = title.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !title.isEmpty else { return nil }
        
        return Task(title: title, category: category, priority: priority, dueDate: dueDate)
    }
}

// MARK: - Voice Command Button
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
                        .shadow(radius: 5)
                    
                    Image(systemName: voiceManager.isRecording ? "waveform" : "mic.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.white)
                }
            }
            .disabled(!voiceManager.isAuthorized)
            
            if voiceManager.isRecording {
                Text("Listening...")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .sheet(isPresented: $showingTaskPreview) {
            if let task = parsedTask {
                VoiceTaskPreviewView(task: task, transcribedText: voiceManager.transcribedText)
            }
        }
        .onChange(of: voiceManager.transcribedText) { oldValue, newValue in
            if !newValue.isEmpty && !voiceManager.isRecording {
                if let task = voiceManager.parseVoiceCommand(newValue) {
                    parsedTask = task
                    showingTaskPreview = true
                }
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

// MARK: - Voice Task Preview
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
                            Text(priority.rawValue.capitalized).tag(priority)
                        }
                    }
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
                    Button("Create") { createTask() }
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
        dismiss()
    }
}
