import SwiftUI
import LocalAuthentication
import Security

// MARK: - Authentication Manager
class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var biometricsEnabled = false
    @Published var hasPIN = false
    @Published var biometricType: BiometricType = .none
    @Published var errorMessage: String?
    @Published var requiresAuth = false
    
    private let context = LAContext()
    private let pinKey = "user_pin"
    private let biometricsEnabledKey = "biometrics_enabled"
    private let requiresAuthKey = "requires_authentication"
    
    enum BiometricType {
        case none
        case faceID
        case touchID
        
        var icon: String {
            switch self {
            case .none: return "lock.fill"
            case .faceID: return "faceid"
            case .touchID: return "touchid"
            }
        }
        
        var displayName: String {
            switch self {
            case .none: return "None"
            case .faceID: return "Face ID"
            case .touchID: return "Touch ID"
            }
        }
    }
    
    init() {
        loadSettings()
        checkBiometricType()
    }
    
    // MARK: - Biometric Type Check
    private func checkBiometricType() {
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            biometricType = .none
            return
        }
        
        switch context.biometryType {
        case .faceID:
            biometricType = .faceID
        case .touchID:
            biometricType = .touchID
        case .opticID:
            biometricType = .faceID // Treat Optic ID like Face ID
        case .none:
            biometricType = .none
        @unknown default:
            biometricType = .none
        }
    }
    
    // MARK: - Biometric Authentication
    func authenticateWithBiometrics(completion: @escaping (Bool) -> Void) {
        let context = LAContext()
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            DispatchQueue.main.async {
                self.errorMessage = error?.localizedDescription ?? "Biometric authentication not available"
            }
            completion(false)
            return
        }
        
        let reason = "Authenticate to access your planner"
        
        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, error in
            DispatchQueue.main.async {
                if success {
                    self.isAuthenticated = true
                    completion(true)
                } else {
                    self.errorMessage = error?.localizedDescription ?? "Authentication failed"
                    completion(false)
                }
            }
        }
    }
    
    // MARK: - PIN Authentication
    func setupPIN(_ pin: String) -> Bool {
        guard pin.count >= 4 else {
            errorMessage = "PIN must be at least 4 digits"
            return false
        }
        
        // Hash the PIN before storing
        let hashedPIN = hashPIN(pin)
        
        // Store in Keychain
        let data = Data(hashedPIN.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: pinKey,
            kSecValueData as String: data
        ]
        
        // Delete any existing PIN
        SecItemDelete(query as CFDictionary)
        
        // Add new PIN
        let status = SecItemAdd(query as CFDictionary, nil)
        
        if status == errSecSuccess {
            hasPIN = true
            saveSettings()
            return true
        } else {
            errorMessage = "Failed to save PIN"
            return false
        }
    }
    
    func authenticateWithPIN(_ pin: String) -> Bool {
        let hashedPIN = hashPIN(pin)
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: pinKey,
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let storedPIN = String(data: data, encoding: .utf8) else {
            errorMessage = "Failed to retrieve PIN"
            return false
        }
        
        if storedPIN == hashedPIN {
            isAuthenticated = true
            return true
        } else {
            errorMessage = "Incorrect PIN"
            return false
        }
    }
    
    func deletePIN() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: pinKey
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        
        if status == errSecSuccess || status == errSecItemNotFound {
            hasPIN = false
            saveSettings()
            return true
        }
        
        return false
    }
    
    private func hashPIN(_ pin: String) -> String {
        // Simple hash (in production, use a proper hashing algorithm)
        return String(pin.hashValue)
    }
    
    // MARK: - Session Management
    func logout() {
        isAuthenticated = false
    }
    
    func shouldRequireAuthentication() -> Bool {
        return requiresAuth && (biometricsEnabled || hasPIN)
    }
    
    // MARK: - Settings Persistence
    private func saveSettings() {
        UserDefaults.standard.set(biometricsEnabled, forKey: biometricsEnabledKey)
        UserDefaults.standard.set(requiresAuth, forKey: requiresAuthKey)
        UserDefaults.standard.set(hasPIN, forKey: "has_pin")
    }
    
    private func loadSettings() {
        biometricsEnabled = UserDefaults.standard.bool(forKey: biometricsEnabledKey)
        requiresAuth = UserDefaults.standard.bool(forKey: requiresAuthKey)
        hasPIN = UserDefaults.standard.bool(forKey: "has_pin")
    }
    
    func toggleBiometrics(_ enabled: Bool) {
        biometricsEnabled = enabled
        saveSettings()
    }
    
    func toggleRequireAuth(_ enabled: Bool) {
        requiresAuth = enabled
        saveSettings()
    }
}

// MARK: - Login View
struct LoginView: View {
    @StateObject private var authManager = AuthenticationManager()
    @State private var pin = ""
    @State private var showingPINPad = false
    @Binding var isAuthenticated: Bool
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [Color.accentColor.opacity(0.6), Color.accentColor]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 40) {
                // App Icon
                VStack(spacing: 16) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 80))
                        .foregroundColor(.white)
                    
                    Text("My Planner")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("Secure Access")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.8))
                }
                
                VStack(spacing: 20) {
                    // Biometric Auth Button
                    if authManager.biometricType != .none && authManager.biometricsEnabled {
                        Button(action: authenticateWithBiometrics) {
                            HStack {
                                Image(systemName: authManager.biometricType.icon)
                                    .font(.title2)
                                Text("Unlock with \(authManager.biometricType.displayName)")
                                    .font(.headline)
                            }
                            .foregroundColor(.accentColor)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white)
                            .cornerRadius(12)
                        }
                    }
                    
                    // PIN Button
                    if authManager.hasPIN {
                        Button(action: { showingPINPad = true }) {
                            HStack {
                                Image(systemName: "lock.fill")
                                    .font(.title2)
                                Text("Enter PIN")
                                    .font(.headline)
                            }
                            .foregroundColor(.accentColor)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white)
                            .cornerRadius(12)
                        }
                    }
                }
                .padding(.horizontal, 40)
                
                if let error = authManager.errorMessage {
                    Text(error)
                        .foregroundColor(.white)
                        .padding()
                        .background(Color.red.opacity(0.8))
                        .cornerRadius(8)
                        .padding(.horizontal)
                }
            }
        }
        .sheet(isPresented: $showingPINPad) {
            PINPadView(authManager: authManager, isAuthenticated: $isAuthenticated)
        }
        .onAppear {
            // Auto-attempt biometric auth
            if authManager.biometricType != .none && authManager.biometricsEnabled {
                authenticateWithBiometrics()
            }
        }
        .onChange(of: authManager.isAuthenticated) { newValue in
            isAuthenticated = newValue
        }
    }
    
    private func authenticateWithBiometrics() {
        authManager.authenticateWithBiometrics { success in
            if success {
                isAuthenticated = true
            }
        }
    }
}

// MARK: - PIN Pad View
struct PINPadView: View {
    @ObservedObject var authManager: AuthenticationManager
    @Binding var isAuthenticated: Bool
    @Environment(\.dismiss) var dismiss
    
    @State private var enteredPIN = ""
    @State private var showError = false
    
    private let pinLength = 4
    
    var body: some View {
        NavigationView {
            VStack(spacing: 40) {
                // Title
                Text("Enter PIN")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                // PIN Display
                HStack(spacing: 20) {
                    ForEach(0..<pinLength, id: \.self) { index in
                        Circle()
                            .fill(index < enteredPIN.count ? Color.accentColor : Color.gray.opacity(0.3))
                            .frame(width: 20, height: 20)
                    }
                }
                .padding()
                
                // Number Pad
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 20) {
                    ForEach(1...9, id: \.self) { number in
                        NumberButton(number: "\(number)") {
                            addDigit("\(number)")
                        }
                    }
                    
                    // Empty space
                    Color.clear
                        .frame(height: 70)
                    
                    NumberButton(number: "0") {
                        addDigit("0")
                    }
                    
                    Button(action: deleteDigit) {
                        Image(systemName: "delete.left.fill")
                            .font(.title2)
                            .foregroundColor(.accentColor)
                            .frame(width: 70, height: 70)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal, 40)
                
                Spacer()
            }
            .padding(.top, 40)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Incorrect PIN", isPresented: $showError) {
                Button("OK") {
                    enteredPIN = ""
                }
            }
        }
    }
    
    private func addDigit(_ digit: String) {
        guard enteredPIN.count < pinLength else { return }
        enteredPIN += digit
        
        if enteredPIN.count == pinLength {
            verifyPIN()
        }
    }
    
    private func deleteDigit() {
        if !enteredPIN.isEmpty {
            enteredPIN.removeLast()
        }
    }
    
    private func verifyPIN() {
        if authManager.authenticateWithPIN(enteredPIN) {
            isAuthenticated = true
            dismiss()
        } else {
            showError = true
        }
    }
}

// MARK: - Number Button
struct NumberButton: View {
    let number: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(number)
                .font(.title)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
                .frame(width: 70, height: 70)
                .background(Color(.systemGray6))
                .clipShape(Circle())
        }
    }
}

// MARK: - Security Settings View
struct SecuritySettingsView: View {
    @StateObject private var authManager = AuthenticationManager()
    @State private var showingSetupPIN = false
    @State private var showingDeletePINAlert = false
    
    var body: some View {
        Form {
            Section(header: Text("Authentication")) {
                Toggle("Require Authentication", isOn: Binding(
                    get: { authManager.requiresAuth },
                    set: { authManager.toggleRequireAuth($0) }
                ))
                
                if authManager.requiresAuth {
                    if authManager.biometricType != .none {
                        Toggle(authManager.biometricType.displayName, isOn: Binding(
                            get: { authManager.biometricsEnabled },
                            set: { authManager.toggleBiometrics($0) }
                        ))
                    }
                    
                    if authManager.hasPIN {
                        HStack {
                            Label("PIN Code", systemImage: "lock.fill")
                            Spacer()
                            Button("Change") {
                                showingSetupPIN = true
                            }
                            Button("Remove") {
                                showingDeletePINAlert = true
                            }
                            .foregroundColor(.red)
                        }
                    } else {
                        Button(action: { showingSetupPIN = true }) {
                            Label("Set Up PIN", systemImage: "plus.circle.fill")
                        }
                    }
                }
            }
            
            Section(header: Text("Security Info")) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("• Enable authentication to secure your planner data")
                    Text("• Use \(authManager.biometricType.displayName) for quick access")
                    Text("• PIN provides backup authentication method")
                    Text("• Data is encrypted when authentication is enabled")
                }
                .font(.caption)
                .foregroundColor(.secondary)
            }
        }
        .navigationTitle("Security")
        .sheet(isPresented: $showingSetupPIN) {
            SetupPINView(authManager: authManager)
        }
        .alert("Remove PIN", isPresented: $showingDeletePINAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Remove", role: .destructive) {
                _ = authManager.deletePIN()
            }
        } message: {
            Text("Are you sure you want to remove your PIN? You'll need to set up a new PIN to use PIN authentication.")
        }
    }
}

// MARK: - Setup PIN View
struct SetupPINView: View {
    @ObservedObject var authManager: AuthenticationManager
    @Environment(\.dismiss) var dismiss
    
    @State private var pin = ""
    @State private var confirmPIN = ""
    @State private var isConfirming = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    private let pinLength = 4
    
    var body: some View {
        NavigationView {
            VStack(spacing: 40) {
                Text(isConfirming ? "Confirm PIN" : "Set New PIN")
                    .font(.title2)
                    .fontWeight(.semibold)
                
                HStack(spacing: 20) {
                    ForEach(0..<pinLength, id: \.self) { index in
                        Circle()
                            .fill(index < currentPIN.count ? Color.accentColor : Color.gray.opacity(0.3))
                            .frame(width: 20, height: 20)
                    }
                }
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 20) {
                    ForEach(1...9, id: \.self) { number in
                        NumberButton(number: "\(number)") {
                            addDigit("\(number)")
                        }
                    }
                    
                    Color.clear.frame(height: 70)
                    
                    NumberButton(number: "0") {
                        addDigit("0")
                    }
                    
                    Button(action: deleteDigit) {
                        Image(systemName: "delete.left.fill")
                            .font(.title2)
                            .foregroundColor(.accentColor)
                            .frame(width: 70, height: 70)
                            .background(Color(.systemGray6))
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal, 40)
                
                Spacer()
            }
            .padding(.top, 40)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
            .alert("Error", isPresented: $showError) {
                Button("OK") {
                    pin = ""
                    confirmPIN = ""
                    isConfirming = false
                }
            } message: {
                Text(errorMessage)
            }
        }
    }
    
    private var currentPIN: String {
        isConfirming ? confirmPIN : pin
    }
    
    private func addDigit(_ digit: String) {
        if isConfirming {
            guard confirmPIN.count < pinLength else { return }
            confirmPIN += digit
            
            if confirmPIN.count == pinLength {
                verifyPINs()
            }
        } else {
            guard pin.count < pinLength else { return }
            pin += digit
            
            if pin.count == pinLength {
                isConfirming = true
            }
        }
    }
    
    private func deleteDigit() {
        if isConfirming {
            if !confirmPIN.isEmpty {
                confirmPIN.removeLast()
            }
        } else {
            if !pin.isEmpty {
                pin.removeLast()
            }
        }
    }
    
    private func verifyPINs() {
        if pin == confirmPIN {
            if authManager.setupPIN(pin) {
                dismiss()
            } else {
                errorMessage = authManager.errorMessage ?? "Failed to set PIN"
                showError = true
            }
        } else {
            errorMessage = "PINs do not match. Please try again."
            showError = true
        }
    }
}

// MARK: - Preview
struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView(isAuthenticated: .constant(false))
    }
}
