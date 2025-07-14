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

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{task.title}</p>
              )}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                {isEditing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} bg-gray-100`}>
                    {task.priority}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                {isEditing ? (
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({...editData, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="health">Health</option>
                    <option value="shopping">Shopping</option>
                  </select>
                ) : (
                  <span className="text-gray-700 capitalize">{task.category}</span>
                )}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.dueDate.toISOString().split('T')[0]}
                    onChange={(e) => setEditData({...editData, dueDate: new Date(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{task.dueDate.toLocaleDateString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                {isEditing ? (
                  <input
                    type="time"
                    value={editData.dueTime}
                    onChange={(e) => setEditData({...editData, dueTime: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{task.dueTime ? formatTime(task.dueTime) : 'No time set'}</p>
                )}
              </div>
            </div>

            {/* Duration and Reminder */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                {isEditing ? (
                  <select
                    value={editData.duration}
                    onChange={(e) => setEditData({...editData, duration: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No duration</option>
                    <option value="15 minutes">15 minutes</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="1.5 hours">1.5 hours</option>
                    <option value="2 hours">2 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="4 hours">4 hours</option>
                    <option value="Half day">Half day</option>
                    <option value="Full day">Full day</option>
                  </select>
                ) : (
                  <p className="text-gray-700">{task.duration || 'No duration'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder</label>
                {isEditing ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editData.reminder}
                      onChange={(e) => setEditData({...editData, reminder: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Set reminder</span>
                  </label>
                ) : (
                  <div className="flex items-center space-x-2">
                    {task.reminder ? (
                      <>
                        <Bell size={16} className="text-yellow-500" />
                        <span className="text-gray-700">Enabled</span>
                      </>
                    ) : (
                      <span className="text-gray-500">Disabled</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Recurring Task Info */}
<div className="border-t border-gray-200 pt-4">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700">Recurring Task</label>
    {isEditing ? (
      <input
        type="checkbox"
        checked={editData.isRecurring}
        onChange={(e) => setEditData({...editData, isRecurring: e.target.checked})}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
    ) : (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        task.isRecurring ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {task.isRecurring ? 'Yes' : 'No'}
      </span>
    )}
  </div>
  
  {(isEditing ? editData.isRecurring : task.isRecurring) && (
    <div className="ml-4 p-3 bg-blue-50 rounded-lg space-y-2">
      {isEditing ? (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Repeat</label>
            <select
              value={editData.recurringType}
              onChange={(e) => setEditData({...editData, recurringType: e.target.value})}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Every</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="30"
                value={editData.recurringInterval}
                onChange={(e) => setEditData({...editData, recurringInterval: parseInt(e.target.value)})}
                className="w-16 p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-600">
                {editData.recurringType === 'daily' ? 'day(s)' :
                 editData.recurringType === 'weekly' ? 'week(s)' :
                 editData.recurringType === 'monthly' ? 'month(s)' : 'year(s)'}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-blue-700">
          <div>Repeats: Every {task.recurringInterval} {task.recurringType.slice(0, -2)}{task.recurringInterval > 1 ? 's' : ''}</div>
          {task.recurringEndDate && (
            <div>Until: {task.recurringEndDate.toLocaleDateString()}</div>
          )}
        </div>
      )}
    </div>
  )}
</div>
            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
    
const AddTaskModal = ({ onClose, onAdd }) => {
const [taskData, setTaskData] = useState({
      title: '',
      priority: 'medium',
      dueDate: new Date(),
      dueTime: '',
      duration: '',
      reminder: false,
      category: 'personal',
      notes: ''
      isRecurring: false,
      recurringType: 'none',
      recurringInterval: 1,
      recurringEndDate: null
    });

    const handleSubmit = (e) => {
      if (e) e.preventDefault();
      if (taskData.title.trim()) {
        onAdd(taskData);
        onClose();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add New Task</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={taskData.notes}
                onChange={(e) => setTaskData({...taskData, notes: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional details or notes..."
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={taskData.category}
                onChange={(e) => setTaskData({...taskData, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
                <option value="shopping">Shopping</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={taskData.dueDate.toISOString().split('T')[0]}
                onChange={(e) => setTaskData({...taskData, dueDate: new Date(e.target.value)})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Time (Optional)</label>
              <input
                type="time"
                value={taskData.dueTime}
                onChange={(e) => setTaskData({...taskData, dueTime: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Current time in {getTimezoneList().find(tz => tz.value === timezone)?.label}: {getCurrentTimeInTimezone()}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Optional)</label>
              <select
                value={taskData.duration}
                onChange={(e) => setTaskData({...taskData, duration: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No duration</option>
                <option value="15 minutes">15 minutes</option>
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="1.5 hours">1.5 hours</option>
                <option value="2 hours">2 hours</option>
                <option value="3 hours">3 hours</option>
                <option value="4 hours">4 hours</option>
                <option value="Half day">Half day</option>
                <option value="Full day">Full day</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reminder"
                checked={taskData.reminder}
                onChange={(e) => setTaskData({...taskData, reminder: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="reminder" className="ml-2 block text-sm text-gray-700">
                Set reminder
              </label>
            </div>
            
{/* Recurring Task Section */}
<div className="border-t border-gray-200 pt-4">
  <div className="flex items-center mb-3">
    <input
      type="checkbox"
      id="recurring"
      checked={taskData.isRecurring}
      onChange={(e) => setTaskData({...taskData, isRecurring: e.target.checked})}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label htmlFor="recurring" className="ml-2 block text-sm font-medium text-gray-700">
      Make this a recurring task
    </label>
  </div>
  
  {taskData.isRecurring && (
    <div className="space-y-3 ml-6 p-3 bg-blue-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
        <select
          value={taskData.recurringType}
          onChange={(e) => setTaskData({...taskData, recurringType: e.target.value})}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Every</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="30"
            value={taskData.recurringInterval}
            onChange={(e) => setTaskData({...taskData, recurringInterval: parseInt(e.target.value)})}
            className="w-20 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {taskData.recurringType === 'daily' ? 'day(s)' :
             taskData.recurringType === 'weekly' ? 'week(s)' :
             taskData.recurringType === 'monthly' ? 'month(s)' : 'year(s)'}
          </span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
        <input
          type="date"
          value={taskData.recurringEndDate ? taskData.recurringEndDate.toISOString().split('T')[0] : ''}
          onChange={(e) => setTaskData({...taskData, recurringEndDate: e.target.value ? new Date(e.target.value) : null})}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )}
</div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const Dashboard = () => (
    <div className="space-y-6 max-h-full">
      {userTier === 'free' && <FreemiumBanner />}
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-semibold mb-4">Today's Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{tasks.filter(t => !t.completed).length}</div>
            <div className="text-sm text-gray-600">Active Tasks</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{tasks.filter(t => t.completed).length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-3">This Week</h3>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDates.map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dayTasks = getActiveTasksForDate(date);
            const dayEvents = getEventsForDate(date);
            
            return (
              <button
                key={index}
                onClick={() => selectDate(date)}
                className={`p-2 text-center rounded-lg transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone })}</div>
                <div className="font-semibold">{date.getDate()}</div>
                <div className="flex justify-center space-x-1 mt-1">
                  {dayTasks.length > 0 && (
                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>
                  )}
                  {dayEvents.length > 0 && (
                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            {selectedDate.toDateString() === new Date().toDateString() 
              ? "Today's Active Tasks" 
              : `Active Tasks for ${formatDateWithTimezone(selectedDate)}`
            }
          </h3>
          <span className="text-sm text-gray-500">
            {getActiveTasksForDate(selectedDate).length} active
          </span>
        </div>
        
        {getActiveTasksForDate(selectedDate).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <div>No active tasks for this day</div>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Add a task
            </button>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
            {sortTasksByTime(getActiveTasksForDate(selectedDate)).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div 
                  className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => openTaskModal(task)}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
                    className={`flex-shrink-0 cursor-pointer ${
                      task.completed 
                        ? 'text-green-600' 
                        : 'text-gray-400 hover:text-blue-600'
                    }`}
                  >
                    <CheckCircle size={20} />
                  </div>
                  <div className={`flex-1 min-w-0 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    <div className="font-medium truncate flex items-center">
  {task.title}
  {task.isRecurring && (
    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
      🔄 Recurring
    </span>
  )}
</div>
                    {task.notes && (
                      <div className="text-sm text-gray-600 mt-1 flex items-start space-x-1">
                        <FileText size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="truncate">{task.notes}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span className="capitalize">{task.category}</span>
                      {task.dueTime && (
                        <>
                          <span>•</span>
                          <Clock size={12} className="text-blue-500" />
                          <span className="font-medium">{formatTime(task.dueTime)}</span>
                        </>
                      )}
                      {task.duration && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600 font-medium">{task.duration}</span>
                        </>
                      )}
                      {task.reminder && <Bell size={12} className="text-yellow-500" />}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${getPriorityColor(task.priority)} flex-shrink-0`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {getActiveTasksForDate(selectedDate).length > 3 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all {getActiveTasksForDate(selectedDate).length} active tasks →
            </button>
          </div>
        )}
      </div>

      {/* Completed Tasks Section */}
      {getCompletedTasksForDate(selectedDate).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-green-600">
              {selectedDate.toDateString() === new Date().toDateString() 
                ? "Today's Completed Tasks" 
                : `Completed Tasks for ${formatDateWithTimezone(selectedDate)}`
              }
            </h3>
            <span className="text-sm text-gray-500">
              {getCompletedTasksForDate(selectedDate).length} completed
            </span>
          </div>
          
          <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
            {sortTasksByTime(getCompletedTasksForDate(selectedDate)).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 text-green-600"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <div className="flex-1 min-w-0 line-through text-gray-500">
                    <div className="font-medium truncate flex items-center">
  {task.title}
  {task.isRecurring && (
    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
      🔄 Recurring
    </span>
  )}
</div>
                    {task.notes && (
                      <div className="text-sm text-gray-400 mt-1 flex items-start space-x-1">
                        <FileText size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                  <span className="truncate">{task.notes}</span>
                      </div>
                    )}
                    <div className="text-sm text-gray-400 flex items-center space-x-2">
                      <span className="capitalize">{task.category}</span>
                      {task.dueTime && (
                        <>
                          <span>•</span>
                          <Clock size={12} className="text-gray-400" />
                          <span className="font-medium">{formatTime(task.dueTime)}</span>
                        </>
                      )}
                      {task.duration && (
                        <>
                          <span>•</span>
                          <span className="text-gray-400 font-medium">{task.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-xs text-green-600 font-medium">Done</span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Events Section */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            {selectedDate.toDateString() === new Date().toDateString() 
              ? "Today's Events" 
              : `Events for ${formatDateWithTimezone(selectedDate)}`
            }
          </h3>
          <span className="text-sm text-gray-500">
            {getEventsForDate(selectedDate).length} events
          </span>
        </div>
        
        {getEventsForDate(selectedDate).length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-sm">No events scheduled</div>
          </div>
        ) : (
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {sortEventsByTime(getEventsForDate(selectedDate)).map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-3 h-3 ${getEventTypeColor(event.type)} rounded-full flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{event.title}</div>
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{event.time}</span> • {event.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {getEventsForDate(selectedDate).length > 2 && (
          <div className="mt-3 text-center">
            <button
              onClick={() => setCurrentView('calendar')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all {getEventsForDate(selectedDate).length} events →
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-3">Week Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.filter(t => t.dueDate >= new Date() && t.dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-600">This Week's Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {events.filter(e => e.date >= new Date() && e.date < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
            </div>
            <div className="text-sm text-gray-600">This Week's Events</div>
          </div>
        </div>
      </div>
    </div>
  );

  const TasksView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
          >
            <Plus size={20} />
          </button>
          <button
            onClick={startVoiceRecognition}
            disabled={!speechRecognition || isListening}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : speechRecognition 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={isListening ? 'Listening...' : 'Add task by voice'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCompleted(false)}
              className={`px-4 py-2 rounded-lg font-medium ${
                !showCompleted 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active Tasks ({tasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setShowCompleted(true)}
              className={`px-4 py-2 rounded-lg font-medium ${
                showCompleted 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed ({tasks.filter(t => t.completed).length})
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
        {showCompleted ? (
          // Completed Tasks
          tasks.filter(t => t.completed).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🎉</div>
              <div className="text-lg font-medium mb-2">No completed tasks yet</div>
              <div className="text-sm">Complete some tasks to see them here!</div>
            </div>
          ) : (
            sortTasksByTime(tasks.filter(t => t.completed)).map(task => (
              <div key={task.id} className="p-4 bg-green-50 cursor-pointer hover:bg-green-100" onClick={() => openTaskModal(task)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className="text-green-600 cursor-pointer"
                    >
                      <CheckCircle size={20} />
                    </div>
                    <div className="line-through text-gray-500">
                      <div className="font-medium flex items-center">
  {task.title}
  {task.isRecurring && (
    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
      🔄 Recurring
    </span>
  )}
</div>
                      {task.notes && (
                        <div className="text-sm text-gray-400 mt-1 flex items-start space-x-1">
                          <FileText size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{task.notes}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-400 flex items-center space-x-2">
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>{task.dueDate.toLocaleDateString()}</span>
                        {task.dueTime && (
                          <>
                            <span>•</span>
                            <Clock size={12} className="text-gray-400" />
                            <span className="font-medium">{formatTime(task.dueTime)}</span>
                          </>
                        )}
                        {task.duration && (
                          <>
                            <span>•</span>
                            <span className="text-gray-400 font-medium">{task.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-green-600">Completed</span>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                    >
                      <Trash2 size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          // Active Tasks
          tasks.filter(t => !t.completed).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <div className="text-lg font-medium mb-2">No active tasks</div>
              <div className="text-sm mb-4">Add a new task to get started!</div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Your First Task
              </button>
            </div>
          ) : (
            sortTasksByTime(tasks.filter(t => !t.completed)).map(task => (
              <div key={task.id} className="p-4 cursor-pointer hover:bg-gray-50" onClick={() => openTaskModal(task)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className="text-gray-400 hover:text-blue-600 cursor-pointer"
                    >
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
  {task.title}
  {task.isRecurring && (
    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
      🔄 Recurring
    </span>
  )}
</div>
                      {task.notes && (
                        <div className="text-sm text-gray-600 mt-1 flex items-start space-x-1">
                          <FileText size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="truncate">{task.notes}</span>
                        </div>
                      )}
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>{task.category}</span>
                        <span>•</span>
                        <span>{task.dueDate.toLocaleDateString()}</span>
                        {task.dueTime && (
                          <>
                            <span>•</span>
                            <Clock size={12} className="text-blue-500" />
                            <span className="font-medium">{formatTime(task.dueTime)}</span>
                          </>
                        )}
                        {task.duration && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600 font-medium">{task.duration}</span>
                          </>
                        )}
                        {task.reminder && <Bell size={12} className="text-yellow-500" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="text-red-500 hover:text-red-700 cursor-pointer p-1"
                    >
                      <Trash2 size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {userTier === 'free' && tasks.length >= 10 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800">Task limit reached</div>
              <div className="text-sm text-yellow-700">Upgrade to Premium for unlimited tasks</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CalendarView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Calendar</h2>
        <div className="text-sm text-gray-500">{getCurrentMonth()}</div>
      </div>

      {/* Month Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b border-gray-200">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {getMonthDates().map((date, index) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isCurrentMonth = date.getMonth() === new Date().getMonth();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const dayTasks = getActiveTasksForDate(date);
            const dayEvents = getEventsForDate(date);
            const totalItems = dayTasks.length + dayEvents.length;
            
            return (
              <button
                key={index}
                onClick={() => selectDate(date)}
                className={`relative p-2 h-24 text-left border border-gray-100 hover:bg-gray-50 transition-colors ${
                  isSelected
                    ? 'bg-blue-100 border-blue-300'
                    : isToday
                    ? 'bg-blue-50 border-blue-200'
                    : !isCurrentMonth
                    ? 'text-gray-300 bg-gray-50'
                    : 'bg-white'
                }`}
              >
                <div className={`text-sm font-medium ${
                  isToday ? 'text-blue-700' : 
                  isSelected ? 'text-blue-800' :
                  !isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
                
                {/* Event and Task Indicators */}
                {totalItems > 0 && isCurrentMonth && (
                  <div className="mt-1 space-y-1">
                    {/* Show first few events/tasks as colored bars */}
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <div
                        key={`event-${idx}`}
                        className={`h-1 rounded-full ${getEventTypeColor(event.type)} opacity-80`}
                        title={`${event.time} - ${event.title}`}
                      ></div>
                    ))}
                    {dayTasks.slice(0, 2 - dayEvents.length).map((task, idx) => (
                      <div
                        key={`task-${idx}`}
                        className={`h-1 rounded-full ${getTaskTypeColor(task.category)} opacity-80`}
                        title={`${task.dueTime ? formatTime(task.dueTime) : 'No time'} - ${task.title}`}
                      ></div>
                    ))}
                    
                    {/* Show count if more than 2 items */}
                    {totalItems > 2 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{totalItems - 2} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {selectedDate.toDateString() === new Date().toDateString() 
              ? "Today's Schedule" 
              : selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  timeZone: timezone 
                })
            }
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {getEventsForDate(selectedDate).length} events, {getActiveTasksForDate(selectedDate).length} tasks
            </span>
          </div>
        </div>

        {getActiveTasksForDate(selectedDate).length === 0 && getEventsForDate(selectedDate).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📅</div>
            <div className="text-lg font-medium mb-2">No scheduled items</div>
            <div className="text-sm mb-4">Add tasks or events to see them here</div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add a Task
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline View */}
            <div className="relative">
              {/* Time slots */}
              <div className="space-y-2">
                {Array.from({ length: 24 }, (_, hour) => {
                  const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                  const displayTime = formatTime(timeStr);
                  
                  // Get items for this hour
                  const hourItems = [
                    ...getEventsForDate(selectedDate).filter(event => {
                      const eventHour = parseInt(event.time.split(':')[0]);
                      if (event.time.includes('PM') && eventHour !== 12) return eventHour + 12 === hour;
                      if (event.time.includes('AM') && eventHour === 12) return hour === 0;
                      return eventHour === hour;
                    }),
                    ...getActiveTasksForDate(selectedDate).filter(task => {
                      if (!task.dueTime) return false;
                      const taskHour = parseInt(task.dueTime.split(':')[0]);
                      return taskHour === hour;
                    })
                  ];
                  
                  return (
                    <div key={hour} className="flex min-h-[60px]">
                      {/* Time label */}
                      <div className="w-20 flex-shrink-0 text-sm text-gray-500 pt-1">
                        {hour === 0 || hour === 12 || hour === 6 || hour === 18 ? displayTime : ''}
                      </div>
                      
                      {/* Content area */}
                      <div className="flex-1 border-l border-gray-200 pl-4 relative">
                        {hourItems.length > 0 ? (
                          <div className="space-y-1">
                            {hourItems.map((item, idx) => (
                              <div
                                key={`${item.id}-${idx}`}
                                className={`p-2 rounded-lg border-l-4 cursor-pointer hover:bg-gray-100 ${
                                  'date' in item 
                                    ? `bg-gray-50 ${getEventTypeColor(item.type).replace('bg-', 'border-l-')}`
                                    : `bg-blue-50 ${getTaskTypeColor(item.category).replace('bg-', 'border-l-')}`
                                }`}
                                onClick={() => !('date' in item) && openTaskModal(item)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900 flex items-center">
  {item.title}
  {item.isRecurring && (
    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded-full">
      🔄
    </span>
  )}
</div>
                                    {item.notes && (
                                      <div className="text-xs text-gray-600 mt-1 flex items-start space-x-1">
                                        <FileText size={10} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="truncate">{item.notes}</span>
                                      </div>
                                    )}
                                    <div className="text-xs text-gray-600 mt-1">
                                      {'date' in item ? (
                                        `${item.time} • ${item.duration} • ${item.type}`
                                      ) : (
                                        `${formatTime(item.dueTime)} • ${item.duration || 'No duration'} • ${item.category}`
                                      )}
                                    </div>
                                  </div>
                                  {!('date' in item) && (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTask(item.id);
                                      }}
                                      className="text-gray-400 hover:text-blue-600 ml-2 cursor-pointer p-1"
                                    >
                                      <CheckCircle size={16} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-12 border-b border-gray-100"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unscheduled Tasks */}
            {getActiveTasksForDate(selectedDate).filter(task => !task.dueTime).length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Unscheduled Tasks</h4>
                <div className="grid grid-cols-1 gap-2">
                  {getActiveTasksForDate(selectedDate)
                    .filter(task => !task.dueTime)
                    .map(task => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100" onClick={() => openTaskModal(task)}>
                        <div className={`w-3 h-3 ${getTaskTypeColor(task.category)} rounded-full flex-shrink-0`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 flex items-center">
  {task.title}
  {task.isRecurring && (
    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
      🔄 Recurring
    </span>
  )}
</div>
                          <div className="text-sm text-gray-600">
                            {task.category} • {task.duration || 'No duration'} • {task.priority} priority
                          </div>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                          }}
                          className="text-gray-400 hover:text-blue-600 cursor-pointer p-1"
                        >
                          <CheckCircle size={18} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {userTier === 'free' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-blue-600" />
            <div>
              <div className="font-medium text-blue-800">Calendar Sync Available</div>
              <div className="text-sm text-blue-700">Connect your Google Calendar, Outlook, and more with Premium</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Settings</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Current Plan</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              userTier === 'premium' 
                ? 'bg-gold-100 text-gold-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {userTier === 'premium' ? 'Premium' : 'Free'}
            </span>
          </div>
          {userTier === 'free' && (
            <button
              onClick={() => setUserTier('premium')}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Time Zone</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your time zone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getTimezoneList().map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span>Current time in selected zone:</span>
              <span className="font-medium">
                {new Date().toLocaleTimeString('en-US', {
                  timeZone: timezone,
                  hour12: true,
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Current date in selected zone:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString('en-US', {
                  timeZone: timezone,
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Voice Commands</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Voice Task Creation</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              speechRecognition 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {speechRecognition ? 'Available' : 'Not Supported'}
            </span>
          </div>
          {speechRecognition && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Try saying:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>"Add high priority work task call client tomorrow at 2 PM"</div>
                <div>"Create grocery shopping task buy milk today"</div>
                <div>"Add health task gym workout reminder"</div>
                <div>"New urgent meeting prep task"</div>
              </div>
            </div>
          )}
          {!speechRecognition && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="text-yellow-800 text-sm">
                Voice commands require a compatible browser. Try using Safari on iOS or Chrome on Android.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Notifications</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Task Reminders</span>
            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
          </div>
          <div className="flex justify-between items-center">
            <span>Daily Summary</span>
            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
          </div>
          <div className="flex justify-between items-center">
            <span>Calendar Alerts</span>
            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
          </div>
          <div className="flex justify-between items-center">
            <span>Time Zone Change Alerts</span>
            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Premium Features</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Star size={16} className="text-yellow-500" />
            <span className={userTier === 'premium' ? 'text-green-600' : 'text-gray-500'}>
              Unlimited Tasks
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Star size={16} className="text-yellow-500" />
            <span className={userTier === 'premium' ? 'text-green-600' : 'text-gray-500'}>
              Calendar Sync
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Star size={16} className="text-yellow-500" />
            <span className={userTier === 'premium' ? 'text-green-600' : 'text-gray-500'}>
              Multiple Time Zones
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Star size={16} className="text-yellow-500" />
            <span className={userTier === 'premium' ? 'text-green-600' : 'text-gray-500'}>
              Advanced Analytics
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Star size={16} className="text-yellow-500" />
            <span className={userTier === 'premium' ? 'text-green-600' : 'text-gray-500'}>
              Priority Support
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            Export Your Data
          </button>
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            Privacy Policy
          </button>
          <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-gray-900">WeeklyPlanner</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={startVoiceRecognition}
              disabled={!speechRecognition || isListening}
              className={`p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : speechRecognition 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isListening ? 'Listening...' : 'Add task by voice'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button className="text-gray-600 hover:text-blue-600">
              <Bell size={20} />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-600 hover:text-blue-600"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuOpen(false)}>
          <div className="bg-white w-64 h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={() => setMenuOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => { setCurrentView('dashboard'); setMenuOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg ${
                    currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { setCurrentView('tasks'); setMenuOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg ${
                    currentView === 'tasks' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => { setCurrentView('calendar'); setMenuOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg ${
                    currentView === 'calendar' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => { setCurrentView('settings'); setMenuOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg ${
                    currentView === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recognition Feedback */}
      {isListening && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <Mic size={16} className="animate-pulse" />
          <span>Listening... Say your task</span>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 pb-24 max-h-screen overflow-y-auto">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'tasks' && <TasksView />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'settings' && <SettingsView />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Calendar size={20} />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentView('tasks')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              currentView === 'tasks' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <CheckCircle size={20} />
            <span className="text-xs mt-1">Tasks</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-600 text-white"
          >
            <Plus size={20} />
            <span className="text-xs mt-1">Add</span>
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              currentView === 'calendar' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Clock size={20} />
            <span className="text-xs mt-1">Calendar</span>
          </button>
          <button
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${
              currentView === 'settings' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={closeTaskModal}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdd={(taskData) => {
            if (userTier === 'free' && tasks.length >= 10) {
              alert('Free tier limited to 10 tasks. Please upgrade to Premium for unlimited tasks.');
              return;
            }
            addTask(taskData);
          }}
        />
      )}
    </div>
  );
};

export default WeeklyPlannerApp;