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

// Import components for testing
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';

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

// Simplified NewTaskDialog without SmartTaskInput to test
const SimpleNewTaskDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Task) => void;
  categories: TaskCategory[];
}> = ({ open, onOpenChange, onAddTask, categories }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
      recurring: 'none',
    };

    onAddTask(newTask);
    setTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task (Simplified)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title" 
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
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

// Test component to isolate the SmartTaskInput issue
const TestSimplifiedDialog: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [testStatus, setTestStatus] = useState<'ready' | 'testing' | 'success' | 'error'>('ready');

  // Safe defaults
  const safeCategories: TaskCategory[] = DEFAULT_CATEGORIES || [
    { id: '1', name: 'Work', color: '#3b82f6', icon: 'briefcase' },
    { id: '2', name: 'Personal', color: '#10b981', icon: 'user' },
    { id: '3', name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart' },
  ];

  const handleAddTask = (task: Task) => {
    console.log('✅ Task creation successful:', task);
    setTasks(prev => [...(prev || []), task]);
    setTestStatus('success');
  };

  const openDialog = () => {
    console.log('🧪 Testing simplified dialog without SmartTaskInput...');
    setTestStatus('testing');
    setIsDialogOpen(true);
  };

  const closeDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && testStatus === 'testing') {
      setTestStatus('ready');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              🧪 Testing Simplified Dialog (No SmartTaskInput)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Hypothesis: SmartTaskInput is causing the map error</h3>
              <p className="text-sm text-blue-700">
                This test uses a simplified dialog without SmartTaskInput, LocationInput, or other complex components.
                If this works, we know SmartTaskInput is the problematic component.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={openDialog} 
                className="w-full" 
                size="lg"
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? '🔄 Testing...' : '🧪 Test Simplified Dialog'}
              </Button>
              
              {testStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Success!</h3>
                  <p className="text-sm text-green-700 mb-2">
                    Simplified dialog works! This confirms SmartTaskInput (or LocationInput) is causing the map error.
                  </p>
                  <p className="text-xs text-green-600">
                    Tasks created: {tasks.length}
                  </p>
                </div>
              )}
              
              {tasks.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Tasks Created:</h4>
                  {tasks.map((task) => (
                    <div key={task.id} className="p-3 bg-white border rounded-lg">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Priority: {task.priority}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔍 Debugging Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <strong>Current Error:</strong> "Cannot read properties of undefined (reading 'map')" in NewTaskDialog
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <strong>Hypothesis:</strong> SmartTaskInput component is trying to map over undefined arrays
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Test:</strong> Use simplified dialog without SmartTaskInput to isolate the issue
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simplified dialog */}
      <SimpleNewTaskDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        onAddTask={handleAddTask}
        categories={safeCategories}
      />
    </div>
  );
};

// Error boundary for catching any remaining issues
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary caught error:', error);
    console.error('🔴 Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-6">
          <CardContent className="p-6">
            <div className="text-red-700 bg-red-50 p-4 rounded">
              <h3 className="font-semibold mb-2">🚨 Error Still Occurred</h3>
              <p className="mb-2">Even the simplified dialog failed:</p>
              <p className="text-sm mb-2"><strong>Error:</strong> {this.state.error?.message}</p>
              <p className="text-xs">This means the issue might be in a different component or deeper in the stack.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

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
                      <ErrorBoundary>
                        <TestSimplifiedDialog />
                      </ErrorBoundary>
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