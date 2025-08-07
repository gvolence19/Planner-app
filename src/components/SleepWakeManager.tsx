// src/components/SleepWakeManager.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Bell, AlarmClock, Trash2, Play, Pause, Plus, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { Task } from '@/types';

interface SleepWakeTimer {
  id: string;
  type: 'sleep' | 'wake';
  time: string; // HH:MM format
  label: string;
  enabled: boolean;
  isAlarm: boolean; // true for alarm, false for reminder
  days: string[]; // ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  createdAt: Date;
  soundType: 'gentle' | 'classic' | 'nature'; // Add sound type
}

interface SleepWakeManagerProps {
  onAddTask?: (task: Task) => void;
}

const DAYS_OF_WEEK = [
  { value: 'sun', label: 'Sun' },
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
];

const ALARM_SOUNDS = [
  { 
    value: 'gentle', 
    label: 'Street Alarm', 
    description: 'Urban emergency alert sound',
    file: '/sounds/street-alarm.wav' 
  },
  { 
    value: 'classic', 
    label: 'Warning Buzzer', 
    description: 'Sharp attention-grabbing buzzer',
    file: '/sounds/warning-buzzer.wav' 
  },
  { 
    value: 'nature', 
    label: 'Vintage Alarm', 
    description: 'Classic old-school alarm clock',
    file: '/sounds/vintage-alarm.wav' 
  },
];

export default function SleepWakeManager({ onAddTask }: SleepWakeManagerProps) {
  const [timers, setTimers] = useState<SleepWakeTimer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<SleepWakeTimer | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'sleep' as 'sleep' | 'wake',
    time: '22:00',
    label: '',
    isAlarm: false,
    days: [] as string[],
    soundType: 'gentle' as 'gentle' | 'classic' | 'nature',
  });

  // Load timers from localStorage
  useEffect(() => {
    const savedTimers = localStorage.getItem('sleep-wake-timers');
    if (savedTimers) {
      try {
        const parsed = JSON.parse(savedTimers).map((timer: any) => ({
          ...timer,
          createdAt: new Date(timer.createdAt),
          soundType: timer.soundType || 'gentle' // Default to gentle for backward compatibility
        }));
        setTimers(parsed);
      } catch (error) {
        console.error('Error loading sleep/wake timers:', error);
      }
    }
  }, []);

  // Save timers to localStorage
  useEffect(() => {
    localStorage.setItem('sleep-wake-timers', JSON.stringify(timers));
  }, [timers]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio]);

  const playAlarmSound = (soundType: string) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const sound = ALARM_SOUNDS.find(s => s.value === soundType);
    if (sound) {
      try {
        const audio = new Audio(sound.file);
        audio.loop = true; // Loop the alarm
        setCurrentAudio(audio);
        
        audio.play().catch(() => {
          console.log('Audio playback failed');
          toast.error('Could not play alarm sound. Please check if sound files are available.');
        });
        
        // Stop after 30 seconds to prevent infinite looping
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          setCurrentAudio(null);
        }, 30000);
      } catch (error) {
        console.error('Error playing alarm sound:', error);
      }
    }
  };

  const playPreviewSound = (soundType: string) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const sound = ALARM_SOUNDS.find(s => s.value === soundType);
    if (sound) {
      try {
        const audio = new Audio(sound.file);
        setCurrentAudio(audio);
        
        audio.play().catch(() => {
          toast.error('Could not play preview. Sound file may not be loaded yet.');
        });
        
        // Stop preview after 3 seconds
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          setCurrentAudio(null);
        }, 3000);
      } catch (error) {
        console.error('Error playing preview sound:', error);
        toast.error('Error playing sound preview.');
      }
    }
  };

  // Check for active timers and trigger notifications
  useEffect(() => {
    const checkTimers = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM
      const currentDay = DAYS_OF_WEEK[now.getDay()].value;

      timers.forEach(timer => {
        if (!timer.enabled) return;
        if (!timer.days.includes(currentDay)) return;
        if (timer.time !== currentTime) return;

        // Timer should trigger
        const message = timer.type === 'sleep' 
          ? `💤 ${timer.label || 'Time to sleep!'}`
          : `☀️ ${timer.label || 'Time to wake up!'}`;

        if (timer.isAlarm) {
          // For actual alarms, integrate with browser notifications and play sound
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(message, {
              icon: timer.type === 'sleep' ? '🌙' : '☀️',
              tag: `timer-${timer.id}`,
            });
          }
          
          // Play the selected alarm sound
          playAlarmSound(timer.soundType);
        }

        // Show toast notification
        toast(message, {
          duration: timer.isAlarm ? 0 : 5000, // Persistent for alarms
          action: timer.isAlarm ? {
            label: 'Dismiss',
            onClick: () => {
              // Stop alarm sound when dismissed
              if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                setCurrentAudio(null);
              }
            },
          } : undefined,
        });

        // Optionally add as a task
        if (onAddTask && timer.type === 'wake') {
          onAddTask({
            id: crypto.randomUUID(),
            title: timer.label || 'Good morning routine',
            description: 'Start your day right!',
            completed: false,
            category: { name: 'Personal', color: 'bg-blue-500' },
            priority: 'medium' as const,
            createdAt: new Date(),
            dueDate: now,
          });
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkTimers, 60000);
    
    // Check immediately
    checkTimers();

    return () => clearInterval(interval);
  }, [timers, onAddTask, currentAudio]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const resetForm = () => {
    setFormData({
      type: 'sleep',
      time: '22:00',
      label: '',
      isAlarm: false,
      days: [],
      soundType: 'gentle',
    });
    setEditingTimer(null);
  };

  const openDialog = (timer?: SleepWakeTimer) => {
    if (timer) {
      setEditingTimer(timer);
      setFormData({
        type: timer.type,
        time: timer.time,
        label: timer.label,
        isAlarm: timer.isAlarm,
        days: [...timer.days],
        soundType: timer.soundType || 'gentle',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
    // Stop any preview sounds when dialog closes
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
  };

  const handleSave = () => {
    if (!formData.time || formData.days.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const timerData = {
      ...formData,
      id: editingTimer?.id || crypto.randomUUID(),
      enabled: true,
      createdAt: editingTimer?.createdAt || new Date(),
      label: formData.label || (formData.type === 'sleep' ? 'Bedtime' : 'Wake up'),
    };

    if (editingTimer) {
      setTimers(prev => prev.map(t => t.id === editingTimer.id ? timerData : t));
      toast.success('Timer updated successfully');
    } else {
      setTimers(prev => [...prev, timerData]);
      toast.success('Timer created successfully');
    }

    closeDialog();
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, enabled: !timer.enabled } : timer
    ));
  };

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
    toast.success('Timer deleted');
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const sleepTimers = timers.filter(t => t.type === 'sleep');
  const wakeTimers = timers.filter(t => t.type === 'wake');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sleep & Wake Timers</h2>
          <p className="text-muted-foreground">Set alarms or reminders for your sleep schedule</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Timer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTimer ? 'Edit Timer' : 'Create New Timer'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Timer Type */}
              <div className="space-y-2">
                <Label>Timer Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'sleep' | 'wake') => setFormData(prev => ({ 
                    ...prev, 
                    type: value,
                    time: value === 'sleep' ? '22:00' : '07:00'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sleep">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Sleep Timer
                      </div>
                    </SelectItem>
                    <SelectItem value="wake">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Wake Timer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="mobile-friendly-input"
                />
              </div>

              {/* Label */}
              <div className="space-y-2">
                <Label htmlFor="label">Label (optional)</Label>
                <Input
                  id="label"
                  placeholder={formData.type === 'sleep' ? 'Bedtime' : 'Wake up'}
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="mobile-friendly-input"
                />
              </div>

              {/* Alarm vs Reminder */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.isAlarm ? 'Alarm with sound' : 'Silent reminder'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    checked={formData.isAlarm}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAlarm: checked }))}
                  />
                  <AlarmClock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Sound Selection - Only show when Alarm is enabled */}
              {formData.isAlarm && (
                <div className="space-y-2">
                  <Label>Alarm Sound</Label>
                  <Select 
                    value={formData.soundType} 
                    onValueChange={(value: 'gentle' | 'classic' | 'nature') => 
                      setFormData(prev => ({ ...prev, soundType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALARM_SOUNDS.map(sound => (
                        <SelectItem key={sound.value} value={sound.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{sound.label}</span>
                            <span className="text-xs text-muted-foreground">{sound.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Preview button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => playPreviewSound(formData.soundType)}
                    className="w-full gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    Preview Sound (3s)
                  </Button>
                </div>
              )}

              {/* Days of Week */}
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_OF_WEEK.map(day => (
                    <Button
                      key={day.value}
                      variant={formData.days.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      className="text-xs"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingTimer ? 'Update' : 'Create'} Timer
                </Button>
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sleep Timers */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Sleep Timers</h3>
        </div>
        
        {sleepTimers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Moon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No sleep timers set</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {sleepTimers.map(timer => (
              <Card key={timer.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold">{formatTime12Hour(timer.time)}</span>
                        <Badge variant={timer.isAlarm ? 'default' : 'secondary'}>
                          {timer.isAlarm ? 'Alarm' : 'Reminder'}
                        </Badge>
                        {!timer.enabled && (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {timer.label}
                        {timer.isAlarm && (
                          <span className="ml-2 text-xs">
                            ({ALARM_SOUNDS.find(s => s.value === timer.soundType)?.label})
                          </span>
                        )}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {timer.days.map(day => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {DAYS_OF_WEEK.find(d => d.value === day)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTimer(timer.id)}
                        className="touch-target"
                      >
                        {timer.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(timer)}
                        className="touch-target"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTimer(timer.id)}
                        className="text-destructive hover:text-destructive touch-target"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Wake Timers */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Wake Timers</h3>
        </div>
        
        {wakeTimers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Sun className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No wake timers set</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {wakeTimers.map(timer => (
              <Card key={timer.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-bold">{formatTime12Hour(timer.time)}</span>
                        <Badge variant={timer.isAlarm ? 'default' : 'secondary'}>
                          {timer.isAlarm ? 'Alarm' : 'Reminder'}
                        </Badge>
                        {!timer.enabled && (
                          <Badge variant="outline">Disabled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {timer.label}
                        {timer.isAlarm && (
                          <span className="ml-2 text-xs">
                            ({ALARM_SOUNDS.find(s => s.value === timer.soundType)?.label})
                          </span>
                        )}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {timer.days.map(day => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {DAYS_OF_WEEK.find(d => d.value === day)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTimer(timer.id)}
                        className="touch-target"
                      >
                        {timer.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(timer)}
                        className="touch-target"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTimer(timer.id)}
                        className="text-destructive hover:text-destructive touch-target"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">💡 Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>Alarms</strong> will play sound and show persistent notifications</p>
          <p>• <strong>Reminders</strong> show silent toast notifications</p>
          <p>• Enable browser notifications for the best experience</p>
          <p>• Wake timers can automatically add morning routine tasks</p>
          <p>• Use the preview button to test alarm sounds before saving</p>
          <p>• Download sound files: street-alarm.wav, warning-buzzer.wav, vintage-alarm.wav</p>
        </CardContent>
      </Card>
    </div>
  );
}