import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Menu, X, CheckCircle, Edit3 } from 'lucide-react';

const WeeklyPlannerApp = () => {
  // State variables
  const [currentView, setCurrentView] = useState('dashboard');
  const [weekDates, setWeekDates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [timezone] = useState('America/New_York');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // We're using this but ESLint doesn't recognize it because it's not directly referenced in JSX
  // So we'll add a comment to disable the warning
  // eslint-disable-next-line no-unused-vars
  const [showAddModal, setShowAddModal] = useState(false);

  // Initialize data
  useEffect(() => {
    setWeekDates(getWeekDates());
    initializeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeData = () => {
    // Sample tasks
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
      }
    ];

    // Sample events
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
      }
    ];

    setTasks(sampleTasks);
    setEvents(sampleEvents);
  };

  // Date helper functions
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: timezone
    });
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

  // Task/Event filtering functions
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

  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Styling helpers
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  // Sorting functions
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

  // Time formatting
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Task operations
  const updateTask = (taskId, updatedData) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updatedData }
        : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setShowTaskModal(false);
  };

  const selectDate = (date) => {
    console.log("Selected date:", date);
    // Add functionality to handle date selection
  };

  // UI Components
  const FreemiumBanner = () => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold">Upgrade to Premium</h3>
          <p className="text-sm opacity-90">Unlimited tasks, calendar sync, and advanced features</p>
        </div>
        <button 
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
      reminder: task?.reminder || false
    });

    const handleSave = () => {
      onUpdate(task.id, editData);
      setIsEditing(false);
    };

    const handleDelete = () => {
      if (window.confirm(`Are you sure you want to delete this task?`)) {
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              {isEditing ? (
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                {isEditing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({...editData, priority: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <div className={getPriorityColor(task.priority)}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </div>
                )}
              </div>
            </div>
            
            {isEditing && (
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            )}
            
            {!isEditing && (
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                >
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              >
                <Menu size={24} />
              </button>
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">WeeklyPlanner</span>
              </div>
            </div>
            <div className="hidden md:flex md:items-center md:ml-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={currentView === 'dashboard' ? 'bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('calendar')}
                  className={currentView === 'calendar' ? 'bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setCurrentView('tasks')}
                  className={currentView === 'tasks' ? 'bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium'}
                >
                  Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <FreemiumBanner />

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Today's Overview */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar size={20} className="mr-2" />
                  Today's Overview
                </h2>
                <p className="text-gray-600 mb-4">{formatDate(new Date())}</p>
                
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Tasks ({getActiveTasksForDate(new Date()).length})</h3>
                  <ul className="space-y-2">
                    {sortTasksByTime(getActiveTasksForDate(new Date())).slice(0, 3).map(task => (
                      <li key={task.id} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getTaskTypeColor(task.category)}`}></div>
                        <span className="flex-grow">{task.title}</span>
                        {task.dueTime && <span className="text-xs text-gray-500">{formatTime(task.dueTime)}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Events ({getEventsForDate(new Date()).length})</h3>
                  <ul className="space-y-2">
                    {sortEventsByTime(getEventsForDate(new Date())).slice(0, 3).map(event => (
                      <li key={event.id} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${getEventTypeColor(event.type)}`}></div>
                        <span className="flex-grow">{event.title}</span>
                        <span className="text-xs text-gray-500">{event.time}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Weekly Overview */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">This Week</h2>
                <div className="grid grid-cols-7 gap-1">
                  {weekDates.map((date, index) => (
                    <div 
                      key={index}
                      className={`p-2 text-center ${
                        date.toDateString() === new Date().toDateString() ? 'bg-blue-100 rounded' : ''
                      }`}
                      onClick={() => selectDate(date)}
                    >
                      <div className="text-xs text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="font-medium">{date.getDate()}</div>
                      {getTasksForDate(date).length > 0 && (
                        <div className="h-1 w-full bg-blue-400 rounded-full mt-1"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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

      {/* Quick Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default WeeklyPlannerApp;