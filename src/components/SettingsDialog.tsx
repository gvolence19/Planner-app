import { useState } from "react"
import { Settings, Monitor, Moon, Sun, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SubscriptionDialog } from "@/components/SubscriptionDialog"
import { useSubscription } from "@/contexts/SubscriptionContext"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "./ThemeProvider"

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function SettingsDialog({ 
  open, 
  onOpenChange 
}: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const { isPremium, plan } = useSubscription()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
          <DialogDescription>
            Customize your planning experience
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            {/* Subscription Section */}
            <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label>Subscription</Label>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isPremium ? 'bg-primary/20 text-primary' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                    {isPremium ? 'Premium' : 'Free'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isPremium ? 'You have access to all premium features' : 'Upgrade to get access to premium features'}
                </div>
              </div>
              <Button
                size="sm"
                variant={isPremium ? "outline" : "default"}
                onClick={() => setIsSubscriptionDialogOpen(true)}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {isPremium ? 'Manage' : 'Upgrade'}
              </Button>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive reminders for upcoming tasks
                </div>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact">Compact Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Use less space in lists and calendar views
                </div>
              </div>
              <Switch
                id="compact"
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      <SubscriptionDialog 
        open={isSubscriptionDialogOpen}
        onOpenChange={setIsSubscriptionDialogOpen}
      />
    </Dialog>
  )
}