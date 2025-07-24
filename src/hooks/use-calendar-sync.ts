import { useState, useEffect } from 'react';
import { CalendarAccount, CalendarEvent } from '@/types';
import { useLocalStorage } from './use-local-storage';

interface UseCalendarSyncOptions {
  daysToSync?: number;
}

export function useCalendarSync(options: UseCalendarSyncOptions = {}) {
  const { daysToSync = 90 } = options;
  const [calendarAccounts, setCalendarAccounts] = useLocalStorage<CalendarAccount[]>('planner-calendar-accounts', []);
  const [calendarEvents, setCalendarEvents] = useLocalStorage<CalendarEvent[]>('planner-calendar-events', []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add a new calendar account
  const addCalendarAccount = (account: CalendarAccount) => {
    setCalendarAccounts([...calendarAccounts, account]);
    // Sync the calendar immediately after adding
    syncCalendar(account.id).catch(console.error);
  };

  // Remove a calendar account and its events
  const removeCalendarAccount = (accountId: string) => {
    setCalendarAccounts(calendarAccounts.filter(account => account.id !== accountId));
    setCalendarEvents(calendarEvents.filter(event => event.calendarId !== accountId));
  };

  // Toggle calendar visibility
  const toggleCalendarVisibility = (accountId: string, visible: boolean) => {
    setCalendarAccounts(calendarAccounts.map(account => 
      account.id === accountId ? { ...account, visible } : account
    ));
  };

  // Fetch events for a specific calendar
  const syncCalendar = async (accountId: string) => {
    const account = calendarAccounts.find(acc => acc.id === accountId);
    if (!account) return;

    setLoading(true);
    setError(null);
    
    try {
      // In a real application, we would make API calls to fetch the calendar events
      // For this demo, we'll generate mock data
      const mockEvents = generateMockEvents(account, daysToSync);
      
      // Remove existing events for this calendar
      const otherEvents = calendarEvents.filter(event => event.calendarId !== accountId);
      
      // Add new events
      setCalendarEvents([...otherEvents, ...mockEvents]);
      
      // Update last synced timestamp
      setCalendarAccounts(calendarAccounts.map(acc => 
        acc.id === accountId ? { ...acc, lastSynced: new Date() } : acc
      ));
      
      return mockEvents;
    } catch (err) {
      console.error("Error syncing calendar:", err);
      setError("Failed to sync calendar events");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate mock events for testing
  const generateMockEvents = (account: CalendarAccount, days: number): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const today = new Date();
    
    // Generate random events over the specified number of days
    for (let i = -7; i < days; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Skip weekends for work emails
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      if (account.email.includes('work') && isWeekend) continue;
      
      // Randomly decide if we create an event for this day (30% chance)
      if (Math.random() < 0.3) {
        const startTime = new Date(date);
        startTime.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 4) * 15, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + 1 + Math.floor(Math.random() * 2));
        
        const titles = [
          'Meeting with team',
          'Doctor appointment',
          'Coffee with client',
          'Project review',
          'Lunch with colleagues',
          'Gym session',
          'Conference call',
          'Dentist appointment',
          'Family dinner',
          'Movie night'
        ];
        
        const locations = [
          'Main Office',
          'Coffee Shop',
          'Virtual Meeting',
          'Downtown',
          'Conference Room A',
          'Home',
          'Medical Center'
        ];
        
        events.push({
          id: crypto.randomUUID(),
          title: titles[Math.floor(Math.random() * titles.length)],
          description: 'Auto-imported from ' + account.provider,
          startTime,
          endTime,
          location: Math.random() > 0.5 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
          allDay: Math.random() > 0.8, // 20% chance to be an all-day event
          calendarId: account.id,
          color: account.color,
          sourceId: `${account.provider}-${crypto.randomUUID()}`,
        });
      }
    }
    
    return events;
  };

  // Get visible calendar events
  const getVisibleCalendarEvents = () => {
    // Get the IDs of visible calendars
    const visibleCalendarIds = calendarAccounts
      .filter(account => account.visible)
      .map(account => account.id);
    
    // Filter the events to only include those from visible calendars
    return calendarEvents.filter(event => visibleCalendarIds.includes(event.calendarId));
  };

  return {
    calendarAccounts,
    calendarEvents: getVisibleCalendarEvents(),
    loading,
    error,
    addCalendarAccount,
    removeCalendarAccount,
    toggleCalendarVisibility,
    syncCalendar
  };
}