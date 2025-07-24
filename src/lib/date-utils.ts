import { format, parse, isValid } from 'date-fns';

// Format a date in a human-friendly way
export function formatDate(date?: Date | null): string {
  if (!date || !isValid(date)) return 'No date';
  return format(new Date(date), 'MMM d, yyyy');
}

// Format time in a human-friendly way
export function formatTime(date?: Date | null): string {
  if (!date || !isValid(date)) return '';
  return format(new Date(date), 'h:mm a');
}

// Format date for calendar display
export function formatCalendarDate(date?: Date | null): string {
  if (!date || !isValid(date)) return '';
  return format(new Date(date), 'd');
}

// Format month and year for calendar header
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy');
}

// Parse a string date into a Date object
export function parseDate(dateString: string, formatString: string = 'yyyy-MM-dd'): Date | null {
  try {
    if (!dateString) return null;
    const parsed = parse(dateString, formatString, new Date());
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
}