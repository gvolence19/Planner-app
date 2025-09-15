import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

// Let's test AnimatedGradientText - this was a suspect
import AnimatedGradientText from '@/components/AnimatedGradientText';

// Test login with AnimatedGradientText
function TestLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <AnimatedGradientText text="Login Page" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Please log in to continue</p>
          <Button 
            onClick={() => {
              localStorage.setItem('auth_token', 'test-token');
              window.location.href = '/';
            }}
            className="w-full"
          >
            Test Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TestMain() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <AnimatedGradientText text="Main App" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You are logged in!</p>
          <Button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
            }}
            variant="destructive"
            className="w-full"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TestRegister() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <AnimatedGradientText text="Register Page" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Create your account</p>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple protected route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('auth_token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="planner-ui-theme">
      <AuthProvider>
        <SubscriptionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<TestLogin />} />
              <Route path="/register" element={<TestRegister />} />
              <Route path="/forgot-password" element={
                <div className="min-h-screen flex items-center justify-center p-4">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>
                        <AnimatedGradientText text="Forgot Password" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => window.location.href = '/login'} className="w-full">
                        Back to Login
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              } />
              <Route path="/reset-password" element={
                <div className="min-h-screen flex items-center justify-center p-4">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>
                        <AnimatedGradientText text="Reset Password" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => window.location.href = '/login'} className="w-full">
                        Back to Login
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              } />
              <Route path="/oauth/callback" element={
                <div className="min-h-screen flex items-center justify-center p-4">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>
                        <AnimatedGradientText text="OAuth Callback" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Processing...</p>
                    </CardContent>
                  </Card>
                </div>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <TestMain />
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center p-4">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>
                        <AnimatedGradientText text="404 - Page Not Found" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => window.location.href = '/'} className="w-full">
                        Go Home
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;