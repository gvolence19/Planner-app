# Quick Start Guide - Setting Up Your Xcode Project

Follow these steps to get your iOS Planner app up and running:

## Step 1: Create New Xcode Project

1. Open Xcode
2. Click "Create a new Xcode project"
3. Select **iOS** → **App**
4. Fill in project details:
   - **Product Name**: `MyPlanner` (or your preferred name)
   - **Team**: Select your Apple Developer team (or None for simulator testing)
   - **Organization Identifier**: `com.yourname.planner` (use your own identifier)
   - **Bundle Identifier**: Will auto-generate as `com.yourname.planner.MyPlanner`
   - **Interface**: **SwiftUI**
   - **Language**: **Swift**
   - **Storage**: None needed
   - **Include Tests**: Optional (recommended)
5. Click "Next" and choose a location to save
6. Click "Create"

## Step 2: Add Source Files to Project

### Method A: Drag and Drop
1. In Xcode, select your project in the Navigator (left sidebar)
2. Open Finder and navigate to the `PlannerApp-iOS` folder
3. Select all `.swift` files
4. Drag them into your Xcode project
5. When prompted:
   - ✅ Check "Copy items if needed"
   - ✅ Check your app target under "Add to targets"
   - Click "Finish"

### Method B: Add Files Individually
1. Right-click on your project folder in Xcode
2. Select "Add Files to [ProjectName]..."
3. Navigate to each `.swift` file and add it
4. Repeat for all files

## Step 3: Replace Default Files

1. **Delete the default `ContentView.swift`** that Xcode created
   - Right-click → Delete → Move to Trash

2. **Delete the default App file** (e.g., `MyPlannerApp.swift`)
   - Right-click → Delete → Move to Trash

3. **Replace with our files**:
   - Our `PlannerApp.swift` becomes your main app file
   - Our `ContentView.swift` is the main view

## Step 4: Update Info.plist

1. In Xcode, select `Info.plist` in the Navigator
2. Delete it or clear its contents
3. Copy the contents from the provided `Info.plist` file
4. Paste into your project's Info.plist

**Or simply:**
- Delete the default Info.plist
- Drag our Info.plist into the project

## Step 5: File Checklist

Make sure all these files are in your Xcode project:

- ✅ `PlannerApp.swift` - Main app entry point
- ✅ `Models.swift` - Data models
- ✅ `DataManager.swift` - Data management
- ✅ `ContentView.swift` - Main content view
- ✅ `TaskListView.swift` - Task list screen
- ✅ `AddTaskView.swift` - Add/Edit task screens  
- ✅ `CalendarView.swift` - Calendar view
- ✅ `GroceryListView.swift` - Grocery list
- ✅ `MealsAndSleepViews.swift` - Premium features
- ✅ `SettingsView.swift` - Settings screen
- ✅ `Info.plist` - App configuration

## Step 6: Build and Run

1. Select a simulator from the device menu (e.g., "iPhone 15 Pro")
2. Click the **Play** button (▶️) or press `⌘R`
3. Wait for the app to build and launch in the simulator
4. The app should launch showing the task list view!

## Step 7: Test the App

Try these features:
1. Add a new task using the + button
2. Toggle dark mode in settings
3. Switch between different views (Tasks, Calendar, Grocery)
4. Create a grocery item
5. Try the premium features (already unlocked for testing)

## Troubleshooting

### "No such module" errors
- Make sure all files are added to the target
- Clean build folder: `Shift + ⌘ + K`
- Rebuild: `⌘ + B`

### UI not showing correctly
- Make sure you deleted the default ContentView.swift
- Verify PlannerApp.swift is set as the main app entry point

### Build fails
- Check that all files have your target selected in File Inspector
- Verify Swift version matches (should auto-detect)
- Make sure no duplicate files exist

### Missing UserNotifications
Add at top of PlannerApp.swift if needed:
```swift
import UserNotifications
```

## Next Steps

### For Simulator Testing
You're all set! The app will work in the simulator with full functionality.

### For Device Testing
1. Connect your iPhone/iPad
2. Select your device from the device menu
3. You may need to enable Developer Mode on your device
4. Trust your computer on the device when prompted
5. Build and run

### For App Store Submission
See the main README.md for detailed steps on:
- Creating app icons
- Taking screenshots
- Setting up App Store Connect
- Submitting for review

## Quick Reference

### Xcode Keyboard Shortcuts
- `⌘R` - Build and run
- `⌘B` - Build only
- `⌘.` - Stop running
- `Shift + ⌘ + K` - Clean build folder
- `⌘ + Option + P` - Resume preview (SwiftUI preview)

### Simulator Tips
- Use `⌘ + Shift + H` to go to home screen
- `⌘ + Shift + H` twice for app switcher
- Hardware → Toggle Dark Appearance for dark mode testing

## Support

If you run into issues:
1. Check the main README.md for detailed information
2. Review error messages carefully
3. Clean and rebuild the project
4. Try restarting Xcode
5. Check that all files are properly added to the target

---

**You're ready to go! Start building your iOS Planner app! 🎉**
