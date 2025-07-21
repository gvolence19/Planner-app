import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, ListChecks, ShoppingBasket, Tags } from 'lucide-react';
import TaskList from '@/components/TaskList';
import CalendarView from '@/components/CalendarView';
import GroceryList from '@/components/GroceryList';
import VoiceCommandButton from '@/components/VoiceCommandButton';
import NewTaskDialog from '@/components/NewTaskDialog';
import CategoryManager from '@/components/CategoryManager';
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { addDays, addWeeks, addMonths, isSameDay } from 'date-fns';

export default function PlannerApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('planner-tasks', []);
  const [categories, setCategories] = useLocalStorage<TaskCategory[]>('planner-categories', DEFAULT_CATEGORIES);
  const [view, setView] = useLocalStorage<'list' | 'calendar' | 'grocery'>('planner-view', 'list');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useLocalStorage<boolean>('planner-new-task-dialog', false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

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
            recurringParentId: parentTask.id
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
    // Check if this is a recurring task parent
    if (updatedTask.recurring && updatedTask.recurring !== 'none') {
      // If the recurring pattern changed, also update child instances
      const originalTask = tasks.find(t => t.id === updatedTask.id);
      if (originalTask && originalTask.recurring !== updatedTask.recurring) {
        // Delete all child instances and let the useEffect regenerate them
        const filteredTasks = tasks.filter(task => 
          task.id === updatedTask.id || task.recurringParentId !== updatedTask.id
        );
        setTasks([...filteredTasks, updatedTask]);
        return;
      }
    }
    
    // Normal update for non-recurring or unchanged recurring tasks
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = (id: string) => {
    // Check if this is a recurring parent task
    const taskToDelete = tasks.find(task => task.id === id);
    if (taskToDelete?.recurring && taskToDelete.recurring !== 'none') {
      // Ask if user wants to delete all recurring instances
      const deleteAll = window.confirm(
        "Do you want to delete all recurring instances of this task?"
      );
      
      if (deleteAll) {
        // Delete the parent task and all its instances
        setTasks(tasks.filter(task => 
          task.id !== id && task.recurringParentId !== id
        ));
      } else {
        // Delete just this task
        setTasks(tasks.filter(task => task.id !== id));
      }
    } else {
      // Regular delete for non-recurring tasks
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  // Check if a category is in use by any tasks
  const isCategoryInUse = (categoryName: string) => {
    return tasks.some(task => task.category === categoryName);
  };

  // Handle category deletion - reassign tasks to "Other" if their category is deleted
  const handleCategoriesChange = (newCategories: TaskCategory[]) => {
    // Find category names that have been removed
    const oldCategoryNames = categories.map(c => c.name);
    const newCategoryNames = newCategories.map(c => c.name);
    const removedCategories = oldCategoryNames.filter(name => !newCategoryNames.includes(name));
    
    // Update tasks if needed
    if (removedCategories.length > 0) {
      const updatedTasks = tasks.map(task => {
        if (task.category && removedCategories.includes(task.category)) {
          // Assign to "Other" category or undefined if "Other" doesn't exist
          const otherCategory = newCategories.find(c => c.name === "Other");
          return {
            ...task,
            category: otherCategory ? "Other" : undefined
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
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">Planner</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('list')}
              title="List View"
              className="rounded-full"
            >
              <ListChecks className="h-5 w-5" />
            </Button>
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('calendar')}
              title="Calendar View"
              className="rounded-full"
            >
              <Calendar className="h-5 w-5" />
            </Button>
            <Button
              variant={view === 'grocery' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setView('grocery')}
              title="Grocery List"
              className="rounded-full"
            >
              <ShoppingBasket className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsCategoryManagerOpen(true)}
              title="Manage Categories"
              className="rounded-full ml-2"
            >
              <Tags className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-4">
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
        ) : (
          <GroceryList />
        )}
      </main>

      {/* Add Task Button */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        {/* Voice Command Button */}
        <VoiceCommandButton onAddTask={addTask} />
        
        {/* Add Task Button */}
        <Button 
          size="lg" 
          onClick={() => setIsNewTaskDialogOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <PlusCircle className="h-6 w-6" />
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