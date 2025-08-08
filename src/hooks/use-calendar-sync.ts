// src/hooks/use-calendar-sync.ts - Updated to work with your existing google-calendar.ts
import { useState, useEffect, useCallback } from 'react';
import { CalendarAccount, CalendarEvent } from '@/types';
import { 
  GoogleCalendarAPI, 
  convertGoogleEventToCalendarEvent,
  exchangeCodeForTokens,
  getAccessTokenFromCredential 
} from '@/lib/google-calendar';

interface CalendarSyncError {
  accountId: string;
  message: string;
  type: 'auth' | 'network' | 'quota' | 'unknown';
  timestamp: Date;
}

export function useCalendarSync() {
  const [calendarAccounts, setCalendarAccounts] = useState<CalendarAccount[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncErrors, setSyncErrors] = useState<CalendarSyncError[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  // Save data to localStorage whenever accounts or events change
  useEffect(() => {
    if (calendarAccounts.length > 0) {
      localStorage.setItem('calendar-accounts', JSON.stringify(calendarAccounts));
    }
  }, [calendarAccounts]);

  useEffect(() => {
    if (calendarEvents.length > 0) {
      // Store events with serialized dates
      const eventsToStore = calendarEvents.map(event => ({
        ...event,
        startTime: event.startTime?.toISOString(),
        endTime: event.endTime?.toISOString(),
      }));
      localStorage.setItem('calendar-events', JSON.stringify(eventsToStore));
    }
  }, [calendarEvents]);

  // Auto-sync every 15 minutes for visible accounts
  useEffect(() => {
    const visibleAccounts = calendarAccounts.filter(account => account.visible);
    if (visibleAccounts.length === 0) return;

    const autoSyncInterval = setInterval(() => {
      console.log('Auto-syncing calendars...');
      syncAllCalendars();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(autoSyncInterval);
  }, [calendarAccounts]);

  const loadSavedData = () => {
    try {
      // Load accounts
      const savedAccounts = localStorage.getItem('calendar-accounts');
      if (savedAccounts) {
        const accounts = JSON.parse(savedAccounts);
        setCalendarAccounts(accounts);
      }

      // Load events
      const savedEvents = localStorage.getItem('calendar-events');
      if (savedEvents) {
        const events = JSON.parse(savedEvents).map((event: any) => ({
          ...event,
          startTime: event.startTime ? new Date(event.startTime) : undefined,
          endTime: event.endTime ? new Date(event.endTime) : undefined,
        }));
        setCalendarEvents(events);
      }

      // Load last sync time
      const savedSyncTime = localStorage.getItem('last-sync-time');
      if (savedSyncTime) {
        setLastSyncTime(new Date(savedSyncTime));
      }
    } catch (error) {
      console.error('Error loading saved calendar data:', error);
    }
  };

  const addCalendarAccount = async (account: CalendarAccount) => {
    setCalendarAccounts(prev => {
      // Prevent duplicate accounts
      const exists = prev.find(acc => acc.email === account.email);
      if (exists) {
        console.warn('Calendar account already exists:', account.email);
        return prev;
      }
      return [...prev, account];
    });
    
    // Try to sync events immediately
    try {
      await syncCalendar(account.id);
    } catch (error) {
      console.error('Error syncing new calendar account:', error);
      addSyncError(account.id, 'Failed to sync calendar after adding', 'unknown');
    }
  };

  const removeCalendarAccount = (accountId: string) => {
    setCalendarAccounts(prev => prev.filter(account => account.id !== accountId));
    setCalendarEvents(prev => prev.filter(event => event.calendarId !== accountId));
    setSyncErrors(prev => prev.filter(error => error.accountId !== accountId));
  };

  const toggleCalendarVisibility = (accountId: string, visible: boolean) => {
    setCalendarAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, visible }
          : account
      )
    );

    if (!visible) {
      // Hide events from this calendar
      setCalendarEvents(prev => prev.filter(event => event.calendarId !== accountId));
    } else {
      // Re-sync events for this calendar
      syncCalendar(accountId);
    }
  };

  const addSyncError = (accountId: string, message: string, type: CalendarSyncError['type']) => {
    setSyncErrors(prev => [
      ...prev.filter(error => error.accountId !== accountId),
      { accountId, message, type, timestamp: new Date() }
    ]);
  };

  const clearSyncError = (accountId: string) => {
    setSyncErrors(prev => prev.filter(error => error.accountId !== accountId));
  };

  const clearAllSyncErrors = () => {
    setSyncErrors([]);
  };

  const syncCalendar = async (accountId: string): Promise<void> => {
    const account = calendarAccounts.find(acc => acc.id === accountId);
    if (!account || !account.visible) {
      return;
    }

    console.log(`Syncing calendar: ${account.email}`);
    clearSyncError(accountId);
    
    try {
      if (account.provider === 'google') {
        await syncGoogleCalendar(account);
      }
      // Add support for other providers here (Outlook, Apple, etc.)
      
      // Update last synced time
      const now = new Date();
      setCalendarAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId
            ? { ...acc, lastSynced: now }
            : acc
        )
      );

      setLastSyncTime(now);
      localStorage.setItem('last-sync-time', now.toISOString());
      
      console.log(`Successfully synced calendar: ${account.email}`);
    } catch (error) {
      console.error(`Error syncing calendar ${account.email}:`, error);
      
      // Categorize the error
      let errorType: CalendarSyncError['type'] = 'unknown';
      let errorMessage = 'Failed to sync calendar';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorType = 'auth';
          errorMessage = 'Authentication expired. Please reconnect your calendar.';
        } else if (error.message.includes('403') || error.message.includes('quota')) {
          errorType = 'quota';
          errorMessage = 'API quota exceeded. Please try again later.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorType = 'network';
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      
      addSyncError(accountId, errorMessage, errorType);
      throw error;
    }
  };

  const syncAllCalendars = async (): Promise<void> => {
    const visibleAccounts = calendarAccounts.filter(account => account.visible);
    
    if (visibleAccounts.length === 0) {
      console.log('No visible calendars to sync');
      return;
    }

    setLoading(true);
    console.log(`Syncing ${visibleAccounts.length} calendars...`);
    
    const syncPromises = visibleAccounts.map(account => 
      syncCalendar(account.id).catch(error => {
        console.error(`Failed to sync calendar ${account.email}:`, error);
        // Error is already handled in syncCalendar
      })
    );

    await Promise.allSettled(syncPromises);
    setLoading(false);
    console.log('Finished syncing all calendars');
  };

  const syncGoogleCalendar = async (account: CalendarAccount) => {
    try {
      const accessToken = getAccessTokenFromCredential(account);
      
      if (!accessToken) {
        throw new Error('No access token available for this account');
      }

      const api = new GoogleCalendarAPI(accessToken);
      
      // Get calendar list
      const calendars = await api.getCalendarList();
      
      if (calendars.length === 0) {
        throw new Error('No accessible calendars found');
      }

      console.log(`Found ${calendars.length} calendars for ${account.email}`);

      // Get events for the next 3 months and past 1 month
      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 1 month ago
      const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 3 months ahead
      
      const allEvents: CalendarEvent[] = [];
      
      // Fetch events from primary calendar and other accessible calendars
      for (const calendar of calendars) {
        try {
          console.log(`Fetching events from calendar: ${calendar.summary}`);
          const googleEvents = await api.getEvents(calendar.id, timeMin, timeMax);
          
          // Convert Google events to our format
          const events = googleEvents.map(googleEvent =>
            convertGoogleEventToCalendarEvent(
              googleEvent, 
              account.id, 
              calendar.backgroundColor || account.color || '#3b82f6'
            )
          );
          
          allEvents.push(...events);
          console.log(`Fetched ${events.length} events from ${calendar.summary}`);
        } catch (calendarError) {
          console.warn(`Failed to sync calendar ${calendar.summary}:`, calendarError);
          // Continue with other calendars
        }
      }

      console.log(`Total events fetched: ${allEvents.length}`);

      // Update calendar events, replacing events from this account
      setCalendarEvents(prev => [
        ...prev.filter(event => event.calendarId !== account.id),
        ...allEvents
      ]);

    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      throw error;
    }
  };

  // Force refresh all calendars
  const forceRefresh = useCallback(async () => {
    console.log('Force refreshing all calendars...');
    clearAllSyncErrors();
    await syncAllCalendars();
  }, [calendarAccounts]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => {
      if (!event.startTime) return false;
      
      const eventStart = new Date(event.startTime);
      const targetDate = new Date(date);
      
      // For all-day events
      if (event.allDay) {
        return eventStart.toDateString() === targetDate.toDateString();
      }
      
      // For timed events
      return eventStart.toDateString() === targetDate.toDateString();
    });
  }, [calendarEvents]);

  // Get account by ID
  const getAccountById = useCallback((accountId: string): CalendarAccount | undefined => {
    return calendarAccounts.find(account => account.id === accountId);
  }, [calendarAccounts]);

  return {
    // State
    calendarAccounts,
    calendarEvents,
    loading,
    syncErrors,
    lastSyncTime,
    
    // Actions
    addCalendarAccount,
    removeCalendarAccount,
    toggleCalendarVisibility,
    syncCalendar,
    syncAllCalendars,
    forceRefresh,
    clearSyncError,
    clearAllSyncErrors,
    
    // Computed values
    getEventsForDate,
    getAccountById,
    
    // Derived state
    hasErrors: syncErrors.length > 0,
    visibleAccountsCount: calendarAccounts.filter(acc => acc.visible).length,
    totalEventsCount: calendarEvents.length,
  };
}