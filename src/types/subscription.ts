/**
 * Subscription related types
 */

// Subscription plan type
export type SubscriptionPlan = 'free' | 'premium';

// Subscription features interface expanded for premium features
export interface SubscriptionFeatures {
  maxTasks: number;
  maxCategories: number;
  hasCalendarIntegration: boolean;
  hasPrioritySupport: boolean;
  // Advanced premium features
  recurringTasks: boolean;
  googleCalendarSync: boolean;
  taskTemplates: boolean;
  advancedFiltering: boolean;
  taskDependencies: boolean;
  projectGrouping: boolean;
  taskSharing: boolean;
  multiDeviceSync: boolean;
  advancedNotifications: boolean;
  bulkOperations: boolean;
  productivityAnalytics: boolean;
  cloudBackup: boolean;
  customThemes: boolean;
}

export const SUBSCRIPTION_FEATURES: Record<SubscriptionPlan, SubscriptionFeatures> = {
  free: {
    maxTasks: 50,
    maxCategories: 15,
    hasCalendarIntegration: false,
    hasPrioritySupport: false,
    // Advanced features (Premium only)
    recurringTasks: false,
    googleCalendarSync: false,
    taskTemplates: false,
    advancedFiltering: false,
    taskDependencies: false,
    projectGrouping: false,
    taskSharing: false,
    multiDeviceSync: false,
    advancedNotifications: false,
    bulkOperations: false,
    productivityAnalytics: false,
    cloudBackup: false,
    customThemes: false,
  },
  premium: {
    maxTasks: Infinity,
    maxCategories: Infinity,
    hasCalendarIntegration: true,
    hasPrioritySupport: true,
    // Advanced features
    recurringTasks: true,
    googleCalendarSync: true,
    taskTemplates: true,
    advancedFiltering: true,
    taskDependencies: true,
    projectGrouping: true,
    taskSharing: true,
    multiDeviceSync: true,
    advancedNotifications: true,
    bulkOperations: true,
    productivityAnalytics: true,
    cloudBackup: true,
    customThemes: true,
  },
};

// Define allowed categories for free plan
export const FREE_CATEGORIES = ['Work', 'Personal', 'Shopping', 'Health', 'Education', 'Travel', 'Finance', 'Fitness', 'Social', 'Other'];