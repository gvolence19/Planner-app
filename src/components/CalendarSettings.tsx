// src/components/CalendarSettings.tsx - Updated with Environment Variables
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
import { CalendarX, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
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

// Google OAuth2 configuration from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const OAUTH_REDIRECT_PATH = import.meta.env.VITE_OAUTH_REDIRECT_PATH || '/oauth/callback';
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

  // Check if Google Calendar is properly configured
  const isGoogleConfigured = !!GOOGLE_CLIENT_ID;

  const handleGoogleConnect = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Google Calendar integration is not properly configured. Please contact support."
      });
      return;
    }

    setConnecting(true);
    
    // Use Google's OAuth2 flow with proper Calendar API scopes
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', window.location.origin + OAUTH_REDIRECT_PATH);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', CALENDAR_SCOPES);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', 'google-calendar');

    console.log('Opening OAuth popup with URL:', authUrl.toString());

    // Open OAuth popup
    const popup = window.open(
      authUrl.toString(),
      'google-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      setConnecting(false);
      toast({
        variant: "destructive",
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again."
      });
      return;
    }

    // Listen for OAuth completion
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      console.log('Received OAuth message:', event.data);
      
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
        
        // Only show cancellation message if we haven't already processed success/error
        setTimeout(() => {
          if (connecting) {
            toast({
              title: "Authentication Cancelled",
              description: "Google Calendar connection was cancelled."
            });
          }
        }, 500);
      }
    }, 1000);
  };

  const handleOAuthSuccess = async (code: string, email: string) => {
    console.log('Processing OAuth success for:', email);
    
    try {
      // Exchange the authorization code for tokens using our backend
      const tokens = await exchangeCodeForTokens(code);
      
      console.log('Tokens received:', { ...tokens, access_token: 'hidden' });
      
      // Check if calendar already exists
      const existingCalendar = connectedCalendars.find(cal => cal.email === tokens.email);
      if (existingCalendar) {
        toast({
          title: "Calendar Already Connected",
          description: `${tokens.email} is already connected to your account.`
        });
        setConnecting(false);
        return;
      }

      // Create a new calendar account with the access token
      const newCalendar: CalendarAccount = {
        id: crypto.randomUUID(),
        name: tokens.name || tokens.email,
        email: tokens.email,
        provider: 'google',
        token: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined,
        visible: true,
        lastSynced: new Date(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        syncEnabled: true,
        syncFrequency: '15min'
      };
      
      onAddCalendar(newCalendar);
      
      toast({
        title: "Calendar Connected Successfully",
        description: `${tokens.email} has been linked to your account.`,
        action: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      console.error("Error connecting calendar:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect to Google Calendar. Please try again."
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
      description: `Google authentication failed: ${error}`
    });
    setConnecting(false);
  };

  const handleSync = async (id: string) => {
    const calendar = connectedCalendars.find(cal => cal.id === id);
    
    try {
      setSyncing(id);
      await onSyncCalendar(id);
      toast({
        title: "Calendar Synced",
        description: `${calendar?.email || 'Calendar'} events have been updated successfully.`
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Could not sync calendar events. Please try again."
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleRemoveCalendar = (id: string) => {
    const calendar = connectedCalendars.find(cal => cal.id === id);
    onRemoveCalendar(id);
    
    toast({
      title: "Calendar Disconnected",
      description: `${calendar?.email || 'Calendar'} has been removed from your account.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
          <DialogDescription>
            Connect external calendars to view all your events in one place.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Configuration Status */}
          {!isGoogleConfigured ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuration Required:</strong> Google Calendar integration is not configured. 
                Please set up your Google OAuth credentials in the environment variables.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ready to Connect:</strong> Google Calendar integration is properly configured.
                You can now connect your Google Calendar account.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Add a Calendar</h3>
            <Button 
              onClick={handleGoogleConnect}
              disabled={connecting || !isGoogleConfigured}
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
              {isGoogleConfigured 
                ? "Connect your Google Calendar to see those events in your planner"
                : "Google Calendar integration requires proper configuration"
              }
            </p>
          </div>
          
          {connectedCalendars.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                Connected Calendars ({connectedCalendars.length})
              </h3>
              <div className="space-y-2">
                {connectedCalendars.map((calendar) => (
                  <div key={calendar.id} className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: calendar.color }}
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{calendar.email}</span>
                        <p className="text-xs text-muted-foreground">
                          {calendar.provider === 'google' && '📅'} Google Calendar
                          {calendar.lastSynced && (
                            <> • Last synced: {new Date(calendar.lastSynced).toLocaleString()}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={calendar.visible}
                        onCheckedChange={(checked) => 
                          onToggleCalendarVisibility(calendar.id, checked)
                        }
                        aria-label={`Toggle ${calendar.email} visibility`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleSync(calendar.id)}
                        disabled={syncing === calendar.id}
                        title="Sync calendar"
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
                        onClick={() => handleRemoveCalendar(calendar.id)}
                        disabled={syncing === calendar.id}
                        title="Remove calendar"
                      >
                        <CalendarX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debug Information (only in development) */}
          {import.meta.env.VITE_DEBUG_MODE === 'true' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Debug Info:</strong><br />
                Environment: {import.meta.env.VITE_ENVIRONMENT}<br />
                Client ID: {GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}<br />
                Redirect: {window.location.origin + OAUTH_REDIRECT_PATH}
              </AlertDescription>
            </Alert>
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