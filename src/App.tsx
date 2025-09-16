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
import AnimatedGradientText from '@/components/AnimatedGradientText';
import LoginForm from '@/components/auth/LoginForm';
import { User } from '@/types/auth';

// Let's test just the NotFound component
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
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

// Working LoginPage component
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

// Simple main app
function SimplePlannerApp() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <AnimatedGradientText text="Task Planner" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Welcome to your task planner!</p>
          <p>Main planner functionality coming soon...</p>
          <Button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              sessionStorage.removeItem('auth_token');
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

// Protected route component
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
                  {/* Auth Routes */}
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
                  
                  {/* Protected Routes */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <SimplePlannerApp />
                    </ProtectedRoute>
                  } />
                  
                  {/* Test NotFound component */}
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