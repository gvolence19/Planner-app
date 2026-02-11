# 📱 Plannio Widgets - Implementation Guide

## 🎯 Overview

Plannio now includes beautiful Home Screen widgets as a **Premium Feature**! Users can view their tasks and events without opening the app.

---

## ✨ Widget Types

### 1. **Small Widget - Task Count** 📊
**Size:** 2x2 grid
**Content:**
- Gradient background (theme colors)
- Checkmark icon
- Today's task count (large number)
- "Tasks Today" label

**Use Case:** Quick glance at daily workload

### 2. **Medium Widget - Task List** ✅
**Size:** 4x2 grid
**Content:**
- Header with icon and title
- Task completion counter (e.g., "2/5")
- Top 3 tasks with checkboxes
- "+X more" indicator if more tasks exist
- Empty state when no tasks

**Use Case:** See specific tasks at a glance

### 3. **Large Widget - Tasks & Events** 📅
**Size:** 4x4 grid
**Content:**
- Tasks section (top 4 tasks)
- Task completion counter
- Divider with theme color
- Events section
- Top 3 upcoming events with icons and dates
- Empty states for both sections

**Use Case:** Comprehensive overview of day

---

## 🎨 Theme Integration

All widgets adapt to the user's selected theme:
- **Background gradients** use primary + secondary colors
- **Icons** use theme colors
- **Dividers** use theme color at 20% opacity
- **Text** follows iOS system colors (light/dark mode)

### Widget Appearance by Theme:

| Theme | Widget Look |
|-------|-------------|
| Classic Blue 💙 | Blue gradients, blue icons |
| Sunset Orange 🌅 | Orange gradients, orange icons |
| Forest Green 🌲 | Green gradients, green icons |
| Purple Dream 💜 | Purple gradients, purple icons |

**Result:** Widgets match the in-app experience!

---

## 🔒 Premium Lock

### For Non-Premium Users:
Widgets show a **locked state**:
- Gray gradient background
- Lock icon
- "Premium Feature" text
- "Unlock widgets in Plannio" message

### Widget Gallery Access:
- Non-premium: See widget previews with lock overlay + upgrade button
- Premium: Full gallery with "How to Add" instructions

---

## 🔄 Update Frequency

Widgets refresh automatically:
- **Every 15 minutes** via Timeline
- **On app launch** via shared data
- **Manual refresh** by tapping widget

---

## 📋 Implementation Steps

### Step 1: Add Widget Extension to Xcode

1. **Create Widget Extension:**
   ```
   File > New > Target > Widget Extension
   Name: PlannioWidgets
   Include Configuration Intent: No
   ```

2. **Add PlannioWidgets.swift** to the extension target

3. **Link Frameworks:**
   - WidgetKit
   - SwiftUI

### Step 2: Configure App Groups

Widgets need shared data access:

1. **Enable App Groups:**
   - Main App Target > Signing & Capabilities
   - Add "App Groups" capability
   - Create group: `group.com.plannio.app`

2. **Widget Extension:**
   - Add same "App Groups" capability
   - Select same group

3. **Update DataManager:**
   ```swift
   let sharedDefaults = UserDefaults(suiteName: "group.com.plannio.app")
   ```

### Step 3: Add Widget Gallery

- WidgetGalleryView.swift already created
- Shows 3 widget types with previews
- Premium lock/unlock logic
- "How to Add" instructions

### Step 4: Update Info.plist

Add to Widget Extension Info.plist:
```xml
<key>NSExtension</key>
<dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
</dict>
```

### Step 5: Build & Test

1. Select Widget Extension scheme
2. Build & Run (⌘R)
3. Choose widget size to preview
4. Long press home screen to add

---

## 🎯 Widget Behaviors

### Task List Updates:
- Shows tasks with `dueDate == today`
- Completed tasks shown with checkmark
- Strikethrough for completed
- Limited to top 3 (medium) or 4 (large)

### Event Display:
- Shows `upcomingEvents()`
- Displays next 3 events
- Smart date formatting:
  - "Today" for today
  - "Tomorrow" for tomorrow
  - "MMM d" for other dates
- Event icons from EventItem

### Empty States:
- Tasks: "No tasks today!" / "All done!"
- Events: "No upcoming events"
- Graceful handling with icons

---

## 💡 User Experience

### Adding Widgets:

1. **Long press** home screen
2. Tap **'+'** button (top left)
3. Search **"Plannio"**
4. Choose size:
   - Small: Task Count
   - Medium: Task List
   - Large: Tasks & Events
5. **Add Widget**
6. Position and done!

### Widget Interactions:

- **Tap widget** → Opens Plannio app
- **Auto-updates** every 15 minutes
- **Theme changes** reflected immediately
- **Premium check** on every display

---

## 🚀 Marketing Benefits

### App Store Features:
- "Home Screen Widgets" ✓
- "iOS 16 Widget Support" ✓
- "Premium Widgets" ✓

### User Benefits:
- ✅ Quick task access
- ✅ No need to open app
- ✅ Glanceable information
- ✅ Beautiful, themed design
- ✅ Multiple sizes for flexibility

### Premium Incentive:
- Strong reason to upgrade
- High-value feature
- Visible daily on home screen
- Seamless integration

---

## 📊 Widget Sizes Reference

### Small (2x2):
- Width: ~170 points
- Height: ~170 points
- Content: Focused, minimal

### Medium (4x2):
- Width: ~360 points
- Height: ~170 points
- Content: List-based

### Large (4x4):
- Width: ~360 points
- Height: ~376 points
- Content: Comprehensive

---

## 🔧 Troubleshooting

### Widget Not Showing:
1. Check App Groups configuration
2. Verify extension target includes files
3. Rebuild widget extension
4. Remove and re-add widget

### Data Not Updating:
1. Verify shared UserDefaults
2. Check timeline refresh
3. Ensure DataManager is shared

### Theme Not Applied:
1. Check ThemeManager singleton
2. Verify theme saved to shared storage
3. Widget entry includes theme

---

## 🎊 Result

Plannio users can now:
- ✅ View tasks on home screen
- ✅ See upcoming events
- ✅ Check task counts
- ✅ Experience themed widgets
- ✅ Access info instantly

**Widgets make Plannio more valuable and increase premium conversions!** 🚀

---

## 📝 Next Steps

1. Build widget extension
2. Test all 3 sizes
3. Try different themes
4. Test premium lock/unlock
5. Verify data updates
6. Submit to App Store!

**Your app now has professional, themeable home screen widgets!** 🎨✨
