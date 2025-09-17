import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import LoginPage from '@/pages/auth/LoginPage';
import NotFound from '@/pages/NotFound';

// Import the UI components we need for testing
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

// Test 1: Just test date-fns imports
const TestDateFnsComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'error'>('pending');

  const testDateFns = () => {
    try {
      // Import and test date-fns - this is the most likely culprit
      import('date-fns').then((dateFns) => {
        console.log('✅ date-fns imported successfully:', dateFns);
        const today = new Date();
        const formatted = dateFns.format(today, 'yyyy-MM-dd');
        console.log('✅ date-fns format works:', formatted);
        setTestResult('success');
      }).catch((error) => {
        console.error('❌ date-fns import failed:', error);
        setTestResult('error');
      });
    } catch (error) {
      console.error('❌ date-fns test failed:', error);
      setTestResult('error');
    }
    setIsOpen(true);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test 1: Date-FNS Library</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Testing date-fns imports</h3>
            <p className="text-sm text-blue-700">
              The date-fns library is commonly responsible for "as is not a constructor" errors.
              This test will try to import and use date-fns functions.
            </p>
          </div>

          <Button onClick={testDateFns} className="w-full">
            🧪 Test date-fns Import
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Date-FNS Test Result</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                {testResult === 'success' && (
                  <div className="text-green-700 bg-green-50 p-3 rounded">
                    ✅ Success! date-fns is working correctly.
                    <br />
                    <strong>Next:</strong> We need to test other NewTaskDialog dependencies.
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="text-red-700 bg-red-50 p-3 rounded">
                    ❌ Error! date-fns is causing the constructor issue.
                    <br />
                    <strong>Found the problem!</strong>
                  </div>
                )}
                {testResult === 'pending' && (
                  <div className="text-blue-700 bg-blue-50 p-3 rounded">
                    🔄 Testing date-fns imports...
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

// Test 2: Test Calendar UI component
const TestCalendarUIComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const testCalendarUI = () => {
    try {
      // Try to import the Calendar UI component
      import('@/components/ui/calendar').then((CalendarModule) => {
        console.log('✅ Calendar UI imported successfully:', CalendarModule);
        setIsOpen(true);
      }).catch((error) => {
        console.error('❌ Calendar UI import failed:', error);
        setIsOpen(true);
      });
    } catch (error) {
      console.error('❌ Calendar UI test failed:', error);
      setIsOpen(true);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test 2: Calendar UI Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">Testing Calendar UI component</h3>
            <p className="text-sm text-orange-700">
              The Calendar component from shadcn/ui might be causing constructor errors.
            </p>
          </div>

          <Button onClick={testCalendarUI} className="w-full">
            🧪 Test Calendar UI Import
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calendar UI Test</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <div className="text-blue-700 bg-blue-50 p-3 rounded">
                  Check the console for Calendar UI import results.
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

// Main test app with tabs
const TestNewTaskDependencies: React.FC = () => {
  const [activeTest, setActiveTest] = useState<'dateFns' | 'calendar'>('dateFns');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              🔍 NewTaskDialog Dependency Testing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">✅ Confirmed: NewTaskDialog is the problem!</h3>
              <p className="text-sm text-red-700">
                The error occurs when NewTaskDialog loads. Now we're testing individual dependencies 
                to find the specific cause of the "as is not a constructor" error.
              </p>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Button 
                variant={activeTest === 'dateFns' ? 'default' : 'outline'}
                onClick={() => setActiveTest('dateFns')}
              >
                Test 1: date-fns
              </Button>
              <Button 
                variant={activeTest === 'calendar' ? 'default' : 'outline'}
                onClick={() => setActiveTest('calendar')}
              >
                Test 2: Calendar UI
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTest === 'dateFns' && <TestDateFnsComponent />}
        {activeTest === 'calendar' && <TestCalendarUIComponent />}
      </div>
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