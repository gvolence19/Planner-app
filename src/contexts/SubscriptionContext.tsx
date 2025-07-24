import React, { createContext, useContext, useEffect, useState } from 'react';
import { SubscriptionPlan, SUBSCRIPTION_FEATURES } from '@/types/subscription';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Define subscription context type
interface SubscriptionContextType {
  plan: SubscriptionPlan;
  features: typeof SUBSCRIPTION_FEATURES.free | typeof SUBSCRIPTION_FEATURES.premium;
  isPremium: boolean;
  upgradeToPremium: () => Promise<void>;
  cancelPremium: () => Promise<void>;
}

// Create subscription context with default values
const SubscriptionContext = createContext<SubscriptionContextType>({
  plan: 'free',
  features: SUBSCRIPTION_FEATURES.free,
  isPremium: false,
  upgradeToPremium: async () => { throw new Error('Not implemented'); },
  cancelPremium: async () => { throw new Error('Not implemented'); },
});

// Custom hook to use subscription context
export const useSubscription = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

// Subscription provider component
export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user } = useAuth();
  const [plan, setPlan] = useLocalStorage<SubscriptionPlan>('planner-subscription-plan', 'free');
  const [isLoading, setIsLoading] = useState(false);

  // Get features based on current plan
  const features = SUBSCRIPTION_FEATURES[plan];
  const isPremium = plan === 'premium';

  // Upgrade to premium
  const upgradeToPremium = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be a call to a payment processor
      // For now, we'll just simulate a successful upgrade
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlan('premium');
      toast.success('Upgraded to Premium Plan!');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel premium subscription
  const cancelPremium = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // In a real app, this would cancel the subscription
      // For now, we'll just simulate a successful cancellation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPlan('free');
      toast.success('Reverted to Free Plan');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscription context value
  const value = {
    plan,
    features,
    isPremium,
    upgradeToPremium,
    cancelPremium,
    isLoading
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}