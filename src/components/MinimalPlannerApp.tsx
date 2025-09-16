// Step 3: Test one complex component import at a time to find the problematic one
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar, ListChecks } from 'lucide-react';
import AnimatedGradientText from '@/components/AnimatedGradientText';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLocalStorage } from '@/hooks/use-local-storage';

// TEST: Let's try importing NewTaskDialog first - this is simpler than TaskList
import NewTaskDialog from '@/components/NewTaskDialog';

export default function TestComponentsApp() {
  // State management
  const [tasks, setTasks] = useLocalStorage<Task[]>('planner-tasks', []);
  const [categories, setCategories] = useLocalStorage<TaskCategory[]>('planner-categories', DEFAULT_CATEGORIES);
  const [view, setView] = useLocalStorage<'list' | 'calendar' | 'grocery'>('planner-view', 'list');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { isPremium } = useSubscription();

  // Task management functions
  const addTask = (task: Task) => {
    setTasks([...tasks, { ...task, id: crypto.randomUUID(), createdAt: new Date() }]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <AnimatedGradientText text="Task Planner" />
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {isPremium ? 'Premium' : 'Free'} Plan
              </span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            onClick={() => setView('list')}
            className="flex items-center gap-2"
          >
            <ListChecks className="h-4 w-4" />
            Tasks ({tasks.length})
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            onClick={() => setView('calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
          <Button
            variant={view === 'grocery' ? 'default' : 'outline'}
            onClick={() => setView('grocery')}
            className="flex items-center gap-2"
          >
            <ListChecks className="h-4 w-4" />
            Grocery
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-6">
          {view === 'list' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Task List</span>
                  <Button 
                    size="sm"
                    onClick={() => setIsNewTaskDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No tasks yet. Click "Add Task" to get started!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="h-4 w-4"
                          />
                          <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                            {task.title}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {view === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Calendar functionality will be added here.
                  You have {tasks.filter(t => t.dueDate).length} tasks with due dates.
                </p>
              </CardContent>
            </Card>
          )}

          {view === 'grocery' && (
            <Card>
              <CardHeader>
                <CardTitle>Grocery List</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Grocery list functionality will be added here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* TEST: Use the NewTaskDialog component */}
      <NewTaskDialog
        open={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        onAddTask={addTask}
        categories={categories}
      />
    </div>
  );
}