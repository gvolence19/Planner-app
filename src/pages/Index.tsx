import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, ListChecks, ShoppingBasket, Tags, Utensils } from 'lucide-react';
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
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FREE_CATEGORIES } from '@/types/subscription';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { addDays, addWeeks, addMonths, isSameDay } from 'date-fns';

export default function PlannerApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('planner-tasks', []);
  const [categories, setCategories] = useLocalStorage<TaskCategory[]>('planner-categories', DEFAULT_CATEGORIES);
  const [view, setView] = useLocalStorage<'list' | 'calendar' | 'grocery' | 'meals'>('planner-view', 'list');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useLocalStorage<boolean>('planner-new-task-dialog', false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const { isPremium } = useSubscription();

  // Fix date objects that come from localStorage as strings
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
    return tasks.some(task => task.category?.name === categoryName);
  };

  // Handle category deletion - reassign tasks to "Other" if their category is deleted
  const handleCategoriesChange = (newCategories: TaskCategory[]) => {
    // Find category names that have been removed
    const oldCategoryNames = categories.map(c => c.name);
    const newCategoryNames = newCategories.map(c => c.name);
    const removedCategories = oldCategoryNames.filter(name => !newCategoryNames.includes(name));
    
    // For free users, ensure they can't have more than the allowed categories
    if (!isPremium) {
      // Limit to free categories, always keeping the default ones
      const freeCategoriesToKeep = newCategories.filter(
        cat => FREE_CATEGORIES.includes(cat.name)
      ).slice(0, FREE_CATEGORIES.length);
      
      if (freeCategoriesToKeep.length < newCategories.length) {
        // Update tasks to reassign those with premium categories
        const premiumCategoryNames = newCategories
          .filter(cat => !FREE_CATEGORIES.includes(cat.name))
          .map(cat => cat.name);
        
        // Reassign tasks from premium categories to "Other" or first available free category
        const otherCategory = freeCategoriesToKeep.find(c => c.name === "Other") || freeCategoriesToKeep[0];
        
        if (premiumCategoryNames.length > 0) {
          const updatedTasks = tasks.map(task => {
            if (task.category && premiumCategoryNames.includes(task.category.name)) {
              return {
                ...task,
                category: otherCategory
              };
            }
            return task;
          });
          
          setTasks(updatedTasks);
        }
        
        // Only keep the free categories
        newCategories = freeCategoriesToKeep;
      }
    }
    
    // Update tasks if needed for deleted categories
    if (removedCategories.length > 0) {
      const updatedTasks = tasks.map(task => {
        if (task.category && removedCategories.includes(task.category.name)) {
          // Assign to "Other" category or undefined if "Other" doesn't exist
          const otherCategory = newCategories.find(c => c.name === "Other");
          return {
            ...task,
            category: otherCategory || undefined
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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col sm:flex-row h-auto sm:h-16 items-center justify-between py-2 sm:py-4">
          <h1 className="text-xl font-bold mb-2 sm:mb-0">
            <AnimatedGradientText text="Task Planner" className="text-xl sm:text-2xl" />
          </h1>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('list')}
              title="List View"
              className="rounded-full"
            >
              <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('calendar')}
              title="Calendar View"
              className="rounded-full"
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant={view === 'grocery' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grocery')}
              title="Grocery List"
              className="rounded-full"
            >
              <ShoppingBasket className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant={view === 'meals' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('meals')}
              title="Meal Reminders"
              className="rounded-full"
            >
              <Utensils className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCategoryManagerOpen(true)}
              title="Manage Categories"
              className="rounded-full ml-1 sm:ml-2"
            >
              <Tags className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <ThemeToggle />
            <SettingsDialog 
              open={isSettingsDialogOpen} 
              onOpenChange={setIsSettingsDialogOpen} 
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-3 sm:py-6">
        <div className="rounded-xl border shadow-sm bg-card text-card-foreground p-3 sm:p-4 mb-4 sm:mb-6">
          {view === 'list' ? (
            <TaskList tasks={tasks} onUpdateTask={updateTask} onDeleteTask={deleteTask} categories={categories} />
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
          ) : null}
        </div>
      </main>

      {/* Add Task Button */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex flex-col gap-3 sm:gap-4">
        {/* Voice Command Button */}
        <VoiceCommandButton onAddTask={addTask} />
        
        {/* Add Task Button */}
        <Button 
          size="lg" 
          onClick={() => setIsNewTaskDialogOpen(true)}
          className="rounded-full h-12 w-12 sm:h-14 sm:w-14 shadow-lg btn-floating"
        >
          <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* New Task Dialog */}
      <NewTaskDialog 
        open={isNewTaskDialogOpen} 
        onOpenChange={setIsNewTaskDialogOpen} 
        onAddTask={addTask}
        categories={categories}
      />

      {/* Category Manager Dialog */}
      <CategoryManager
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
        categories={categories}
        onCategoriesChange={handleCategoriesChange}
      />
    </div>
  );
}