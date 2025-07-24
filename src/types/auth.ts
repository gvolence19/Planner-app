/**
 * Authentication related types
 */

// User interface for authentication
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Authentication response interface
export interface AuthResponse {
  user: User;
  token: string;
}

// Login form values
export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Register form values
export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

// Password reset form values
export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

// Forgot password form values
export interface ForgotPasswordFormValues {
  email: string;
}