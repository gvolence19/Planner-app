export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  sharedWith?: string[];
  isArchived: boolean;
}

export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  estimatedDuration?: number; // in minutes
  isRecurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notificationSettings?: {
    enabled: boolean;
    type: 'push' | 'email' | 'sms';
    smartTiming: boolean;
    reminderTime?: number;
  };
  createdAt: Date;
}

export interface TaskFilter {
  categories?: string[];
  priorities?: ('low' | 'medium' | 'high')[];
  projects?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  completed?: boolean;
  overdue?: boolean;
  hasLocation?: boolean;
  sharedWith?: string[];
}