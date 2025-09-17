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

// Critical Test: Render NewTaskDialog with minimal props
const TestNewTaskDialogRendering: React.FC = () => {
  const [testState, setTestState] = useState<'ready' | 'testing' | 'success' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  
  // Import NewTaskDialog dynamically and try to render it
  const testNewTaskDialogRendering = async () => {
    setTestState('testing');
    setErrorMessage('');
    
    try {
      console.log('🧪 Attempting to import and render NewTaskDialog...');
      
      // Dynamic import to ensure we're testing the actual rendering
      const { default: NewTaskDialog } = await import('@/components/NewTaskDialog');
      console.log('✅ NewTaskDialog imported successfully');
      
      // Set minimal props to trigger rendering
      setShowDialog(true);
      
      // If we reach this point without error, rendering succeeded
      setTimeout(() => {
        setTestState('success');
        console.log('✅ NewTaskDialog rendered successfully!');
      }, 100);
      
    } catch (error) {
      console.error('❌ NewTaskDialog rendering failed:', error);
      setTestState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleAddTask = (task: Task) => {
    console.log('✅ Task creation would work:', task);
    setShowDialog(false);
    setTestState('success');
  };

  // Render the actual NewTaskDialog when testing
  const renderNewTaskDialog = () => {
    if (!showDialog) return null;
    
    try {
      // Import and use NewTaskDialog synchronously since we already imported it
      const React = require('react');
      const { default: NewTaskDialog } = require('@/components/NewTaskDialog');
      
      return (
        <NewTaskDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onAddTask={handleAddTask}
          categories={DEFAULT_CATEGORIES}
          tasks={[]}
        />
      );
    } catch (error) {
      console.error('❌ Error during NewTaskDialog rendering:', error);
      setTestState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Rendering error');
      return null;
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 CRITICAL TEST: NewTaskDialog Rendering</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Final Test: Rendering Phase</h3>
            <p className="text-sm text-red-700 mb-2">
              All imports work fine. The constructor error happens during rendering.
              This test will attempt to render NewTaskDialog with minimal props.
            </p>
            <p className="text-xs text-red-600">
              <strong>Expected:</strong> This will likely trigger the "as is not a constructor" error.
            </p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={testNewTaskDialogRendering} 
              className="w-full"
              disabled={testState === 'testing'}
            >
              {testState === 'testing' ? '🔄 Testing...' : '🚨 Test NewTaskDialog Rendering (Will Likely Crash)'}
            </Button>
            
            {testState === 'success' && (
              <div className="text-green-700 bg-green-50 p-3 rounded">
                ✅ Success! NewTaskDialog rendered without errors.
                <br />
                This means the error is not in basic rendering - it might be in specific interactions.
              </div>
            )}
            
            {testState === 'error' && (
              <div className="text-red-700 bg-red-50 p-3 rounded">
                ❌ Error during rendering! This is the constructor issue.
                <br />
                <strong>Error:</strong> {errorMessage}
                <br />
                <strong>Check console for full stack trace.</strong>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* This is where the error will likely occur */}
      {renderNewTaskDialog()}
    </div>
  );
};

// Fallback test with error boundary
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
              <h3 className="font-semibold mb-2">🎯 FOUND THE ERROR!</h3>
              <p className="mb-2">The constructor error occurred during NewTaskDialog rendering.</p>
              <p className="text-sm mb-2"><strong>Error:</strong> {this.state.error?.message}</p>
              <p className="text-xs">Check the browser console for the full stack trace to see exactly which component/import is failing.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Main test app
const TestNewTaskDependencies: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">
                🔍 Phase 3: Testing NewTaskDialog Rendering
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ All Imports Work Fine!</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• date-fns: ✅ Working</p>
                  <p>• Calendar UI: ✅ Working</p>
                  <p>• SmartTaskInput: ✅ Working</p>
                  <p>• LocationInput: ✅ Working</p>
                  <p>• NewTaskDialog import: ✅ Working</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ The Problem: Rendering Phase</h3>
                <p className="text-sm text-yellow-700">
                  The "as is not a constructor" error occurs when NewTaskDialog tries to render, 
                  not during import. This test will pinpoint the exact rendering issue.
                </p>
              </div>
            </CardContent>
          </Card>

          <TestNewTaskDialogRendering />
        </div>
      </div>
    </ErrorBoundary>
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
                      <TestNewTaskDependencies />
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