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
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';
import NewTaskDialog from '@/components/NewTaskDialog';

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

// Final Test: Render NewTaskDialog properly with safe defaults
const TestNewTaskDialogCorrectly: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [testStatus, setTestStatus] = useState<'ready' | 'testing' | 'success' | 'error'>('ready');

  // Ensure we have safe defaults for all required props
  const safeCategories: TaskCategory[] = DEFAULT_CATEGORIES || [
    { id: '1', name: 'Work', color: '#3b82f6', icon: 'briefcase' },
    { id: '2', name: 'Personal', color: '#10b981', icon: 'user' },
    { id: '3', name: 'Shopping', color: '#f59e0b', icon: 'shopping-cart' },
  ];

  const safeTasks: Task[] = tasks || [];

  const handleAddTask = (task: Task) => {
    console.log('✅ Task creation successful:', task);
    setTasks(prev => [...(prev || []), task]);
    setTestStatus('success');
  };

  const openDialog = () => {
    console.log('🧪 Opening NewTaskDialog with safe defaults...');
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
              🎯 Final Test: NewTaskDialog with Correct Imports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Issue Found: require() vs import</h3>
              <p className="text-sm text-yellow-700">
                The original error was caused by using <code>require()</code> in a modern ES6 environment. 
                This test uses proper ES6 imports for NewTaskDialog.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button 
                onClick={openDialog} 
                className="w-full" 
                size="lg"
                disabled={testStatus === 'testing'}
              >
                {testStatus === 'testing' ? '🔄 Testing...' : '🧪 Test NewTaskDialog (Should Work Now)'}
              </Button>
              
              {testStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Success!</h3>
                  <p className="text-sm text-green-700 mb-2">
                    NewTaskDialog is working perfectly. The "as is not a constructor" error is resolved!
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
                      {task.description && (
                        <div className="text-sm text-gray-600">{task.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Priority: {task.priority} | Category: {task.category || 'None'}
                        {task.dueDate && ` | Due: ${task.dueDate.toLocaleDateString()}`}
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
            <CardTitle>🔍 Problem Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <strong>Original Error:</strong> "as is not a constructor" in NewTaskDialog
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <strong>Root Cause:</strong> Test code was using <code>require()</code> instead of ES6 <code>import</code>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <strong>Solution:</strong> Use proper ES6 imports for all components
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* The actual NewTaskDialog - with safe defaults */}
      <NewTaskDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        onAddTask={handleAddTask}
        categories={safeCategories}
        tasks={safeTasks}
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
              <h3 className="font-semibold mb-2">🚨 Unexpected Error Occurred</h3>
              <p className="mb-2">An error was caught by the error boundary:</p>
              <p className="text-sm mb-2"><strong>Error:</strong> {this.state.error?.message}</p>
              <p className="text-xs">This means there might be another issue beyond the require() problem.</p>
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
                        <TestNewTaskDialogCorrectly />
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