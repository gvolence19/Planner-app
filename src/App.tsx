import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import AnimatedGradientText from '@/components/AnimatedGradientText';

// Let's test just the LoginForm - this is likely the culprit
import LoginForm from '@/components/auth/LoginForm';
import { User } from '@/types/auth';

// Test login with actual LoginForm component
function TestLogin() {
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
              <Route path="/register" element={
                <div className="min-h-screen flex items-center justify-center p-4">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle>
                        <AnimatedGradientText text="Register Page" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => window.location.href = '/login'} className="w-full">
                        Go to Login
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              } />
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