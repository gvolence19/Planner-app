import { useState } from "react"
import { Settings, Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)

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
            {/* Theme Settings */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred theme
                </p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            {/* Notifications */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive task reminders
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {/* Auto Save */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="autosave">Auto Save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes
                </p>
              </div>
              <Switch
                id="autosave"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="sound">Sound Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Play sounds for actions
                </p>
              </div>
              <Switch
                id="sound"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div className="space-y-0.5">
                <Label htmlFor="compact">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use smaller interface elements
                </p>
              </div>
              <Switch
                id="compact"
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>

            {/* Data Management */}
            <div className="p-3 border rounded-md bg-muted/50">
              <Label className="text-base font-semibold">Data Management</Label>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={() => {
                  if (confirm('Export all your tasks and settings?')) {
                    const data = {
                      tasks: JSON.parse(localStorage.getItem('planner-tasks') || '[]'),
                      categories: JSON.parse(localStorage.getItem('planner-categories') || '[]'),
                      settings: {
                        theme,
                        notificationsEnabled,
                        autoSave,
                        soundEnabled,
                        compactMode
                      },
                      exportDate: new Date().toISOString()
                    };
                    
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `planner-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }
                }}>
                  Export Data
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  if (confirm('This will clear all your data. Are you sure?')) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}>
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}