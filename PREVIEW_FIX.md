# XCODE PREVIEW FIX

## Issue:
Preview crashes with error: "Preview is missing object 'ThemeManager'"

## Cause:
Views using `@EnvironmentObject var themeManager: ThemeManager` need the environment object injected in previews.

## Solution:
Add `.environmentObject(ThemeManager.shared)` to all previews that use ThemeManager.

## Fixed Previews:

### ContentView
```swift
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .environmentObject(ThemeManager.shared)  // ← Added this
    }
}
```

### SettingsView
```swift
struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        SettingsView()
            .environmentObject(ThemeManager.shared)  // ← Added this
    }
}
```

### ThemeSelectorView
No preview defined - add one if needed:
```swift
struct ThemeSelectorView_Previews: PreviewProvider {
    static var previews: some View {
        ThemeSelectorView()
            .environmentObject(ThemeManager.shared)
    }
}
```

## General Pattern:
For ANY view that uses `@EnvironmentObject`, inject it in the preview:

```swift
struct MyView: View {
    @EnvironmentObject var themeManager: ThemeManager  // ← Uses environment object
    
    var body: some View {
        Text("Hello")
    }
}

struct MyView_Previews: PreviewProvider {
    static var previews: some View {
        MyView()
            .environmentObject(ThemeManager.shared)  // ← Must inject in preview
    }
}
```

## Why This Happens:
- At runtime: App root injects themeManager via `.environmentObject(themeManager)`
- In preview: No app root, so you must manually inject it
- Without injection: SwiftUI can't find the required environment object → crash

## All Previews Should Now Work! ✅
