// types/index.ts - Updated for Google Calendar Integration + Advanced AI Tasks

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  recurring?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurringParentId?: string;
  location?: string | Location;
  
  // AI-related fields for enhanced task suggestions
  isAISuggested?: boolean;  // Indicates if this task was created from an AI suggestion
  aiCategory?: string;      // The AI-determined category for this task
  
  // Additional fields for better task management
  startTime?: string;       // Start time for tasks (e.g., "09:30")
  duration?: string;        // Duration in minutes as string (e.g., "60")
}

export interface Location {
  description: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  allDay?: boolean;
  calendarId: string;
  color?: string;
  source?: 'google' | 'outlook' | 'apple' | 'local';
  externalId?: string;
  htmlLink?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  recurring?: boolean;
  recurrence?: string[];
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  // Legacy support
  sourceId?: string; // Keep for backward compatibility
}

export interface CalendarAccount {
  id: string;
  name: string;
  email: string;
  provider: 'google' | 'outlook' | 'apple' | 'other';
  token: string;
  refreshToken?: string;
  expiresAt?: number;
  visible: boolean;
  lastSynced: Date;
  color: string;
  calendars?: GoogleCalendar[]; // List of calendars from this account
  syncEnabled?: boolean;
  syncFrequency?: 'realtime' | '5min' | '15min' | '30min' | 'hourly';
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole?: 'owner' | 'reader' | 'writer' | 'freeBusyReader';
  backgroundColor?: string;
  foregroundColor?: string;
  colorId?: string;
  selected?: boolean;
  timeZone?: string;
}

export interface CalendarSyncError {
  accountId: string;
  message: string;
  type: 'auth' | 'network' | 'quota' | 'permission' | 'unknown';
  timestamp: Date;
  retryCount?: number;
  lastRetry?: Date;
}

export interface SyncStatus {
  accountId: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSync?: Date;
  nextSync?: Date;
  eventCount?: number;
  error?: CalendarSyncError;
}

export type TaskCategory = {
  name: string;
  color: string;
  icon?: string;
};

export interface CalendarSettings {
  defaultView: 'month' | 'week' | 'day' | 'agenda';
  workingHours: {
    start: string; // "09:00"
    end: string;   // "17:00"
  };
  workingDays: number[]; // [1, 2, 3, 4, 5] for Mon-Fri
  timeZone: string;
  dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  timeFormat: '12h' | '24h';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  showWeekNumbers: boolean;
  defaultEventDuration: number; // in minutes
  notifications: {
    enabled: boolean;
    defaultReminders: number[]; // minutes before event [10, 60]
  };
}

export interface NotificationPreference {
  type: 'email' | 'popup' | 'push';
  timing: number; // minutes before event
  enabled: boolean;
}

// OAuth and Authentication Types
export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale?: string;
}

// AI-related types for task suggestions
export interface AITaskSuggestion {
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  location?: string;
  duration?: string;
  confidence: number;
  reason: string;
  estimatedTime?: string;
}

// Advanced AI task suggestion with auto-fill capabilities
export interface AdvancedAITaskSuggestion {
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  location?: string;
  duration?: string;
  startTime?: string;
  confidence: number;
  reason: string;
  estimatedTime?: string;
  suggestedDate?: Date;
  autoFillData?: {
    commonDuration?: string;
    typicalLocation?: string;
    recommendedTime?: string;
    preparationTasks?: string[];
    followUpTasks?: string[];
  };
}

// AI task intelligence patterns for categorization
export interface TaskIntelligencePattern {
  triggers: string[];
  title: string;
  duration: string;
  location?: string;
  priority: 'low' | 'medium' | 'high';
  reason: string;
  autoFill?: {
    commonDuration?: string;
    typicalLocation?: string;
    recommendedTime?: string;
    preparationTasks?: string[];
    followUpTasks?: string[];
  };
}

// Enhanced task creation data interface for AI
export interface TaskCreationData {
  title?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  duration?: string;
  startTime?: string;
  dueDate?: Date;
  isAISuggested?: boolean;
  aiCategory?: string;
}

// AI Analysis types for task intelligence
export interface TaskAnalysis {
  extractedFields: {
    category?: string;
    priority?: Priority;
    location?: string;
    duration?: string;
    startTime?: string;
    dueDate?: Date;
  };
  confidence: number;
  suggestions: AdvancedAITaskSuggestion[];
  patterns: string[];
}

// Enhanced natural language processing result
export interface NLPResult {
  title: string;
  category?: string;
  priority?: Priority;
  location?: string;
  duration?: string;
  startTime?: string;
  dueDate?: Date;
  confidence: number;
  extractedEntities: {
    timeExpressions: string[];
    locationMentions: string[];
    priorityKeywords: string[];
    durationMentions: string[];
  };
}

// AI suggestion context for better recommendations
export interface SuggestionContext {
  currentTime: Date;
  dayOfWeek: number;
  existingTasks: Task[];
  userPreferences?: {
    preferredWorkingHours?: { start: string; end: string };
    commonLocations?: string[];
    frequentCategories?: string[];
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Constants and Configuration
export const DEFAULT_CATEGORIES: TaskCategory[] = [
  { name: 'Work', color: 'bg-blue-500', icon: '💼' },
  { name: 'Personal', color: 'bg-green-500', icon: '🏠' },
  { name: 'Shopping', color: 'bg-yellow-500', icon: '🛒' },
  { name: 'Health', color: 'bg-red-500', icon: '🏥' },
  { name: 'Education', color: 'bg-purple-500', icon: '📚' },
  { name: 'Travel', color: 'bg-indigo-500', icon: '✈️' },
  { name: 'Finance', color: 'bg-emerald-500', icon: '💰' },
  { name: 'Fitness', color: 'bg-orange-500', icon: '💪' },
  { name: 'Social', color: 'bg-pink-500', icon: '👥' },
  { name: 'Other', color: 'bg-gray-500', icon: '📝' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-500', icon: '🔵' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500', icon: '🟡' },
  { value: 'high', label: 'High', color: 'bg-red-500', icon: '🔴' },
] as const;

export const RECURRING_OPTIONS = [
  { value: 'none', label: 'None', description: 'No repetition' },
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Every week' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Every month' },
] as const;

export const CALENDAR_PROVIDERS = [
  { value: 'google', label: 'Google Calendar', icon: '📅', color: '#4285F4' },
  { value: 'outlook', label: 'Outlook Calendar', icon: '📧', color: '#0078D4' },
  { value: 'apple', label: 'Apple Calendar', icon: '🍎', color: '#007AFF' },
  { value: 'other', label: 'Other', icon: '📆', color: '#6B7280' },
] as const;

export const SYNC_FREQUENCIES = [
  { value: 'realtime', label: 'Real-time', description: 'Sync immediately' },
  { value: '5min', label: '5 minutes', description: 'Every 5 minutes' },
  { value: '15min', label: '15 minutes', description: 'Every 15 minutes' },
  { value: '30min', label: '30 minutes', description: 'Every 30 minutes' },
  { value: 'hourly', label: 'Hourly', description: 'Every hour' },
] as const;

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  defaultView: 'month',
  workingHours: {
    start: '09:00',
    end: '17:00',
  },
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  weekStartsOn: 0, // Sunday
  showWeekNumbers: false,
  defaultEventDuration: 60, // 1 hour
  notifications: {
    enabled: true,
    defaultReminders: [10, 60], // 10 minutes and 1 hour before
  },
};

// Color palettes for calendars and categories
export const CALENDAR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#14B8A6', // Teal
  '#A855F7', // Purple
] as const;

// AI Configuration Constants
export const AI_TASK_DOMAINS = [
  'medical',
  'sports',
  'business', 
  'travel',
  'personal',
  'education'
] as const;

export const AI_CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4
} as const;

// Type Aliases
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';
export type AttendeeResponseStatus = 'needsAction' | 'declined' | 'tentative' | 'accepted';
export type CalendarProvider = 'google' | 'outlook' | 'apple' | 'other';
export type SyncFrequency = 'realtime' | '5min' | '15min' | '30min' | 'hourly';
export type Priority = 'low' | 'medium' | 'high';
export type RecurringOption = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type AITaskDomain = typeof AI_TASK_DOMAINS[number];

export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR' 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'QUOTA_EXCEEDED'
  | 'UNKNOWN_ERROR';

// Utility Types
export type CalendarEventWithoutId = Omit<CalendarEvent, 'id'>;
export type TaskWithoutId = Omit<Task, 'id' | 'createdAt'>;
export type PartialCalendarEvent = Partial<CalendarEvent> & Pick<CalendarEvent, 'id' | 'title'>;