import { useState } from "react";
import { Navigate } from "react-router-dom";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import AnimatedGradientText from "@/components/AnimatedGradientText";

export default function ResetPasswordPage() {
  const [isAuthenticated] = useState(() => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    return !!token;
  });
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-background/80">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          <AnimatedGradientText>Task Planner</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground">Create a new password</p>
      </div>
      
      <ResetPasswordForm />
    </div>
  );
}