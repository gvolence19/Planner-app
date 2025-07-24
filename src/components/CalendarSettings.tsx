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
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarCheck, CalendarX, RefreshCw } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { CalendarAccount } from '@/types';

interface CalendarSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectedCalendars: CalendarAccount[];
  onAddCalendar: (calendar: CalendarAccount) => void;
  onRemoveCalendar: (id: string) => void;
  onToggleCalendarVisibility: (id: string, visible: boolean) => void;
  onSyncCalendar: (id: string) => Promise<void>;
}

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

  const handleGoogleLoginSuccess = async (credentialResponse: {credential?: string}) => {
    try {
      // For this implementation, we'll just store the token and email
      // In a real app, you would validate the token with your backend
      const { credential } = credentialResponse;
      
      if (!credential) {
        throw new Error("No credential received");
      }
      
      // Parse the JWT to get user info
      // This is a simple parse for demo purposes - in production you should verify the token
      const payload = JSON.parse(atob(credential.split('.')[1]));
      const email = payload.email;
      
      // Create a new calendar account
      const newCalendar: CalendarAccount = {
        id: crypto.randomUUID(),
        name: email,
        email: email,
        provider: 'google',
        token: credential,
        visible: true,
        lastSynced: new Date(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
      };
      
      onAddCalendar(newCalendar);
      
      toast({
        title: "Calendar Connected",
        description: `Successfully linked ${email}`
      });
    } catch (error) {
      console.error("Error connecting calendar:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to Google Calendar"
      });
    }
  };

  const handleGoogleLoginError = () => {
    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description: "Could not authenticate with Google"
    });
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
        description: "Could not sync calendar events"
      });
    } finally {
      setSyncing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Calendar Settings</DialogTitle>
          <DialogDescription>
            Link external calendars to view all your events in one place.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Add a Calendar</h3>
            <GoogleLogin 
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Connect your Google Calendar to see those events in your planner
            </p>
          </div>
          
          {connectedCalendars.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Connected Calendars</h3>
              <div className="space-y-2">
                {connectedCalendars.map((calendar) => (
                  <div key={calendar.id} className="flex items-center justify-between border p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: calendar.color }}
                      />
                      <span className="text-sm">{calendar.email}</span>
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
              <p className="text-xs text-muted-foreground">
                Last synced: {
                  connectedCalendars.length > 0
                    ? new Date(connectedCalendars[0].lastSynced).toLocaleString()
                    : 'Never'
                }
              </p>
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