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

// Test 3: SmartTaskInput component
const TestSmartTaskInputComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'error'>('pending');

  const testSmartTaskInput = () => {
    try {
      // Try to import SmartTaskInput - this might be causing the constructor error
      import('@/components/SmartTaskInput').then((SmartTaskInputModule) => {
        console.log('✅ SmartTaskInput imported successfully:', SmartTaskInputModule);
        setTestResult('success');
      }).catch((error) => {
        console.error('❌ SmartTaskInput import failed:', error);
        setTestResult('error');
      });
    } catch (error) {
      console.error('❌ SmartTaskInput test failed:', error);
      setTestResult('error');
    }
    setIsOpen(true);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test 3: SmartTaskInput Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">Testing SmartTaskInput component</h3>
            <p className="text-sm text-purple-700">
              SmartTaskInput handles AI-powered task creation and might have dependencies causing constructor errors.
            </p>
          </div>

          <Button onClick={testSmartTaskInput} className="w-full">
            🧪 Test SmartTaskInput Import
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>SmartTaskInput Test Result</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                {testResult === 'success' && (
                  <div className="text-green-700 bg-green-50 p-3 rounded">
                    ✅ Success! SmartTaskInput is working correctly.
                    <br />
                    <strong>Next:</strong> We need to test LocationInput component.
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="text-red-700 bg-red-50 p-3 rounded">
                    ❌ Error! SmartTaskInput is causing the constructor issue.
                    <br />
                    <strong>Found the problem!</strong>
                  </div>
                )}
                {testResult === 'pending' && (
                  <div className="text-blue-700 bg-blue-50 p-3 rounded">
                    🔄 Testing SmartTaskInput imports...
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

// Test 4: LocationInput component
const TestLocationInputComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'error'>('pending');

  const testLocationInput = () => {
    try {
      // Try to import LocationInput - this often has Google Maps dependencies
      import('@/components/LocationInput').then((LocationInputModule) => {
        console.log('✅ LocationInput imported successfully:', LocationInputModule);
        setTestResult('success');
      }).catch((error) => {
        console.error('❌ LocationInput import failed:', error);
        setTestResult('error');
      });
    } catch (error) {
      console.error('❌ LocationInput test failed:', error);
      setTestResult('error');
    }
    setIsOpen(true);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test 4: LocationInput Component</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">Testing LocationInput component</h3>
            <p className="text-sm text-orange-700">
              LocationInput uses Google Maps API and autocomplete, which can cause constructor errors.
            </p>
          </div>

          <Button onClick={testLocationInput} className="w-full">
            🧪 Test LocationInput Import
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>LocationInput Test Result</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                {testResult === 'success' && (
                  <div className="text-green-700 bg-green-50 p-3 rounded">
                    ✅ Success! LocationInput is working correctly.
                    <br />
                    <strong>Next:</strong> We need to test other NewTaskDialog imports.
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="text-red-700 bg-red-50 p-3 rounded">
                    ❌ Error! LocationInput is causing the constructor issue.
                    <br />
                    <strong>Found the problem!</strong>
                  </div>
                )}
                {testResult === 'pending' && (
                  <div className="text-blue-700 bg-blue-50 p-3 rounded">
                    🔄 Testing LocationInput imports...
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

// Test 5: Direct NewTaskDialog imports (but not rendering)
const TestNewTaskDialogImportsComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'error'>('pending');

  const testNewTaskDialogImports = () => {
    try {
      // Try to import NewTaskDialog without rendering it
      import('@/components/NewTaskDialog').then((NewTaskDialogModule) => {
        console.log('✅ NewTaskDialog imported successfully:', NewTaskDialogModule);
        setTestResult('success');
      }).catch((error) => {
        console.error('❌ NewTaskDialog import failed:', error);
        setTestResult('error');
      });
    } catch (error) {
      console.error('❌ NewTaskDialog test failed:', error);
      setTestResult('error');
    }
    setIsOpen(true);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test 5: NewTaskDialog Import (No Render)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Testing NewTaskDialog import only</h3>
            <p className="text-sm text-red-700">
              This tests if the error occurs during import vs. during rendering of NewTaskDialog.
            </p>
          </div>

          <Button onClick={testNewTaskDialogImports} className="w-full">
            🧪 Test NewTaskDialog Import Only
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>NewTaskDialog Import Test Result</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                {testResult === 'success' && (
                  <div className="text-green-700 bg-green-50 p-3 rounded">
                    ✅ Success! NewTaskDialog imports correctly.
                    <br />
                    <strong>This means:</strong> The error happens during rendering, not import.
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="text-red-700 bg-red-50 p-3 rounded">
                    ❌ Error! NewTaskDialog import itself is causing the constructor issue.
                    <br />
                    <strong>The problem is in NewTaskDialog's dependencies!</strong>
                  </div>
                )}
                {testResult === 'pending' && (
                  <div className="text-blue-700 bg-blue-50 p-3 rounded">
                    🔄 Testing NewTaskDialog import...
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

// Main test app
const TestNewTaskDependencies: React.FC = () => {
  const [activeTest, setActiveTest] = useState<'smartTask' | 'location' | 'imports'>('smartTask');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              🔍 Phase 2: Testing Remaining Dependencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ Confirmed: date-fns and Calendar UI work fine!</h3>
              <p className="text-sm text-green-700">
                The constructor error is NOT in date-fns or Calendar UI. Now testing the remaining NewTaskDialog dependencies.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant={activeTest === 'smartTask' ? 'default' : 'outline'}
                onClick={() => setActiveTest('smartTask')}
              >
                Test 3: SmartTaskInput
              </Button>
              <Button 
                variant={activeTest === 'location' ? 'default' : 'outline'}
                onClick={() => setActiveTest('location')}
              >
                Test 4: LocationInput
              </Button>
              <Button 
                variant={activeTest === 'imports' ? 'default' : 'outline'}
                onClick={() => setActiveTest('imports')}
              >
                Test 5: Import Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {activeTest === 'smartTask' && <TestSmartTaskInputComponent />}
        {activeTest === 'location' && <TestLocationInputComponent />}
        {activeTest === 'imports' && <TestNewTaskDialogImportsComponent />}
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