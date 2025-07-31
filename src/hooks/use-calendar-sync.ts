// src/hooks/use-calendar-sync.ts
import { useState, useEffect } from 'react';
import { CalendarAccount, CalendarEvent } from '@/types';
import { GoogleCalendarAPI, convertGoogleEventToCalendarEvent, getAccessTokenFromCredential } from '@/lib/google-calendar';

export function useCalendarSync() {
  const [calendarAccounts, setCalendarAccounts] = useState<CalendarAccount[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Load calendar accounts from localStorage on mount
  useEffect(() => {
    const savedAccounts = localStorage.getItem('calendar-accounts');
    if (savedAccounts) {
      try {
        const accounts = JSON.parse(savedAccounts);
        setCalendarAccounts(accounts);
        // Auto-sync events for visible accounts
        accounts.filter((account: CalendarAccount) => account.visible).forEach((account: CalendarAccount) => {
          syncCalendar(account.id);
        });
      } catch (error) {
        console.error('Error loading calendar accounts:', error);
      }
    }
  }, []);

  // Save calendar accounts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendar-accounts', JSON.stringify(calendarAccounts));
  }, [calendarAccounts]);

  const addCalendarAccount = async (account: CalendarAccount) => {
    setCalendarAccounts(prev => [...prev, account]);
    
    // Try to sync events immediately
    try {
      await syncCalendar(account.id);
    } catch (error) {
      console.error('Error syncing new calendar account:', error);
    }
  };

  const removeCalendarAccount = (accountId: string) => {
    setCalendarAccounts(prev => prev.filter(account => account.id !== accountId));
    // Remove events from this calendar
    setCalendarEvents(prev => prev.filter(event => event.calendarId !== accountId));
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

  const syncCalendar = async (accountId: string): Promise<void> => {
    const account = calendarAccounts.find(acc => acc.id === accountId);
    if (!account || !account.visible) {
      return;
    }

    setLoading(true);
    
    try {
      if (account.provider === 'google') {
        await syncGoogleCalendar(account);
      }
      // Add support for other providers here (Outlook, Apple, etc.)
      
      // Update last synced time
      setCalendarAccounts(prev =>
        prev.map(acc =>
          acc.id === accountId
            ? { ...acc, lastSynced: new Date() }
            : acc
        )
      );
    } catch (error) {
      console.error('Error syncing calendar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncGoogleCalendar = async (account: CalendarAccount) => {
    try {
      // Use the stored access token
      const accessToken = account.token;
      
      if (!accessToken) {
        throw new Error('No access token available for this account');
      }

      const api = new GoogleCalendarAPI(accessToken);
      
      // Get calendar list
      const calendars = await api.getCalendarList();
      
      // For now, just sync the primary calendar
      const primaryCalendar = calendars.find(cal => cal.id === 'primary') || calendars[0];
      
      if (!primaryCalendar) {
        throw new Error('No calendars found');
      }

      // Get events for the next 3 months
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      
      const googleEvents = await api.getEvents(primaryCalendar.id, timeMin, timeMax);
      
      // Convert Google events to our format
      const events = googleEvents.map(googleEvent =>
        convertGoogleEventToCalendarEvent(googleEvent, account.id, account.color)
      );

      // Update calendar events, replacing events from this calendar
      setCalendarEvents(prev => [
        ...prev.filter(event => event.calendarId !== account.id),
        ...events
      ]);

    } catch (error) {
      console.error('Error syncing Google Calendar:', error);
      throw error;
    }
  };

  return {
    calendarAccounts,
    calendarEvents,
    loading,
    addCalendarAccount,
    removeCalendarAccount,
    toggleCalendarVisibility,
    syncCalendar,
  };
}