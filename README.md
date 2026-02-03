# My Planner - iOS App

A comprehensive task management and planning app for iOS, converted from a React web application to native SwiftUI.

## Features

### Core Features (Free)
- ✅ **Task Management**: Create, edit, and organize tasks with categories, priorities, and due dates
- 📅 **Calendar View**: Visualize your tasks in an interactive calendar interface
- 🛒 **Grocery Lists**: Manage your shopping items with categories and quantities
- 🔍 **Search & Filter**: Find tasks quickly with powerful search and filtering
- 🎨 **Categories**: Organize tasks with customizable categories and icons
- 🌓 **Dark Mode**: Full dark mode support for comfortable viewing
- 💾 **Local Storage**: All data stored securely on your device

### Premium Features
- 🍽 **Meal Planning**: Plan your meals with recurring reminders
- 😴 **Sleep Tracking**: Track and manage your sleep schedule
- 📊 **Projects**: Organize tasks into projects
- 📝 **Task Templates**: Create reusable task templates
- 🎯 **Advanced Filters**: Filter tasks by multiple criteria

## Screenshots

[Add screenshots here when building the app]

## Requirements

- iOS 15.0 or later
- Xcode 14.0 or later
- Swift 5.7 or later

## Installation

### Option 1: Build from Source

1. **Clone or download this project**
   ```bash
   # If you have the files, they're already in PlannerApp-iOS folder
   ```

2. **Create an Xcode Project**
   - Open Xcode
   - Select "Create a new Xcode project"
   - Choose "iOS" → "App"
   - Product Name: `My Planner`
   - Organization Identifier: `com.yourcompany.planner` (use your own)
   - Interface: SwiftUI
   - Language: Swift
   - Click "Next" and save the project

3. **Add the Source Files**
   - Delete the default `ContentView.swift` created by Xcode
   - Add all the `.swift` files from this folder to your project:
     * `PlannerApp.swift` (replace the default App file)
     * `Models.swift`
     * `DataManager.swift`
     * `ContentView.swift`
     * `TaskListView.swift`
     * `AddTaskView.swift`
     * `CalendarView.swift`
     * `GroceryListView.swift`
     * `MealsAndSleepViews.swift`
     * `SettingsView.swift`

4. **Replace Info.plist**
   - Replace the default Info.plist with the one provided

5. **Build and Run**
   - Select a simulator or your device
   - Click the "Play" button or press ⌘R

### Option 2: Download from App Store (Coming Soon)

The app will be available on the App Store once submitted.

## Project Structure

```
PlannerApp-iOS/
├── PlannerApp.swift           # Main app entry point
├── Models.swift                # Data models (Task, Category, etc.)
├── DataManager.swift           # Data persistence and management
├── ContentView.swift           # Main view with tab navigation
├── TaskListView.swift          # Task list view
├── AddTaskView.swift          # Add/Edit task screens
├── CalendarView.swift         # Calendar view
├── GroceryListView.swift      # Grocery list view
├── MealsAndSleepViews.swift   # Meals and sleep tracking (Premium)
├── SettingsView.swift         # Settings and preferences
└── Info.plist                 # App configuration
```

## Architecture

The app follows SwiftUI best practices:

- **MVVM Pattern**: Clear separation between views and data
- **ObservableObject**: For reactive data management
- **UserDefaults**: For local data persistence
- **Codable**: For easy data serialization
- **@Published**: For automatic UI updates
- **Environment Objects**: For sharing data across views

## Data Models

### Task
- Title, description, completion status
- Due date, category, priority
- Recurring options (daily, weekly, monthly)
- Location, start time, duration
- AI suggestion metadata

### Category
- Name, color, icon
- Customizable by users

### Grocery Item
- Name, quantity, category
- Checked status, notes

### Project (Premium)
- Name, description, color
- Associated task IDs

## Key Features Implementation

### Local Storage
All data is stored locally using `UserDefaults` with `Codable` conformance. This provides:
- Fast read/write operations
- Automatic persistence
- Privacy (data never leaves the device)

### Dark Mode
Implemented using SwiftUI's built-in color schemes:
- Automatic system theme detection
- Manual toggle in settings
- Persistent user preference

### Notifications
Configured to request permissions on first launch for:
- Task reminders
- Due date alerts
- Meal reminders (Premium)

## Preparing for App Store Submission

### 1. App Icon
Create an app icon in these sizes:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 76x76 (iPad)
- 152x152 (iPad)

Add them to `Assets.xcassets/AppIcon.appiconset/`

### 2. Screenshots
Required screenshots for App Store:
- 6.7" (iPhone 15 Pro Max): 1290 x 2796 pixels
- 6.5" (iPhone 14 Pro Max): 1284 x 2778 pixels  
- 5.5" (iPhone 8 Plus): 1242 x 2208 pixels
- 12.9" iPad Pro: 2048 x 2732 pixels

### 3. Privacy Policy
Create a privacy policy and host it online. Update the URL in `SettingsView.swift`

### 4. App Store Connect
1. Create an account at https://developer.apple.com
2. Enroll in Apple Developer Program ($99/year)
3. Create an App Store Connect listing
4. Fill in app metadata:
   - Description
   - Keywords
   - Screenshots
   - Privacy policy URL
   - Support URL

### 5. Build and Archive
In Xcode:
1. Select "Any iOS Device" as the target
2. Product → Archive
3. Validate the archive
4. Distribute to App Store

### 6. TestFlight (Optional but Recommended)
Upload to TestFlight first for beta testing:
- Invite testers
- Collect feedback
- Fix issues before public release

## In-App Purchases (Premium Features)

To enable premium features with actual payment:

1. **Create In-App Purchase in App Store Connect**
   - Type: Auto-Renewable Subscription
   - Product ID: `com.yourcompany.planner.premium`
   - Pricing: Set your pricing tier

2. **Implement StoreKit**
   - Add StoreKit framework
   - Implement purchase flow
   - Handle subscription status
   - Restore purchases functionality

3. **Update DataManager**
   - Replace mock `isPremium` with actual subscription check
   - Validate receipt with Apple's servers

## Testing

### Manual Testing Checklist
- [ ] Create, edit, delete tasks
- [ ] Set task priorities and categories
- [ ] Add due dates and recurring tasks
- [ ] View tasks in calendar
- [ ] Create and manage grocery lists
- [ ] Premium features (with mock premium enabled)
- [ ] Dark mode toggle
- [ ] Settings persistence
- [ ] Data persistence after app restart

### Automated Testing
Add XCTest files for:
- Model validation
- Data persistence
- Business logic
- View state management

## Localization

To support multiple languages:

1. **Add Localizable.strings**
   - English (Base)
   - Add additional languages as needed

2. **Use NSLocalizedString**
   - Replace hardcoded strings
   - Test with different languages

## Accessibility

The app includes basic accessibility:
- Semantic labels
- Dynamic type support
- VoiceOver compatibility

To enhance:
- Add accessibility hints
- Test with VoiceOver
- Ensure color contrast ratios

## Performance Optimization

Current optimizations:
- Lazy loading in lists
- Efficient data structures
- Minimal re-renders

Future improvements:
- Core Data for larger datasets
- Background data sync
- Image caching

## Known Limitations

1. **No Cloud Sync**: Data is local only (could add iCloud later)
2. **No Authentication**: No user accounts (web app had this)
3. **Basic Calendar**: No Google Calendar sync (web app had this)
4. **No Voice Commands**: Web app feature not implemented
5. **No AI Suggestions**: Advanced AI features simplified

## Future Enhancements

- [ ] iCloud sync for cross-device access
- [ ] Widget support for home screen
- [ ] Apple Watch companion app
- [ ] Siri shortcuts integration
- [ ] Share tasks via Messages
- [ ] Export to Calendar app
- [ ] Collaboration features
- [ ] Advanced statistics and insights

## Troubleshooting

### Build Errors
- Ensure all files are added to target membership
- Check for Swift version compatibility
- Clean build folder (Shift + Cmd + K)

### Data Not Persisting
- Check UserDefaults keys match
- Verify Codable conformance
- Test on device (not just simulator)

### UI Not Updating
- Verify @Published properties
- Check ObservableObject conformance
- Ensure @StateObject usage

## Support

For issues or questions:
- Create an issue in the GitHub repository
- Email: support@yourcompany.com
- Documentation: https://yourcompany.com/docs

## License

[Add your license here - e.g., MIT, Apache 2.0, etc.]

## Credits

Converted from the original React web application to SwiftUI for iOS.

Original web app features:
- React + TypeScript
- Google Calendar integration
- Advanced AI task suggestions
- Voice commands
- Web authentication

iOS conversion maintains core functionality while following iOS design guidelines and using native SwiftUI components.

## Version History

### 1.0.0 (Current)
- Initial iOS release
- Core task management
- Calendar view
- Grocery lists
- Premium features (Meals & Sleep)
- Settings and customization
- Dark mode support

---

**Ready to submit to the App Store! 🚀**
