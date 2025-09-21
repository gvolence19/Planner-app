import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from '@/contexts/SubscriptionContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import LoginPage from '@/pages/auth/LoginPage';
import NotFound from '@/pages/NotFound';

// Import all the advanced components
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  PlusCircle, Calendar, ListChecks, ShoppingBasket, Tags, Utensils, Moon, 
  FolderOpen, FileText, Filter, CalendarIcon, RepeatIcon, Lock, Clock,
  Settings, Mic
} from 'lucide-react';

// Import all your existing components
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import GroceryList from '@/components/GroceryList';
import VoiceCommandButton from '@/components/VoiceCommandButton';
import CategoryManager from '@/components/CategoryManager';
import SettingsDialog from '@/components/SettingsDialog';
import ProjectManager from '@/components/ProjectManager';
import TaskTemplateManager from '@/components/TaskTemplateManager';
import AdvancedTaskFilter from '@/components/AdvancedTaskFilter';
import { ThemeToggle } from '@/components/ThemeToggle';
import AnimatedGradientText from '@/components/AnimatedGradientText';
import MealReminderManager from '@/components/MealReminderManager';
import SleepWakeManager from '@/components/SleepWakeManager';
import LocationInput from '@/components/LocationInput';

// Import the correct SmartTaskInput
import { SmartTaskInput } from '@/components/SmartTaskInput';

// Import types
import { Task, TaskCategory, DEFAULT_CATEGORIES, PRIORITIES, RECURRING_OPTIONS } from '@/types';
import { Project, TaskTemplate, TaskFilter } from '@/types/project';
import { FREE_CATEGORIES } from '@/types/subscription';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { addDays, addWeeks, addMonths, isSameDay, format } from 'date-fns';
import { cn } from '@/lib/utils';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Complete NewTaskDialog with all features
const FullFeaturedNewTaskDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Task) => void;
  initialDate?: Date;
  categories: TaskCategory[];
  tasks: Task[];
}> = ({ open, onOpenChange, onAddTask, initialDate, categories = [], tasks = [] }) => {
  const { isPremium } = useSubscription();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDate);
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [recurring, setRecurring] = useState<Task['recurring']>('none');
  const [location, setLocation] = useState('');
  
  // AI-related state
  const [isAISuggested, setIsAISuggested] = useState(false);
  const [aiCategory, setAiCategory] = useState<string | undefined>(undefined);
  
  // Filter categories for free users
  const availableCategories = isPremium 
    ? categories 
    : categories.filter(cat => FREE_CATEGORIES.includes(cat.name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalDuration = duration === 'custom' ? customDuration : duration;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      category,
      priority,
      dueDate,
      startTime: startTime.trim() || undefined,
      duration: finalDuration.trim() || undefined,
      createdAt: new Date(),
      recurring,
      location: location.trim() || undefined,
      // AI fields
      isAISuggested,
      aiCategory
    };

    onAddTask(newTask);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(undefined);
    setPriority('medium');
    setDueDate(initialDate);
    setStartTime('');
    setDuration('');
    setCustomDuration('');
    setRecurring('none');
    setLocation('');
    setIsAISuggested(false);
    setAiCategory(undefined);
  };

  const handleSmartTaskCreate = (taskData: {
    title?: string;
    category?: string;
    priority?: Task['priority'];
    location?: string;
    duration?: string;
    startTime?: string;
    dueDate?: Date;
    isAISuggested?: boolean;
    aiCategory?: string;
  }) => {
    console.log('Smart task data received:', taskData);
    if (taskData.title) setTitle(taskData.title);
    if (taskData.category) setCategory(taskData.category);
    if (taskData.priority) setPriority(taskData.priority);
    if (taskData.location) setLocation(taskData.location);
    if (taskData.duration) setDuration(taskData.duration);
    if (taskData.startTime) setStartTime(taskData.startTime);
    if (taskData.dueDate) setDueDate(taskData.dueDate);
    if (taskData.isAISuggested) setIsAISuggested(taskData.isAISuggested);
    if (taskData.aiCategory) setAiCategory(taskData.aiCategory);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task *</Label>
            <SmartTaskInput
              onTaskCreate={handleSmartTaskCreate}
              tasks={tasks}
              categories={categories}
              placeholder="What do you need to do?"
              value={title}
              onChange={setTitle}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)" 
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input 
                id="startTime" 
                type="time"
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {duration === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customDuration">Custom Duration (minutes)</Label>
              <Input 
                id="customDuration" 
                type="number"
                value={customDuration} 
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="e.g., 45"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="recurring">Recurring</Label>
            <Select value={recurring} onValueChange={(value: Task['recurring']) => setRecurring(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRING_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'none' ? 'No repeat' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <LocationInput
              value={location}
              onChange={setLocation}
              placeholder={isPremium ? "Enter location" : "Upgrade to premium to add locations"}
              disabled={!isPremium}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main Full-Featured Task Planner Application
const FullFeaturedPlannerApp: React.FC = () => {
  // All state management with localStorage
  const [tasks, setTasks] = useLocalStorage<Task[]>('planner-tasks', []);
  const [categories, setCategories] = useLocalStorage<TaskCategory[]>('planner-categories', DEFAULT_CATEGORIES || [
    { id: '1', name: 'Work', color: '#3b82f6', icon: 'briefcase' },
    { id: '2', name: 'Personal', color: '#10b981', icon: 'user' },
    { id: '3', name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart' },
    { id: '4', name: 'Health', color: '#ef4444', icon: 'heart' },
  ]);
  const [view, setView] = useLocalStorage<'list' | 'calendar' | 'grocery' | 'meals' | 'sleep'>('planner-view', 'list');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isTaskTemplateManagerOpen, setIsTaskTemplateManagerOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  
  // Premium feature state
  const [projects, setProjects] = useLocalStorage<Project[]>('planner-projects', []);
  const [taskTemplates, setTaskTemplates] = useLocalStorage<TaskTemplate[]>('planner-templates', []);
  const [currentFilter, setCurrentFilter] = useLocalStorage<TaskFilter>('planner-filter', {});
  const { isPremium } = useSubscription();

  // Fix date objects that come from localStorage as strings
  useEffect(() => {
    if (tasks.length > 0) {
      const fixedTasks = tasks.map(task => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt)
      }));
      setTasks(fixedTasks);
    }
  }, []);

  // Task management functions
  const addTask = (task: Task) => {
    // Handle recurring tasks
    if (task.recurring && task.recurring !== 'none' && task.dueDate) {
      const recurringTasks: Task[] = [];
      const parentId = task.id;
      
      for (let i = 0; i < 12; i++) { // Create up to 12 recurring instances
        let nextDate: Date;
        
        switch (task.recurring) {
          case 'daily':
            nextDate = addDays(task.dueDate, i);
            break;
          case 'weekly':
            nextDate = addWeeks(task.dueDate, i);
            break;
          case 'monthly':
            nextDate = addMonths(task.dueDate, i);
            break;
          default:
            nextDate = task.dueDate;
        }
        
        const recurringTask: Task = {
          ...task,
          id: i === 0 ? task.id : crypto.randomUUID(),
          dueDate: nextDate,
          recurringParentId: i === 0 ? undefined : parentId,
          createdAt: new Date()
        };
        
        recurringTasks.push(recurringTask);
      }
      
      setTasks(prev => [...prev, ...recurringTasks]);
    } else {
      setTasks(prev => [...prev, task]);
    }
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const updateMultipleTasks = (updatedTasks: Task[]) => {
    setTasks(prev => {
      const updatedMap = new Map(updatedTasks.map(task => [task.id, task]));
      return prev.map(task => updatedMap.get(task.id) || task);
    });
  };

  const handleCategoriesChange = (newCategories: TaskCategory[]) => {
    setCategories(newCategories);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                <AnimatedGradientText>Task Planner</AnimatedGradientText>
              </h1>
              
              {/* Premium Badge */}
              {isPremium && (
                <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                  PREMIUM
                </span>
              )}
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex items-center space-x-1">
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="flex items-center gap-2"
              >
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Tasks</span>
              </Button>
              <Button
                variant={view === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('calendar')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
              <Button
                variant={view === 'grocery' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('grocery')}
                className="flex items-center gap-2"
              >
                <ShoppingBasket className="h-4 w-4" />
                <span className="hidden sm:inline">Grocery</span>
              </Button>
              {isPremium && (
                <>
                  <Button
                    variant={view === 'meals' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('meals')}
                    className="flex items-center gap-2"
                  >
                    <Utensils className="h-4 w-4" />
                    <span className="hidden sm:inline">Meals</span>
                  </Button>
                  <Button
                    variant={view === 'sleep' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('sleep')}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    <span className="hidden sm:inline">Sleep</span>
                  </Button>
                </>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {isPremium && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdvancedFilterOpen(true)}
                    title="Advanced Filter"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProjectManagerOpen(true)}
                    title="Projects"
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsTaskTemplateManagerOpen(true)}
                    title="Templates"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCategoryManagerOpen(true)}
                title="Categories"
              >
                <Tags className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsDialogOpen(true)}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* View Content */}
          {view === 'list' ? (
            <TaskList 
              tasks={tasks} 
              onUpdateTask={updateTask} 
              onUpdateMultipleTasks={updateMultipleTasks}
              onDeleteTask={deleteTask} 
              categories={categories} 
            />
          ) : view === 'calendar' ? (
            <CalendarView 
              tasks={tasks} 
              onUpdateTask={updateTask} 
              onDeleteTask={deleteTask}
              onAddTask={addTask}
              categories={categories}
            />
          ) : view === 'grocery' ? (
            <GroceryList />
          ) : view === 'meals' ? (
            <MealReminderManager onAddTask={addTask} />
          ) : view === 'sleep' ? (
            <SleepWakeManager onAddTask={addTask} />
          ) : null}
        </div>
      </main>

      {/* Enhanced Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        {/* Voice Command Button */}
        <VoiceCommandButton onAddTask={addTask} />
        
        {/* Add Task Button */}
        <Button 
          size="lg" 
          onClick={() => setIsNewTaskDialogOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
          title="Add New Task"
        >
          <PlusCircle className="h-6 w-6 transition-transform group-hover:rotate-90" />
        </Button>
      </div>

      {/* All Dialogs */}
      <FullFeaturedNewTaskDialog 
        open={isNewTaskDialogOpen} 
        onOpenChange={setIsNewTaskDialogOpen} 
        onAddTask={addTask}
        categories={categories}
        tasks={tasks}
      />

      <CategoryManager
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
        categories={categories}
        onCategoriesChange={handleCategoriesChange}
      />

      <SettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      />

      {isPremium && (
        <>
          <ProjectManager
            open={isProjectManagerOpen}
            onOpenChange={setIsProjectManagerOpen}
            projects={projects}
            onProjectsChange={setProjects}
            isPremium={isPremium}
          />

          <TaskTemplateManager
            open={isTaskTemplateManagerOpen}
            onOpenChange={setIsTaskTemplateManagerOpen}
            templates={taskTemplates}
            onTemplatesChange={setTaskTemplates}
            categories={categories}
            isPremium={isPremium}
          />

          <AdvancedTaskFilter
            open={isAdvancedFilterOpen}
            onOpenChange={setIsAdvancedFilterOpen}
            filter={currentFilter}
            onFilterChange={setCurrentFilter}
            categories={categories}
            projects={projects}
            isPremium={isPremium}
          />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <SubscriptionProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<LoginPage />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <FullFeaturedPlannerApp />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </ThemeProvider>
);

export default App;