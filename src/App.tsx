import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Let's try adding back basic UI components one by one
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Test login with shadcn/ui components
function TestLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login Page</CardTitle>
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
          <CardTitle>Main App</CardTitle>
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
          <CardTitle>Register Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Registration functionality</p>
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

function TestNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>404 - Page Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go Home
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
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<TestLogin />} />
        <Route path="/register" element={<TestRegister />} />
        <Route path="/forgot-password" element={
          <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
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
                <CardTitle>Reset Password</CardTitle>
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
                <CardTitle>OAuth Callback</CardTitle>
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
        <Route path="*" element={<TestNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;