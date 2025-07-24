import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';

// Define auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  setNewPassword: (token: string, password: string) => Promise<void>;
}

// Create auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('Not implemented'); },
  loginWithGoogle: async () => { throw new Error('Not implemented'); },
  logout: () => {},
  resetPassword: async () => { throw new Error('Not implemented'); },
  setNewPassword: async () => { throw new Error('Not implemented'); },
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for user on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Get user from localStorage (in a real app, we would verify the token with the backend)
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear any invalid auth data
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, rememberMe = false): Promise<User> => {
    try {
      setIsLoading(true);
      
      // Mock login API call - replace with actual implementation
      // In a real app, we would send credentials to a backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: 'user-123',
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      };
      
      // Store token and user
      if (rememberMe) {
        localStorage.setItem('auth_token', 'mock-jwt-token');
      } else {
        sessionStorage.setItem('auth_token', 'mock-jwt-token');
      }
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Google login function
  const loginWithGoogle = async (): Promise<User> => {
    try {
      setIsLoading(true);
      
      // Mock Google OAuth - replace with actual implementation
      // In a real app, we would integrate with Google OAuth API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: 'google-user-123',
        email: 'user@example.com',
        name: 'Google User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google-user',
      };
      
      // Store token and user
      localStorage.setItem('auth_token', 'mock-google-jwt-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return mockUser;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    // Clear auth data
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
  };
  
  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Mock password reset API call - replace with actual implementation
      // In a real app, we would send the email to a backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Nothing to do here in the mock implementation
      console.log(`Password reset link sent to ${email}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set new password function
  const setNewPassword = async (token: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Mock password reset API call - replace with actual implementation
      // In a real app, we would send the token and new password to a backend API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Nothing to do here in the mock implementation
      console.log(`Password reset with token ${token}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    setNewPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}