# Siri Integration Guide

## 🎤 Voice Commands Available

Your app now supports Siri! Users can add and manage tasks using voice commands.

---

## 📱 Supported Commands

### Quick Add Task
**"Hey Siri, add a task in My Planner"**
- Siri will ask: "What do you want to add?"
- User responds with task name
- Task is added instantly!

### Add Task with Title
**"Hey Siri, add [task name] to My Planner"**
Examples:
- "Hey Siri, add buy groceries to My Planner"
- "Hey Siri, add team meeting to My Planner"
- "Hey Siri, create dentist appointment in My Planner"

### View Tasks
**"Hey Siri, show my tasks"**
or
**"Hey Siri, what are my tasks?"**
- Siri will tell you how many tasks you have pending

### Complete Task
**"Hey Siri, complete [task name]"**
Examples:
- "Hey Siri, complete buy groceries"
- "Hey Siri, mark team meeting as done"
- "Hey Siri, finish dentist appointment"

---

## 🔧 Setup Instructions

### For Developers:

1. **Enable Siri Capability in Xcode:**
   - Open MyPlannerApp.xcodeproj
   - Select the MyPlannerApp target
   - Go to "Signing & Capabilities" tab
   - Click "+ Capability"
   - Add "Siri"

2. **Build and Run:**
   - The app automatically registers the Siri shortcuts
   - No additional setup needed!

### For Users:

1. **Grant Siri Permission:**
   - First time using Siri with the app, iOS will ask for permission
   - Tap "OK" to allow Siri access

2. **Try a Command:**
   - Say "Hey Siri, add a task in My Planner"
   - Siri will guide you through adding your first task!

3. **View Available Commands:**
   - Open app → Settings → Siri & Shortcuts
   - See all available voice commands

---

## 💡 Tips for Best Results

### For Natural Conversation:
✅ "Add buy milk to My Planner"
✅ "What are my tasks?"
✅ "Complete team meeting"

### More Specific Commands:
✅ "Add buy groceries due tomorrow to My Planner"
✅ "Create high priority review code in My Planner"

### Task Completion:
- Use partial names: "Complete groceries" will find "buy groceries"
- Case insensitive: works with any capitalization

---

## 🎯 How It Works

### App Intents Framework
The app uses Apple's modern **App Intents** framework (iOS 16+):
- No need for separate Intents extension
- Faster and more reliable
- Better Siri integration
- Works with Shortcuts app

### What Happens Behind the Scenes:
1. User says Siri command
2. Siri recognizes the app intent
3. Intent extracts task details
4. Task is added to DataManager
5. Siri confirms with user
6. User sees task in app immediately

---

## 📋 Testing Checklist

- [ ] Enable Siri capability in Xcode
- [ ] Build and run app
- [ ] Say "Hey Siri, add a task in My Planner"
- [ ] Check that task appears in app
- [ ] Try "Hey Siri, what are my tasks?"
- [ ] Try completing a task via Siri
- [ ] Check Settings → Siri Commands page

---

## 🐛 Troubleshooting

### Siri Says "I don't see an app for that"
**Fix:** Make sure you've:
1. Built and run the app at least once
2. Granted Siri permission when prompted
3. Are using iOS 16.0 or later

### Task Not Appearing
**Fix:** 
1. Open the app to refresh
2. Check that task was actually added via Siri confirmation
3. Try simpler command first: "add test task"

### Siri Not Understanding Task Name
**Fix:**
- Speak clearly and at normal pace
- Use common words
- Avoid very long task names

---

## 🚀 Advanced Usage

### In Shortcuts App:
Users can create custom shortcuts combining:
- Add task
- Set reminders
- Send notifications
- Share with others

### Multiple Tasks:
Users can say multiple commands:
1. "Add buy milk to My Planner"
2. "Add walk dog to My Planner"  
3. "Add call mom to My Planner"

All tasks will be added!

---

## 📱 User Experience

**User:** "Hey Siri, add buy groceries to My Planner"
**Siri:** "Added 'buy groceries' to your tasks"
✅ Task appears in app instantly!

**User:** "Hey Siri, what are my tasks?"
**Siri:** "You have 5 tasks pending"

**User:** "Hey Siri, complete buy groceries"
**Siri:** "Great! Marked 'buy groceries' as complete"
✅ Task marked done in app!

---

## 🎉 Success!

Your app now has full Siri integration! Users can manage their tasks hands-free, making the app much more convenient for:
- Driving
- Cooking
- Exercising
- Multitasking
- Quick captures

**Try it now: "Hey Siri, add a task in My Planner"** 🎤
