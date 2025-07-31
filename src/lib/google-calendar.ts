// Google Calendar API integration
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
}

export interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  backgroundColor?: string;
}

export class GoogleCalendarAPI {
  constructor(private accessToken: string) {}

  async getCalendarList(): Promise<GoogleCalendar[]> {
    const response = await fetch('/api/calendar/list', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendar list');
    }

    const data = await response.json();
    return data.items || [];
  }

  async getEvents(calendarId: string, timeMin: string, timeMax: string): Promise<GoogleEvent[]> {
    const params = new URLSearchParams({
      calendarId,
      timeMin,
      timeMax,
      maxResults: '250'
    });

    const response = await fetch(`/api/calendar/events?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    return data.items || [];
  }
}

export function convertGoogleEventToCalendarEvent(
  googleEvent: GoogleEvent, 
  calendarId: string, 
  color: string
): import('@/types').CalendarEvent {
  return {
    id: googleEvent.id,
    title: googleEvent.summary || 'Untitled Event',
    description: googleEvent.description,
    startTime: googleEvent.start.dateTime || googleEvent.start.date,
    endTime: googleEvent.end.dateTime || googleEvent.end.date,
    allDay: !googleEvent.start.dateTime,
    location: googleEvent.location,
    calendarId,
    color,
  };
}

export async function exchangeCodeForTokens(code: string) {
  const response = await fetch('/api/oauth/google/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to exchange code for tokens');
  }

  return response.json();
}

export function getAccessTokenFromCredential(credential: any): string {
  // This function would extract access token from credential
  // Implementation depends on your credential format
  return credential.access_token;
}