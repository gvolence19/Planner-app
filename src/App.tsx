import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import LoginPage from '@/pages/auth/LoginPage';
import NotFound from '@/pages/NotFound';

// Import your actual planner components
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, ListChecks, ShoppingBasket, Tags, Utensils, Moon, FolderOpen, FileText, Filter } from 'lucide-react';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import GroceryList from '@/components/GroceryList';
import { ThemeToggle } from '@/components/ThemeToggle';
import AnimatedGradientText from '@/components/AnimatedGradientText';
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Simplified NewTaskDialog that works (without SmartTaskInput)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
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

// Working NewTaskDialog (simplified version)
const WorkingNewTaskDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Task) => void;
  categories: TaskCategory[];
  initialDate?: Date;
}> = ({ open, onOpenChange, onAddTask, categories, initialDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      category,
      priority,
      dueDate,
      createdAt: new Date(),
      recurring: 'none',
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to do?" 
              required
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
                  {categories.map((cat) => (
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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

// Main Task Planner Application
const TaskPlannerApp: React.FC = () => {
  // State management
  const [tasks, setTasks] = useLocalStorage<Task[]>('planner-tasks', []);
  const [categories] = useLocalStorage<TaskCategory[]>('planner-categories', DEFAULT_CATEGORIES || [
    { id: '1', name: 'Work', color: '#3b82f6', icon: 'briefcase' },
    { id: '2', name: 'Personal', color: '#10b981', icon: 'user' },
    { id: '3', name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart' },
    { id: '4', name: 'Health', color: '#ef4444', icon: 'heart' },
  ]);
  const [view, setView] = useLocalStorage<'list' | 'calendar' | 'grocery'>('planner-view', 'list');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  // Task management functions
  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                <AnimatedGradientText>Task Planner</AnimatedGradientText>
              </h1>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                <ListChecks className="h-4 w-4 mr-2" />
                Tasks
              </Button>
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={view === 'grocery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('grocery')}
              >
                <ShoppingBasket className="h-4 w-4 mr-2" />
                Grocery
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
          ) : null}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          onClick={() => setIsNewTaskDialogOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg"
          title="Add New Task"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* Task Dialog */}
      <WorkingNewTaskDialog 
        open={isNewTaskDialogOpen} 
        onOpenChange={setIsNewTaskDialogOpen} 
        onAddTask={addTask}
        categories={categories}
      />
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
                      <TaskPlannerApp />
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