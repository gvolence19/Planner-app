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

  // Fix date objects that come from localStorage as strings
  useEffect(() => {
    if (tasks.length > 0) {
      const fixedTasks = tasks.map(task => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : undefined,
      }));
      
      // Only update if there are actual differences to avoid infinite loops
      const hasDateChanges = fixedTasks.some((task, index) => {
        const original = tasks[index];
        return (
          (task.dueDate?.getTime() !== new Date(original.dueDate || 0).getTime()) ||
          (task.createdAt?.getTime() !== new Date(original.createdAt).getTime())
        );
      });
      
      if (hasDateChanges) {
        setTasks(fixedTasks);
      }
    }
  }, []);

  // Initialize pattern learning system
  const patternLearning = new PatternLearningSystem(tasks);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    
    // Learn from the new task
    patternLearning.learnFromTask(task);
    
    // Handle recurring tasks
    if (task.recurring && task.recurring !== 'none' && task.dueDate) {
      const recurringTasks = generateRecurringTasks(task);
      setTasks(prev => [...prev, ...recurringTasks]);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const updateMultipleTasks = (taskIds: string[], updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      taskIds.includes(task.id)
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const generateRecurringTasks = (baseTask: Task): Task[] => {
    if (!baseTask.dueDate || !baseTask.recurring || baseTask.recurring === 'none') {
      return [];
    }

    const recurringTasks: Task[] = [];
    const baseDate = new Date(baseTask.dueDate);
    
    // Generate next 5 occurrences
    for (let i = 1; i <= 5; i++) {
      let nextDate: Date;
      
      switch (baseTask.recurring) {
        case 'daily':
          nextDate = addDays(baseDate, i);
          break;
        case 'weekly':
          nextDate = addDays(baseDate, i * 7);
          break;
        case 'monthly':
          nextDate = addMonths(baseDate, i);
          break;
        default:
          continue;
      }
      
      const recurringTask: Task = {
        ...baseTask,
        id: `${baseTask.id}-recurring-${i}`,
        dueDate: nextDate,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      recurringTasks.push(recurringTask);
    }
    
    return recurringTasks;
  };

  const handleCategoriesChange = (newCategories: TaskCategory[]) => {
    setCategories(newCategories);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-4">
            <AnimatedGradientText className="text-2xl font-bold">
              Planner App
            </AnimatedGradientText>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              title="Task List"
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