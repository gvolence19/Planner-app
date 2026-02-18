# 🔄 Auto-Sync & Manual Sync for Calendar Integration

## ✨ What's New

Calendar integration now features:
- ⏱️ **Auto-sync every 5 minutes** - tasks automatically sync to your calendar
- 🔘 **Manual sync button** in Settings - sync on demand
- 📊 **Sync status display** - see when last synced and task count
- ⚡ **Real-time sync indicator** - know when sync is happening

---

## 🎯 How It Works

### Auto-Sync (Every 5 Minutes):
```
Timer triggers every 5 minutes
           ↓
Checks if sync is enabled
           ↓
Checks if authorized
           ↓
Syncs all incomplete tasks with due dates
           ↓
Updates last sync time & stats
```

### Manual Sync (On Demand):
```
User taps "Sync Now" button
           ↓
Immediately syncs all tasks
           ↓
Shows "Syncing..." with spinner
           ↓
Completes and updates stats
```

---

## 📱 Where to Find It

### Settings → Calendar Sync Section

When calendar sync is enabled, you'll see:

```
┌────────────────────────────────┐
│ CALENDAR SYNC                  │
├────────────────────────────────┤
│ Last Sync        Tasks Synced  │
│ 2 minutes ago           5      │
│                                │
│ ┌────────────────────────────┐ │
│ │  🔄 Sync Now              │ │
│ └────────────────────────────┘ │
│                                │
│ 🟢 Auto-sync every 5 minutes  │
└────────────────────────────────┘

Calendar syncs automatically every 
5 minutes. Tap 'Sync Now' for 
immediate sync.
```

---

## 🔄 Auto-Sync Features

### Automatic Updates:
- ✅ Syncs **every 5 minutes** automatically
- ✅ Only syncs **incomplete tasks** with due dates
- ✅ Updates **existing events** if task changed
- ✅ Creates **new events** for new tasks
- ✅ Runs in **background** - no user interaction needed

### Smart Behavior:
- Only syncs when **sync is enabled**
- Only syncs when **calendar is authorized**
- Starts automatically when **app launches**
- Continues while **app is active**
- Updates **last sync timestamp**

---

## 🔘 Manual Sync Button

### When to Use:
- Just added important tasks
- Changed task details
- Want immediate calendar update
- Don't want to wait for auto-sync

### Button States:

**Ready:**
```
┌──────────────────┐
│ 🔄 Sync Now     │  ← Tap to sync
└──────────────────┘
```

**Syncing:**
```
┌──────────────────┐
│ ⏳ Syncing...   │  ← In progress
└──────────────────┘
```

**After Sync:**
```
Last Sync: Just now
Tasks Synced: 8
```

---

## 📊 Sync Status Display

### Information Shown:

**Last Sync Time:**
- "Just now" (< 1 min)
- "2 minutes ago"
- "1 hour ago"
- "3 days ago"
- "Never" (first time)

**Tasks Synced:**
- Shows count from last sync
- Updates after each sync
- Color-coded (theme color)

**Auto-Sync Indicator:**
- Green dot: Active
- Shows interval (5 minutes)

---

## ⚙️ Technical Details

### Timer Configuration:
```swift
private let autoSyncInterval: TimeInterval = 300 // 5 minutes
```

### What Gets Synced:
```swift
// Only syncs incomplete tasks with due dates
let tasksToSync = tasks.filter { 
    !$0.completed && 
    $0.dueDate != nil 
}
```

### Sync Process:
1. **Check authorization** - is calendar access granted?
2. **Check if enabled** - is sync turned on?
3. **Filter tasks** - only incomplete with due dates
4. **Sync each task** - create or update events
5. **Update stats** - count, timestamp, status
6. **Save settings** - persist sync data

---

## 🎨 UI Features

### Gradient Button:
- Uses theme colors (primary + secondary)
- Animated gradient flow
- Smooth color transitions
- Disabled state (gray) when syncing

### Progress Indicator:
- Shows while syncing
- Spinner animation
- "Syncing..." text
- Button disabled during sync

### Stats Display:
- Last sync time with "ago" format
- Task count in theme color
- Green indicator for auto-sync
- Footer text with explanation

---

## 🔔 User Experience

### First Time Setup:
1. Enable calendar integration (Premium)
2. Grant calendar access
3. Select calendar
4. Enable sync
5. **Auto-sync starts immediately!**

### Ongoing Use:
```
Add task with due date
       ↓
Wait up to 5 minutes (or tap Sync Now)
       ↓
Task appears in calendar
       ↓
Edit task in Plannio
       ↓
Wait up to 5 minutes (or tap Sync Now)
       ↓
Calendar event updates automatically
```

### Manual Sync:
```
Need immediate sync?
       ↓
Settings → Calendar Sync
       ↓
Tap "Sync Now"
       ↓
See "Syncing..." with spinner
       ↓
Done! Stats update
```

---

## 💡 Best Practices

### For Users:
- ✅ Use **manual sync** after adding important tasks
- ✅ Check **last sync time** to see freshness
- ✅ Keep **sync enabled** for automatic updates
- ✅ Grant **calendar access** for full functionality

### Sync Timing:
- **5 minutes** is frequent enough for most uses
- **Manual sync** available for urgent needs
- **Auto-sync** runs in background
- **No battery drain** - efficient timer

---

## 🎯 Sync Behavior

### What Syncs:
- ✅ **Incomplete tasks** with due dates
- ✅ Task **title**
- ✅ Task **description** (as notes)
- ✅ Task **due date** (as event date)
- ✅ Task **start time** (if specified)
- ✅ Task **location** (if specified)

### What Doesn't Sync:
- ❌ Completed tasks (already done)
- ❌ Tasks without due dates (no time component)
- ❌ Recurring settings (handled separately)

### Updates:
- **Task changed?** Event updates on next sync
- **Task completed?** Event removed on next sync
- **Task deleted?** Event removed on next sync
- **New task?** Event created on next sync

---

## 🚀 Performance

### Efficiency:
- Only syncs **incomplete tasks**
- Only syncs tasks **with due dates**
- Uses **existing events** when possible
- Updates rather than **recreates**
- Minimal **API calls**

### Battery Impact:
- Timer uses **minimal resources**
- Sync only when **app is active**
- No **background processing**
- Efficient **event operations**

---

## 📱 Example Scenarios

### Scenario 1: Morning Planning
```
8:00 AM - Add 5 tasks for the day
8:05 AM - Auto-sync runs
Result: All 5 tasks in calendar ✅
```

### Scenario 2: Urgent Task
```
2:30 PM - Add important meeting task
2:30 PM - Tap "Sync Now"
2:31 PM - Task in calendar immediately ✅
```

### Scenario 3: Task Changes
```
4:15 PM - Change meeting time from 5 PM to 6 PM
4:20 PM - Auto-sync runs
Result: Calendar event time updated ✅
```

### Scenario 4: Check Status
```
Open Settings → Calendar Sync
See: Last Sync: 3 minutes ago
See: Tasks Synced: 8
Know: Everything is up to date ✅
```

---

## 🎊 Result

**Your calendar stays automatically synchronized with minimal effort!**

Features:
- ⏱️ Auto-sync every 5 minutes
- 🔘 Manual sync button
- 📊 Real-time status
- ⚡ Instant updates
- 🎨 Beautiful UI
- 🔋 Battery efficient
- 💡 User-friendly

**Set it and forget it - your tasks will always be in your calendar!** ✨🔄

---

## 🛠️ For Developers

### Start/Stop Auto-Sync:
```swift
// Start (called on init)
func startAutoSync()

// Stop (called on deinit)
func stopAutoSync()
```

### Manual Sync:
```swift
// Call from UI
syncManager.manualSync()
```

### Check Status:
```swift
// Is syncing?
syncManager.isSyncing

// Last sync
syncManager.lastSyncDate

// Task count
syncManager.syncStats.lastSyncedCount
```
