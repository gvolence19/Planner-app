/**
 * Subscription related types
 */

// Subscription plan type
export type SubscriptionPlan = 'free' | 'premium';

// Subscription features
export interface SubscriptionFeatures {
  maxTasks: number;
  maxCategories: number;
  hasCalendarIntegration: boolean;
  hasPrioritySupport: boolean;
}

// Define features for each plan
export const SUBSCRIPTION_FEATURES: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    maxTasks: 10,
    maxCategories: 2,
    hasCalendarIntegration: false,
    hasPrioritySupport: false,
  },
  premium: {
    maxTasks: Infinity,
    maxCategories: Infinity,
    hasCalendarIntegration: true,
    hasPrioritySupport: true,
  },
};

// Define allowed categories for free plan
export const FREE_CATEGORIES = ['Work', 'Personal'];