import { useState } from "react";
import { Navigate } from "react-router-dom";
import RegisterForm from "@/components/auth/RegisterForm";
import AnimatedGradientText from "@/components/AnimatedGradientText";
import { User } from "@/types/auth";

export function RegisterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if there's an auth token in local storage
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    return !!token;
  });
  
  // If user is already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Handle successful registration
  const handleRegisterSuccess = (user: User) => {
    console.log("User registered:", user);
    setIsAuthenticated(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          <AnimatedGradientText>Task Planner</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground">Create your account to get started</p>
      </div>
      
      <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
}

export default RegisterPage;