import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar, ListChecks } from 'lucide-react';
import AnimatedGradientText from '@/components/AnimatedGradientText';
import { ThemeToggle } from '@/components/ThemeToggle';
import LoginForm from '@/components/auth/LoginForm';
import { User } from '@/types/auth';
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useLocalStorage } from '@/hooks/use-local-storage';
import NotFound from './pages/NotFound';

// Working components
import NewTaskDialog from '@/components/NewTaskDialog';
import TaskList from '@/components/TaskList';

// TEST: CalendarView component
import CalendarView from '@/components/CalendarView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) return false;
        if (error instanceof Error && error.message.includes('403')) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

const googleClientId = "246690586453-lhel5i1bk1gmn503u6to8rsl8r3d3hrb.apps.googleusercontent.com";

function LoginPage() {
  const handleLoginSuccess = (user: User) => {
    console.log("User authenticated:", user);
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          <AnimatedGradientText text="Task Planner" />
        </h1>
        <p className="text-muted-foreground">Sign in to access your tasks and calendar</p>
      </div>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

// Test CalendarView component
function TestCalendarView() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('planner-tasks', []);
  const [categories, setCategories] = useLocalStorage<TaskCategory[]>('planner-categories', DEFAULT_CATEGORIES);
  const [view, setView] = useLocalStorage<'list' | 'calendar' | 'grocery'>('planner-view', 'list');
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { isPremium } = useSubscription();

  const addTask = (task: Task) => {
    setTasks([...tasks, { ...task, id: crypto.randomUUID(), createdAt: new Date() }]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
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
                <TaskList
                  tasks={tasks}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  categories={categories}
                />
              </CardContent>
            </Card>
          )}

          {view === 'calendar' && (
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                {/* TEST: Use actual CalendarView component */}
                <CalendarView
                  tasks={tasks}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  categories={categories}
                />
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

      <NewTaskDialog
        open={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        onAddTask={addTask}
        categories={categories}
      />
    </div>
  );
}

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="planner-ui-theme">
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <SubscriptionProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster 
                position="top-right"
                expand={false}
                richColors
                closeButton
              />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={
                    <div className="min-h-screen flex items-center justify-center p-4">
                      <Card className="w-full max-w-md">
                        <CardHeader>
                          <CardTitle>Register</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Button onClick={() => window.location.href = '/login'} className="w-full">
                            Go to Login
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  } />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <TestCalendarView />
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