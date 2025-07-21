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
}

export type TaskCategory = {
  name: string;
  color: string;
};

// Default categories
export const DEFAULT_CATEGORIES: TaskCategory[] = [
  { name: 'Work', color: 'bg-blue-500' },
  { name: 'Personal', color: 'bg-green-500' },
  { name: 'Shopping', color: 'bg-yellow-500' },
  { name: 'Health', color: 'bg-red-500' },
  { name: 'Education', color: 'bg-purple-500' },
  { name: 'Other', color: 'bg-gray-500' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

export const RECURRING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
];