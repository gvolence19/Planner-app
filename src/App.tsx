import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Simple test components without any dependencies
function SimpleLogin() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Login Page</h1>
      <p>Please log in to continue</p>
      <button 
        onClick={() => {
          localStorage.setItem('auth_token', 'test-token');
          window.location.href = '/';
        }}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Login
      </button>
    </div>
  );
}

function SimpleMain() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Main App</h1>
      <p>You are logged in!</p>
      <button 
        onClick={() => {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}

function SimpleRegister() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>Register Page</h1>
      <p>Registration functionality</p>
      <button 
        onClick={() => window.location.href = '/login'}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Go to Login
      </button>
    </div>
  );
}

function SimpleNotFound() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>404</h1>
      <p>Page Not Found</p>
      <button 
        onClick={() => window.location.href = '/'}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Go Home
      </button>
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
        <Route path="/login" element={<SimpleLogin />} />
        <Route path="/register" element={<SimpleRegister />} />
        <Route path="/forgot-password" element={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Forgot Password</h1>
            <button onClick={() => window.location.href = '/login'}>Back to Login</button>
          </div>
        } />
        <Route path="/reset-password" element={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Reset Password</h1>
            <button onClick={() => window.location.href = '/login'}>Back to Login</button>
          </div>
        } />
        <Route path="/oauth/callback" element={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>OAuth Callback</h1>
            <p>Processing...</p>
          </div>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <SimpleMain />
          </ProtectedRoute>
        } />
        <Route path="*" element={<SimpleNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;