// src/components/CalendarSettings.tsx - FIXED VERSION
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { CalendarX, RefreshCw, AlertCircle } from 'lucide-react';
import { CalendarAccount } from '@/types';
import { exchangeCodeForTokens } from '@/lib/google-calendar';

interface CalendarSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectedCalendars: CalendarAccount[];
  onAddCalendar: (calendar: CalendarAccount) => void;
  onRemoveCalendar: (id: string) => void;
  onToggleCalendarVisibility: (id: string, visible: boolean) => void;
  onSyncCalendar: (id: string) => Promise<void>;
}

// Google OAuth2 configuration for Calendar API access
const GOOGLE_CLIENT_ID = "246690586453-lhel5i1bk1gmn503u6to8rsl8r3d3hrb.apps.googleusercontent.com";
const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'openid',
  'email',
  'profile'
].join(' ');

export default function CalendarSettings({
  open,
  onOpenChange,
  connectedCalendars,
  onAddCalendar,
  onRemoveCalendar,
  onToggleCalendarVisibility,
  onSyncCalendar
}: CalendarSettingsProps) {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleGoogleConnect = () => {
    setConnecting(true);
    
    // Use Google's OAuth2 flow with proper Calendar API scopes
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', window.location.origin + '/oauth/callback');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', CALENDAR_SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', 'google-calendar');

    // Open OAuth popup
    const popup = window.open(
      authUrl.toString(),
      'google-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    // Listen for OAuth completion
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'OAUTH_SUCCESS' && event.data.provider === 'google') {
        const { code, email } = event.data;
        handleOAuthSuccess(code, email);
        popup?.close();
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'OAUTH_ERROR') {
        handleOAuthError(event.data.error);
        popup?.close();
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // Handle popup being closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setConnecting(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  const handleOAuthSuccess = async (code: string, email: string) => {
    try {
      // Exchange the authorization code for tokens using our backend
      const tokens = await exchangeCodeForTokens(code);
      
      // Create a new calendar account with the access token
      const newCalendar: CalendarAccount = {
        id: crypto.randomUUID(),
        name: tokens.name || tokens.email,
        email: tokens.email,
        provider: 'google',
        token: tokens.access_token, // Store the access token
        visible: true,
        lastSynced: new Date(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      };
      
      onAddCalendar(newCalendar);
      
      toast({
        title: "Calendar Connected",
        description: `Successfully linked ${tokens.email}`
      });
    } catch (error) {
      console.error("Error connecting calendar:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to Google Calendar"
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleOAuthError = (error: string) => {
    console.error("OAuth error:", error);
    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description: "Could not authenticate with Google"
    });
    setConnecting(false);
  };

  const handleSync = async (id: string) => {
    try {
      setSyncing(id);
      await onSyncCalendar(id);
      toast({
        title: "Calendar Synced",
        description: "Your calendar events have been updated"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Could not sync calendar events"
      });
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
          <DialogDescription>
            Link external calendars to view all your events in one place.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Demo Notice:</strong> This Google Calendar integration is partially implemented. 
              For full functionality, you need to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Set up proper OAuth2 flow with backend token exchange</li>
                <li>Handle token refresh</li>
                <li>Implement secure token storage</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Add a Calendar</h3>
            <Button 
              onClick={handleGoogleConnect}
              disabled={connecting}
              className="w-full"
              variant="outline"
            >
              {connecting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connect Google Calendar
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Connect your Google Calendar to see those events in your planner
            </p>
          </div>
          
          {connectedCalendars.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Connected Calendars</h3>
              <div className="space-y-2">
                {connectedCalendars.map((calendar) => (
                  <div key={calendar.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: calendar.color }}
                      />
                      <div>
                        <span className="text-sm font-medium">{calendar.email}</span>
                        <p className="text-xs text-muted-foreground">
                          Last synced: {new Date(calendar.lastSynced).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={calendar.visible}
                        onCheckedChange={(checked) => 
                          onToggleCalendarVisibility(calendar.id, checked)
                        }
                        aria-label="Toggle calendar visibility"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSync(calendar.id)}
                        disabled={syncing === calendar.id}
                      >
                        {syncing === calendar.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onRemoveCalendar(calendar.id)}
                        disabled={syncing === calendar.id}
                      >
                        <CalendarX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}