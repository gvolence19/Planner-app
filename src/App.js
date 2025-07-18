import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Bell, CheckCircle, Clock, Star, Settings, Menu, X, Trash2, Edit3, AlertCircle, Mic, MicOff, FileText } from 'lucide-react';

const WeeklyPlannerApp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userTier, setUserTier] = useState('free');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [timezone, setTimezone] = useState('America/New_York');
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [groceryList, setGroceryList] = useState([]);
  const [showGroceryModal, setShowGroceryModal] = useState(false);

  // Sample data initialization
  useEffect(() => {
    // Initialize week dates
    setWeekDates(getWeekDates());
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        processVoiceCommand(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    }
    
    const sampleTasks = [
      {
        id: 1,
        title: 'Review project proposal',
        completed: false,
        priority: 'high',
        dueDate: new Date(),
        dueTime: '14:30',
        duration: '2 hours',
        reminder: true,
        category: 'work',
        isRecurring: false,
        recurringType: 'none', // 'daily', 'weekly', 'monthly', 'yearly'
        recurringInterval: 1, // every X days/weeks/months
        recurringEndDate: null, // when to stop recurring
        originalTaskId: null, // for tracking which task this recurred from
        notes: 'Focus on budget section and timeline. Check technical requirements.'
      },
      {
        id: 2,
        title: 'Grocery shopping',
        completed: true,
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000),
        dueTime: '10:00',
        duration: '1 hour',
        reminder: false,
        category: 'personal',
        notes: 'Milk, bread, eggs, vegetables. Check if store has organic options.'
      },
      {
        id: 3,
        title: 'Call dentist',
        completed: false,
        priority: 'low',
        dueDate: new Date(Date.now() + 172800000),
        dueTime: '09:15',
        duration: '15 minutes',
        reminder: true,
        category: 'health',
        notes: 'Schedule cleaning appointment for next month.'
      },
      {
        id: 4,
        title: 'Team standup',
        completed: false,
        priority: 'medium',
        dueDate: new Date(Date.now() + 86400000),
        dueTime: '09:00',
        duration: '30 minutes',
        reminder: true,
        category: 'work',
        notes: 'Discuss sprint progress and blockers. Prepare status update.'
      },
      {
        id: 5,
        title: 'Workout session',
        completed: false,
        priority: 'medium',
        dueDate: new Date(Date.now() + 259200000),
        dueTime: '18:00',
        duration: '1.5 hours',
        reminder: true,
        category: 'health',
        notes: 'Cardio and strength training. Bring water bottle and towel.'
      }
    ];

    const sampleEvents = [
      {
        id: 1,
        title: 'Team Meeting',
        date: new Date(),
        time: '10:00 AM',
        duration: '1 hour',
        type: 'meeting'
      },
      {
        id: 2,
        title: 'Lunch with Sarah',
        date: new Date(Date.now() + 86400000),
        time: '12:30 PM',
        duration: '1.5 hours',
        type: 'personal'
      },
      {
        id: 3,
        title: 'Doctor Appointment',
        date: new Date(Date.now() + 172800000),
        time: '2:00 PM',
        duration: '30 minutes',
        type: 'health'
      },
      {
        id: 4,
        title: 'Client Call',
        date: new Date(),
        time: '2:00 PM',
        duration: '45 minutes',
        type: 'meeting'
      },
      {
        id: 5,
        title: 'Gym Session',
        date: new Date(),
        time: '6:00 PM',
        duration: '1 hour',
        type: 'personal'
      },
      {
        id: 6,
        title: 'Project Review',
        date: new Date(),
        time: '4:00 PM',
        duration: '2 hours',
        type: 'meeting'
      },
      {
        id: 7,
        title: 'Coffee with Alex',
        date: new Date(Date.now() + 86400000),
        time: '10:00 AM',
        duration: '30 minutes',
        type: 'personal'
      },
      {
        id: 8,
        title: 'Weekly Planning',
        date: new Date(Date.now() + 86400000),
        time: '9:00 AM',
        duration: '1 hour',
        type: 'work'
      },
      {
        id: 9,
        title: 'Dentist Appointment',
        date: new Date(Date.now() + 259200000),
        time: '11:00 AM',
        duration: '45 minutes',
        type: 'health'
      },
      {
        id: 10,
        title: 'Team Lunch',
        date: new Date(Date.now() + 259200000),
        time: '1:00 PM',
        duration: '1.5 hours',
        type: 'work'
      }
    ];
    
    const sampleGroceryList = [
      {
        id: 1,
        item: 'Milk',
        category: 'Dairy',
        quantity: '1 gallon',
        purchased: false,
        addedDate: new Date(),
        priority: 'high'
      },
      {
        id: 2,
        item: 'Bread',
        category: 'Bakery',
        quantity: '1 loaf',
        purchased: true,
        addedDate: new Date(Date.now() - 86400000),
        priority: 'medium'
      },
      {
        id: 3,
        item: 'Bananas',
        category: 'Produce',
        quantity: '1 bunch',
        purchased: false,
        addedDate: new Date(),
        priority: 'low'
      },
      {
        id: 4,
        item: 'Chicken breast',
        category: 'Meat',
        quantity: '2 lbs',
        purchased: false,
        addedDate: new Date(),
        priority: 'high'
      },
      {
        id: 5,
        item: 'Apples',
        category: 'Produce',
        quantity: '6 count',
        purchased: false,
        addedDate: new Date(),
        priority: 'medium'
      }
    ];

    setGroceryList(sampleGroceryList);
    setTasks(sampleTasks);
    setEvents(sampleEvents);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: timezone
    });
  };

  const formatDateWithTimezone = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      timeZone: timezone
    });
  };

  const getTimezoneList = () => {
    return [
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
      { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
      { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
      { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
      { value: 'Europe/Paris', label: 'Central European Time (CET)' },
      { value: 'Europe/Berlin', label: 'Central European Time (CET)' },
      { value: 'Europe/Rome', label: 'Central European Time (CET)' },
      { value: 'Europe/Moscow', label: 'Moscow Time (MSK)' },
      { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
      { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
      { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
      { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)' },
      { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
      { value: 'Australia/Melbourne', label: 'Australian Eastern Time (AET)' },
      { value: 'Australia/Perth', label: 'Australian Western Time (AWT)' },
      { value: 'Pacific/Auckland', label: 'New Zealand Time (NZST)' }
    ];
  };

  const getWeekDates = () => {
    const week = [];
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const getMonthDates = () => {
    const month = [];
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get the first day of the week for the first day of the month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Generate 6 weeks (42 days) to fill the calendar grid
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      month.push(date);
    }
    
    return month;
  };

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric',
      timeZone: timezone 
    });
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate.toDateString() === date.toDateString()
    );
  };

  const getActiveTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate.toDateString() === date.toDateString() && !task.completed
    );
  };

  const getCompletedTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate.toDateString() === date.toDateString() && task.completed
    );
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'personal': return 'bg-green-500';
      case 'health': return 'bg-red-500';
      case 'work': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskTypeColor = (category) => {
    switch (category) {
      case 'work': return 'bg-blue-500';
      case 'personal': return 'bg-green-500';
      case 'health': return 'bg-red-500';
      case 'shopping': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const sortEventsByTime = (events) => {
    return events.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.time}`);
      const timeB = new Date(`1970/01/01 ${b.time}`);
      return timeA - timeB;
    });
  };

  const sortTasksByTime = (tasks) => {
    return tasks.sort((a, b) => {
      if (!a.dueTime && !b.dueTime) return 0;
      if (!a.dueTime) return 1;
      if (!b.dueTime) return -1;
      
      const timeA = new Date(`1970/01/01 ${a.dueTime}`);
      const timeB = new Date(`1970/01/01 ${b.dueTime}`);
      return timeA - timeB;
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getCurrentTimeInTimezone = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectDate = (date) => {
    setSelectedDate(date);
  };

  const startVoiceRecognition = () => {
    if (speechRecognition && !isListening) {
      speechRecognition.start();
    }
  };

  const processVoiceCommand = (transcript) => {
    console.log('Voice command:', transcript);
    
    // Parse the voice command to extract task details
    const lowerTranscript = transcript.toLowerCase();
    
    // Extract task title (everything before timing/priority keywords)
    let taskTitle = transcript;
    let priority = 'medium';
    let category = 'personal';
    let dueDate = new Date();
    let dueTime = '';
    let reminder = false;
    
    // Detect priority
    if (lowerTranscript.includes('high priority') || lowerTranscript.includes('urgent') || lowerTranscript.includes('important')) {
      priority = 'high';
      taskTitle = taskTitle.replace(/\b(high priority|urgent|important)\b/gi, '').trim();
    } else if (lowerTranscript.includes('low priority')) {
      priority = 'low';
      taskTitle = taskTitle.replace(/\b(low priority)\b/gi, '').trim();
    }
    
    // Detect category
    if (lowerTranscript.includes('work') || lowerTranscript.includes('office') || lowerTranscript.includes('meeting')) {
      category = 'work';
      taskTitle = taskTitle.replace(/\b(work|office)\b/gi, '').trim();
    } else if (lowerTranscript.includes('health') || lowerTranscript.includes('doctor') || lowerTranscript.includes('gym')) {
      category = 'health';
      taskTitle = taskTitle.replace(/\b(health|doctor|gym)\b/gi, '').trim();
    } else if (lowerTranscript.includes('shopping') || lowerTranscript.includes('grocery') || lowerTranscript.includes('buy')) {
      category = 'shopping';
      taskTitle = taskTitle.replace(/\b(shopping|grocery)\b/gi, '').trim();
    }
    
    // Detect timing
    if (lowerTranscript.includes('tomorrow')) {
      dueDate = new Date(Date.now() + 86400000);
      taskTitle = taskTitle.replace(/\btomorrow\b/gi, '').trim();
    } else if (lowerTranscript.includes('next week')) {
      dueDate = new Date(Date.now() + 7 * 86400000);
      taskTitle = taskTitle.replace(/\bnext week\b/gi, '').trim();
    } else if (lowerTranscript.includes('today')) {
      dueDate = new Date();
      taskTitle = taskTitle.replace(/\btoday\b/gi, '').trim();
    }
    
    // Detect time (simple patterns)
    const timeMatch = lowerTranscript.match(/at (\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      let minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const ampm = timeMatch[3];
      
      if (ampm === 'pm' && hours !== 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      
      dueTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      taskTitle = taskTitle.replace(/\bat \d{1,2}:?\d{2}?\s*(am|pm)?/gi, '').trim();
    }
    
    // Detect reminder
    if (lowerTranscript.includes('remind me') || lowerTranscript.includes('reminder')) {
      reminder = true;
      taskTitle = taskTitle.replace(/\b(remind me|reminder)\b/gi, '').trim();
    }
    
    // Clean up task title
    taskTitle = taskTitle.replace(/^(add|create|new|task|to do)\s*/gi, '').trim();
    taskTitle = taskTitle.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter
    if (taskTitle) {
      taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);
    }
    
    if (taskTitle) {
      const newTask = {
        id: Date.now(),
        title: taskTitle,
        completed: false,
        priority,
        dueDate,
        dueTime,
        reminder,
        category
      };
      
      addTask(newTask);
      
      // Show success feedback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Added ${priority} priority ${category} task: ${taskTitle}${dueTime ? ` at ${formatTime(dueTime)}` : ''}`
        );
        utterance.rate = 0.8;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      completed: false
    };
    setTasks([...tasks, newTask]);
    
    // CREATE RECURRING INSTANCES
    if (newTask.isRecurring) {
      setTimeout(() => createRecurringTasks(newTask), 100);
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const updateTask = (taskId, updatedData) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updatedData }
        : task
    ));
  };

  // ADD THE createRecurringTasks FUNCTION HERE
  const createRecurringTasks = (originalTask) => {
    if (!originalTask.isRecurring) return;
    
    const newTasks = [];
    const startDate = new Date(originalTask.dueDate);
    let currentDate = new Date(startDate);
    
    // Create up to 10 future instances (or until end date)
    for (let i = 0; i < 10; i++) {
      // Calculate next date based on recurring type
      switch (originalTask.recurringType) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + originalTask.recurringInterval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * originalTask.recurringInterval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + originalTask.recurringInterval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + originalTask.recurringInterval);
          break;
        default:
          break;
      }
      
      // Stop if we've reached the end date
      if (originalTask.recurringEndDate && currentDate > originalTask.recurringEndDate) {
        break;
      }
      
      // Create new task instance
      const newTask = {
        ...originalTask,
        id: Date.now() + i,
        dueDate: new Date(currentDate),
        completed: false,
        originalTaskId: originalTask.id
      };
      
      newTasks.push(newTask);
    }
    
    // Add all new tasks
    setTasks(prevTasks => [...prevTasks, ...newTasks]);
  };

  const addGroceryItem = (itemData) => {
    const newItem = {
      id: Date.now(),
      ...itemData,
      purchased: false,
      addedDate: new Date()
    };
    setGroceryList([...groceryList, newItem]);
  };

  const toggleGroceryItem = (itemId) => {
    setGroceryList(groceryList.map(item => 
      item.id === itemId 
        ? { ...item, purchased: !item.purchased }
        : item
    ));
  };

  const deleteGroceryItem = (itemId) => {
    setGroceryList(groceryList.filter(item => item.id !== itemId));
  };

  const updateGroceryItem = (itemId, updatedData) => {
    setGroceryList(groceryList.map(item => 
      item.id === itemId 
        ? { ...item, ...updatedData }
        : item
    ));
  };

  const clearPurchasedItems = () => {
    setGroceryList(groceryList.filter(item => !item.purchased));
  };

  const getGroceryCategoryColor = (category) => {
    switch (category) {
      case 'Produce': return 'bg-green-500';
      case 'Dairy': return 'bg-blue-500';
      case 'Meat': return 'bg-red-500';
      case 'Bakery': return 'bg-yellow-500';
      case 'Pantry': return 'bg-purple-500';
      case 'Frozen': return 'bg-cyan-500';
      case 'Snacks': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setShowTaskModal(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const FreemiumBanner = () => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">Upgrade to Premium</h3>
          <p className="text-sm opacity-90">Unlimited tasks, calendar sync, and advanced features</p>
        </div>
        <button 
          onClick={() => setUserTier('premium')}
          className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold hover:bg-gray-100"
        >
          Upgrade
        </button>
      </div>
    </div>
  );

  const TaskDetailModal = ({ task, onClose, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
      title: task?.title || '',
      notes: task?.notes || '',
      priority: task?.priority || 'medium',
      category: task?.category || 'personal',
      dueDate: task?.dueDate || new Date(),
      dueTime: task?.dueTime || '',
      duration: task?.duration || '',
      reminder: task?.reminder || false,
      isRecurring: task?.isRecurring || false,
      recurringType: task?.recurringType || 'none',
      recurringInterval: task?.recurringInterval || 1,
      recurringEndDate: task?.recurringEndDate || null
    });

    const handleSave = () => {
      onUpdate(task.id, editData);
      setIsEditing(false);
    };

    const handleDelete = () => {
      if (window.confirm('Are you sure you want to delete this task?')) {
        onDelete(task.id);
        onClose();
      }
    };

    if (!task) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {isEditing ? 'Edit Task' : 'Task Details'}
            </h3>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit3 size={20} />
                </button>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Task Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdate(task.id, { completed: !task.completed })}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                    task.completed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <CheckCircle size={16} />
                  <span>{task.completed ? 'Completed' : 'Active'}</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              {isEditing ? (
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Add notes..."
                />
              ) : (
                <div className="min-h-[80px] p-3 bg-gray-50 rounded-md">
                  {task.notes ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{task.notes}</p>
                  ) : (
                    <p className="text-gray-500 italic">No notes added</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Task Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium