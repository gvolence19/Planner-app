import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import LoginPage from '@/pages/auth/LoginPage';
import NotFound from '@/pages/NotFound';

// Import the components we're testing
import NewTaskDialog from '@/components/NewTaskDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Task, TaskCategory, DEFAULT_CATEGORIES } from '@/types';

// Protected route component using your existing auth pattern
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Test Component for NewTaskDialog
const TestNewTaskDialogApp: React.FC = () => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories] = useState<TaskCategory[]>(DEFAULT_CATEGORIES);

  const handleAddTask = (task: Task) => {
    console.log('✅ Task successfully created:', task);
    setTasks(prev => [...prev, task]);
    setIsNewTaskDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            🧪 Testing NewTaskDialog Component
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Test Status */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🎯 Critical Test Phase
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
              Testing the real NewTaskDialog component with all its complex dependencies:
            </p>
            <ul className="text-sm text-blue-600 dark:text-blue-400 ml-4 list-disc space-y-1">
              <li><strong>date-fns</strong> - Date formatting library</li>
              <li><strong>Calendar UI component</strong> - Date picker</li>
              <li><strong>SmartTaskInput</strong> - AI-powered task creation</li>
              <li><strong>LocationInput</strong> - Location autocomplete</li>
              <li><strong>Form validation</strong> - Input validation</li>
            </ul>
          </div>

          {/* Test Button */}
          <div className="text-center">
            <Button 
              size="lg"
              onClick={() => setIsNewTaskDialogOpen(true)}
              className="px-8 py-3"
            >
              🚀 Open NewTaskDialog (Critical Test)
            </Button>
          </div>

          {/* Results Display */}
          {tasks.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ Success! Tasks Created ({tasks.length})
              </h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="p-3 bg-white dark:bg-gray-800 border rounded-lg">
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">{task.description}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Priority: {task.priority} | Category: {task.category || 'None'}
                      {task.dueDate && ` | Due: ${task.dueDate.toLocaleDateString()}`}
                      {task.location && ` | Location: ${task.location}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              📋 Test Instructions
            </h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
              <p><strong>Step 1:</strong> Click "Open NewTaskDialog" above</p>
              <p><strong>Step 2a - If dialog opens successfully:</strong> NewTaskDialog is NOT causing the constructor error. We need to test other components next.</p>
              <p><strong>Step 2b - If page crashes with "as is not a constructor":</strong> 🎯 We've found the problematic component! The error is in NewTaskDialog or one of its dependencies.</p>
              <p className="text-red-600 dark:text-red-400 font-medium">
                ⚠️ Most likely culprits: date-fns import, Calendar component, or SmartTaskInput
              </p>
            </div>
          </div>

          {/* The actual NewTaskDialog component */}
          <NewTaskDialog
            open={isNewTaskDialogOpen}
            onOpenChange={setIsNewTaskDialogOpen}
            onAddTask={handleAddTask}
            categories={categories}
            tasks={tasks}
          />
          
        </CardContent>
      </Card>
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
                  {/* Login Route */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<LoginPage />} />
                  
                  {/* Protected Routes - Testing NewTaskDialog */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <TestNewTaskDialogApp />
                    </ProtectedRoute>
                  } />
                  
                  {/* Not Found */}
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