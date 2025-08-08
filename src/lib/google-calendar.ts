// Google Calendar API integration - Updated with Environment Variables
import { CalendarEvent, CalendarAccount } from '@/types';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// Enhanced Google Event interface
export interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  colorId?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  recurrence?: string[];
  created?: string;
  updated?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  colorId?: string;
  accessRole?: 'owner' | 'reader' | 'writer' | 'freeBusyReader';
  timeZone?: string;
  selected?: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  email: string;
  name: string;
  picture?: string;
}

export class GoogleCalendarAPI {
  private accessToken: string;
  private abortController: AbortController;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.abortController = new AbortController();
  }

  // Helper method for making API requests
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    if (DEBUG_MODE) {
      console.log(`Making API request to: ${url}`);
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: this.abortController.signal,
      // Add timeout
      ...this.addTimeout(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      if (DEBUG_MODE) {
        console.error(`API request failed:`, {
          url,
          status: response.status,
          error: errorData
        });
      }

      // Handle specific error types
      if (response.status === 401) {
        throw new Error('Authentication expired. Please reconnect your calendar.');
      } else if (response.status === 403) {
        throw new Error('Permission denied. Please check your calendar access permissions.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (DEBUG_MODE) {
      console.log(`API response from ${endpoint}:`, data);
    }

    return data;
  }

  // Add timeout to fetch requests
  private addTimeout(options: RequestInit): RequestInit {
    return {
      ...options,
      signal: AbortSignal.timeout ? AbortSignal.timeout(API_TIMEOUT) : this.abortController.signal,
    };
  }

  // Get list of user's calendars
  async getCalendarList(): Promise<GoogleCalendar[]> {
    try {
      const data = await this.makeRequest<{ items: GoogleCalendar[] }>('/calendar/list');
      return data.items || [];
    } catch (error) {
      console.error('Failed to fetch calendar list:', error);
      throw new Error(`Failed to fetch calendar list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get events from a specific calendar
  async getEvents(
    calendarId: string, 
    timeMin: string, 
    timeMax: string,
    maxResults: number = 250
  ): Promise<GoogleEvent[]> {
    try {
      const params = new URLSearchParams({
        calendarId,
        timeMin,
        timeMax,
        maxResults: maxResults.toString()
      });

      const data = await this.makeRequest<{ items: GoogleEvent[] }>(`/calendar/events?${params}`);
      return data.items || [];
    } catch (error) {
      console.error(`Failed to fetch events for calendar ${calendarId}:`, error);
      throw new Error(`Failed to fetch calendar events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a new event
  async createEvent(calendarId: string = 'primary', event: Partial<GoogleEvent>): Promise<GoogleEvent> {
    try {
      return await this.makeRequest<GoogleEvent>('/calendar/events', {
        method: 'POST',
        body: JSON.stringify({ calendarId, event }),
      });
    } catch (error) {
      console.error('Failed to create event:', error);
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update an existing event
  async updateEvent(
    calendarId: string = 'primary',
    eventId: string,
    event: Partial<GoogleEvent>
  ): Promise<GoogleEvent> {
    try {
      return await this.makeRequest<GoogleEvent>(`/calendar/events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify({ calendarId, event }),
      });
    } catch (error) {
      console.error('Failed to update event:', error);
      throw new Error(`Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete an event
  async deleteEvent(calendarId: string = 'primary', eventId: string): Promise<void> {
    try {
      await this.makeRequest<void>(`/calendar/events/${eventId}`, {
        method: 'DELETE',
        body: JSON.stringify({ calendarId }),
      });
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cancel all pending requests
  abort(): void {
    this.abortController.abort();
  }
}

// Convert Google Event to our CalendarEvent format
export function convertGoogleEventToCalendarEvent(
  googleEvent: GoogleEvent, 
  calendarId: string, 
  color: string
): CalendarEvent {
  const startTime = googleEvent.start.dateTime || googleEvent.start.date;
  const endTime = googleEvent.end.dateTime || googleEvent.end.date;
  const allDay = !googleEvent.start.dateTime;

  return {
    id: googleEvent.id,
    title: googleEvent.summary || 'Untitled Event',
    description: googleEvent.description,
    location: googleEvent.location,
    startTime: startTime ? new Date(startTime) : undefined,
    endTime: endTime ? new Date(endTime) : undefined,
    allDay,
    color,
    calendarId,
    source: 'google',
    externalId: googleEvent.id,
    htmlLink: googleEvent.htmlLink,
    attendees: googleEvent.attendees,
    recurring: !!googleEvent.recurrence,
    status: googleEvent.status,
    // Backward compatibility
    sourceId: calendarId,
  };
}

// Exchange OAuth code for access tokens
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const url = `${API_BASE_URL}/api/oauth/google/callback`;
  
  if (DEBUG_MODE) {
    console.log('Exchanging OAuth code for tokens...');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(API_TIMEOUT) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.error || error.message || 'Failed to exchange code for tokens';
      
      if (DEBUG_MODE) {
        console.error('Token exchange failed:', error);
      }

      throw new Error(errorMessage);
    }

    const tokens = await response.json();
    
    if (DEBUG_MODE) {
      console.log('Token exchange successful for:', tokens.email);
    }

    return tokens;
  } catch (error) {
    console.error('Error in token exchange:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
    
    throw new Error('Failed to exchange authorization code for tokens');
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const url = `${API_BASE_URL}/api/oauth/google/refresh`;
  
  if (DEBUG_MODE) {
    console.log('Refreshing access token...');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout ? AbortSignal.timeout(API_TIMEOUT) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage = error.error || error.message || 'Failed to refresh access token';
      
      if (DEBUG_MODE) {
        console.error('Token refresh failed:', error);
      }

      throw new Error(errorMessage);
    }

    const tokens = await response.json();
    
    if (DEBUG_MODE) {
      console.log('Token refresh successful');
    }

    return tokens;
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
    
    throw new Error('Failed to refresh access token');
  }
}

// Helper to check if token is expired
export function isTokenExpired(expiresAt: number): boolean {
  // Add 5-minute buffer to prevent edge cases
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= (expiresAt - bufferTime);
}

// Get access token from CalendarAccount credential
export function getAccessTokenFromCredential(credential: CalendarAccount): string {
  if (!credential.token) {
    throw new Error('No access token found in credential');
  }
  return credential.token;
}

// Validate calendar account token
export function validateCalendarAccount(account: CalendarAccount): boolean {
  if (!account.token) {
    return false;
  }
  
  if (account.expiresAt && isTokenExpired(account.expiresAt)) {
    return false;
  }
  
  return true;
}

// Create a Google Calendar API instance with token validation
export function createGoogleCalendarAPI(account: CalendarAccount): GoogleCalendarAPI {
  if (!validateCalendarAccount(account)) {
    throw new Error('Invalid or expired calendar account');
  }
  
  return new GoogleCalendarAPI(account.token);
}

// Utility function to handle API errors gracefully
export function handleCalendarAPIError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred while accessing the calendar';
}

// Export utility functions for debugging
export const debug = {
  getAPIBaseURL: () => API_BASE_URL,
  getTimeout: () => API_TIMEOUT,
  isDebugMode: () => DEBUG_MODE,
  logConfig: () => {
    console.log('Google Calendar API Configuration:', {
      apiBaseUrl: API_BASE_URL,
      timeout: API_TIMEOUT,
      debugMode: DEBUG_MODE,
    });
  }
};