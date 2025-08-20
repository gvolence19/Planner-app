import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, ListChecks, ShoppingBasket, Tags, Utensils, Moon } from 'lucide-react';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import GroceryList from '@/components/GroceryList';
import VoiceCommandButton from '@/components/VoiceCommandButton';
import NewTaskDialog from '@/components/NewTaskDialog';
import CategoryManager from '@/components/CategoryManager';
import SettingsDialog from '@/components/SettingsDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import AnimatedGradientText from '@/components/AnimatedGradientText';
import MealReminderManager from '@/components/MealReminderManager';
import SleepWakeManager from '@/components/SleepWakeManager';
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FREE_CATEGORIES } from '@/types/subscription';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { addDays, addWeeks, addMonths, isSameDay } from 'date-fns';
import { PatternLearningSystem } from '@/lib/pattern-learning';

export default function PlannerApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('planner-tasks', []);
  const [categories, setCategories] = useLocalStorage<TaskCategory[]>('planner-categories', DEFAULT_CATEGORIES);
  const [view, setView] = useLocalStorage<'list' | 'calendar' | 'grocery' | 'meals' | 'sleep'>('planner-view', 'list');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useLocalStorage<boolean>('planner-new-task-dialog', false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const { isPremium } = useSubscription();

  // Fix date objects that come from localStorage as strings and migrate categories
  useEffect(() => {
    if (tasks.length > 0) {
      const fixedTasks = tasks.map(task => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        // Add recurring field if it's missing (for backward compatibility)
        recurring: task.recurring || 'none'
      }));
      setTasks(fixedTasks);
    }

    // Migrate categories to ensure icons are present and all default categories exist
    const existingCategoryNames = categories.map(cat => cat.name);
    
    // Start with existing categories, adding icons if missing
    const migratedCategories = categories.map(existingCat => {
      const defaultCat = DEFAULT_CATEGORIES.find(cat => cat.name === existingCat.name);
      if (defaultCat && !existingCat.icon) {
        return { ...existingCat, icon: defaultCat.icon };
      }
      return existingCat;
    });
    
    // Add any missing default categories
    const finalCategories = [...migratedCategories];
    DEFAULT_CATEGORIES.forEach(defaultCat => {
      if (!existingCategoryNames.includes(defaultCat.name)) {
        finalCategories.push(defaultCat);
      }
    });

    // Update categories if migration is needed
    if (JSON.stringify(finalCategories) !== JSON.stringify(categories)) {
      setCategories(finalCategories);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Process recurring tasks
  useEffect(() => {
    processRecurringTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  const processRecurringTasks = () => {
    const today = new Date();
    const recurringParentTasks = tasks.filter(
      task => task.recurring && task.recurring !== 'none' && !task.recurringParentId
    );
    
    if (recurringParentTasks.length === 0) return;
    
    const newTasks: Task[] = [];
    const existingDates = new Map<string, Date[]>();
    
    // Group existing recurring instances by their parent ID
    tasks.forEach(task => {
      if (task.recurringParentId) {
        const dates = existingDates.get(task.recurringParentId) || [];
        if (task.dueDate) {
          dates.push(new Date(task.dueDate));
        }
        existingDates.set(task.recurringParentId, dates);
      }
    });
    
    // For each recurring task, create instances for the next 3 months if they don't exist
    recurringParentTasks.forEach(parentTask => {
      if (!parentTask.dueDate) return;
      
      const parentDueDate = new Date(parentTask.dueDate);
      const existingInstanceDates = existingDates.get(parentTask.id) || [];
      
      // Define how many future instances to create based on frequency
      const getNextDueDate = (date: Date, frequency: string): Date => {
        switch (frequency) {
          case 'daily':
            return addDays(date, 1);
          case 'weekly':
            return addDays(date, 7);
          case 'biweekly':
            return addDays(date, 14);
          case 'monthly':
            return addMonths(date, 1);
          default:
            return addDays(date, 1);
        }
      };
      
      // Create instances for next 3 months (90 days)
      let currentDate = getNextDueDate(parentDueDate, parentTask.recurring!);
      const endDate = addMonths(today, 3);
      
      while (currentDate <= endDate) {
        // Check if an instance already exists for this date
        const instanceExists = existingInstanceDates.some(date => 
          isSameDay(new Date(date), currentDate)
        );
        
        if (!instanceExists) {
          // Create a new recurring instance
          const newTask: Task = {
            id: crypto.randomUUID(),
            title: parentTask.title,
            description: parentTask.description,
            completed: false,
            category: parentTask.category,
            priority: parentTask.priority,
            dueDate: new Date(currentDate),
            createdAt: new Date(),
            recurringParentId: parentTask.id,
            location: parentTask.location
          };
          
          newTasks.push(newTask);
        }
        
        currentDate = getNextDueDate(currentDate, parentTask.recurring!);
      }
    });
    
    // Add all new recurring instances if any were created
    if (newTasks.length > 0) {
      setTasks([...tasks, ...newTasks]);
    }
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
    // Learn from the new task
    PatternLearningSystem.learnFromTask(task);
  };

  const updateTask = (updatedTask: Task) => {
    // Get the original task to compare changes
    const originalTask = tasks.find(t => t.id === updatedTask.id);
    if (!originalTask) return;
    
    // Handle completion status for recurring tasks
    if ((updatedTask.completed !== originalTask.completed)) {
      // If this is a recurring task or instance of a recurring task
      if (originalTask.recurring && originalTask.recurring !== 'none' || originalTask.recurringParentId) {
        // For recurring tasks, we should update all instances to the same completion state
        // Find the parent ID
        const parentId = originalTask.recurringParentId || updatedTask.id;
        
        // Update all related tasks with the same completion status
        setTasks(tasks.map(task => {
          if (task.id === parentId || task.recurringParentId === parentId) {
            return { ...task, completed: updatedTask.completed };
          }
          return task;
        }));
        return;
      }
    }
    
    // Check if this is a recurring task parent with changed recurring pattern
    if (updatedTask.recurring && updatedTask.recurring !== 'none') {
      if (originalTask.recurring !== updatedTask.recurring) {
        // Delete all child instances and let the useEffect regenerate them
        const filteredTasks = tasks.filter(task => 
          task.id === updatedTask.id || task.recurringParentId !== updatedTask.id
        );
        setTasks([...filteredTasks, updatedTask]);
        return;
      }
    }
    
    // Normal update for non-recurring tasks or other property changes
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  // NEW: Batch update function for multiple tasks
  const updateMultipleTasks = (updatedTasks: Task[]) => {
    // Create a map of updated tasks for quick lookup
    const updateMap = new Map(updatedTasks.map(task => [task.id, task]));
    
    // Update all tasks in one operation
    setTasks(prevTasks => 
      prevTasks.map(task => {
        const updatedTask = updateMap.get(task.id);
        return updatedTask || task;
      })
    );
  };

  const deleteTask = (id: string) => {
    // Check if this is a recurring task
    const taskToDelete = tasks.find(task => task.id === id);
    
    // If not a recurring task or is not related to recurrence, just delete it
    if (!taskToDelete?.recurring || taskToDelete.recurring === 'none') {
      if (!taskToDelete?.recurringParentId) {
        // Regular delete for non-recurring tasks
        setTasks(tasks.filter(task => task.id !== id));
        return;
      }
    }
    
    // Handle recurring tasks (either parent or child instance)
    const isParent = taskToDelete.recurring && taskToDelete.recurring !== 'none' && !taskToDelete.recurringParentId;
    const parentId = isParent ? id : taskToDelete.recurringParentId;
    
    // Per requirement: if we delete a recurring task, it should delete all tasks created for that
    setTasks(tasks.filter(task => 
      task.id !== parentId && task.recurringParentId !== parentId
    ));
  };

  // Check if a category is in use by any tasks
  const isCategoryInUse = (categoryName: string) => {
    return tasks.some(task => task.category === categoryName); // Fixed: removed .name
  };

  // Handle category deletion - reassign tasks to "Other" if their category is deleted
  const handleCategoriesChange = (newCategories: TaskCategory[]) => {
    console.log('handleCategoriesChange called with:', newCategories);
    console.log('Current categories:', categories);
    console.log('isPremium:', isPremium);
    
    // Find category names that have been removed
    const oldCategoryNames = categories.map(c => c.name);
    const newCategoryNames = newCategories.map(c => c.name);
    const removedCategories = oldCategoryNames.filter(name => !newCategoryNames.includes(name));
    
    // For free users, enforce the category count limit (not whitelist)
    if (!isPremium) {
      const maxCategories = 15; // From SUBSCRIPTION_FEATURES.free.maxCategories
      
      if (newCategories.length > maxCategories) {
        // If exceeding limit, keep only the first maxCategories
        const limitedCategories = newCategories.slice(0, maxCategories);
        console.log('Limiting categories to:', limitedCategories);
        newCategories = limitedCategories;
      }
    }
    
    // Update tasks if needed for deleted categories
    if (removedCategories.length > 0) {
      const updatedTasks = tasks.map(task => {
        if (task.category && removedCategories.includes(task.category)) { // Fixed: removed .name
          // Assign to "Other" category or undefined if "Other" doesn't exist
          const otherCategory = newCategories.find(c => c.name === "Other");
          return {
            ...task,
            category: otherCategory?.name || undefined // Fixed: assign category name, not object
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
    }
    
    // Update categories
    setCategories(newCategories);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header with glassmorphism */}
      <header className="sticky top-0 z-50 glass-card border-0 border-b border-border/50">
        <div className="container flex flex-col sm:flex-row h-auto sm:h-20 items-center justify-between py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-pulse-glow">
              <span className="text-xl font-bold text-primary-foreground">📋</span>
            </div>
            <h1 className="text-2xl font-bold">
              <AnimatedGradientText text="Task Planner" className="text-2xl sm:text-3xl font-extrabold" />
            </h1>
          </div>
          
          {/* Modern Navigation */}
          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              title="List View"
              className={`nav-button rounded-xl px-3 py-2 ${view === 'list' ? 'nav-button-active' : ''}`}
            >
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline ml-2 text-xs font-medium">Tasks</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('calendar')}
              title="Calendar View"
              className={`nav-button rounded-xl px-3 py-2 ${view === 'calendar' ? 'nav-button-active' : ''}`}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline ml-2 text-xs font-medium">Calendar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('grocery')}
              title="Grocery List"
              className={`nav-button rounded-xl px-3 py-2 ${view === 'grocery' ? 'nav-button-active' : ''}`}
            >
              <ShoppingBasket className="h-4 w-4" />
              <span className="hidden sm:inline ml-2 text-xs font-medium">Grocery</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('meals')}
              title="Meal Reminders"
              className={`nav-button rounded-xl px-3 py-2 ${view === 'meals' ? 'nav-button-active' : ''}`}
            >
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline ml-2 text-xs font-medium">Meals</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('sleep')}
              title="Sleep & Wake Timers"
              className={`nav-button rounded-xl px-3 py-2 ${view === 'sleep' ? 'nav-button-active' : ''}`}
            >
              <Moon className="h-4 w-4" />
              <span className="hidden sm:inline ml-2 text-xs font-medium">Sleep</span>
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryManagerOpen(true)}
              title="Manage Categories"
              className="btn-modern rounded-xl"
            >
              <Tags className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <SettingsDialog 
              open={isSettingsDialogOpen} 
              onOpenChange={setIsSettingsDialogOpen} 
            />
          </div>
        </div>
      </header>

      {/* Main Content with enhanced styling */}
      <main className="flex-1 container py-6 sm:py-8">
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-6 animate-slide-up">
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
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 animate-slide-in-right">
        {/* Voice Command Button with modern styling */}
        <div className="relative">
          <VoiceCommandButton onAddTask={addTask} />
        </div>
        
        {/* Enhanced Add Task Button */}
        <Button 
          size="lg" 
          onClick={() => setIsNewTaskDialogOpen(true)}
          className="btn-floating h-16 w-16 relative group overflow-hidden"
          title="Add New Task"
        >
          <PlusCircle className="h-6 w-6 transition-transform group-hover:rotate-90" />
          <span className="absolute inset-0 rounded-full bg-white/20 transform scale-0 group-hover:scale-100 transition-transform"></span>
        </Button>
      </div>

      {/* Dialogs */}
      <NewTaskDialog 
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
    </div>
  );
}