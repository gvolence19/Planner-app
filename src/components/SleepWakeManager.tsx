// src/components/SleepWakeManager.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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
    file: '/sounds/street-alarm.mp3' 
  },
  { 
    value: 'classic', 
    label: 'Warning Buzzer', 
    description: 'Sharp attention-grabbing buzzer',
    file: '/sounds/warning-buzzer.mp3' 
  },
  { 
    value: 'nature', 
    label: 'Vintage Alarm', 
    description: 'Classic old-school alarm clock',
    file: '/sounds/vintage-alarm.mp3' 
  },
];

export default function SleepWakeManager({ onAddTask }: SleepWakeManagerProps) {
  const [timers, setTimers] = useState<SleepWakeTimer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<SleepWakeTimer | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [audioLoadingStatus, setAudioLoadingStatus] = useState<{[key: string]: 'loading' | 'loaded' | 'error'}>({});
  
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

  // Enhanced audio creation and testing
  const createAndTestAudio = async (soundFile: string): Promise<HTMLAudioElement | null> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      
      // Set up event listeners before setting src
      audio.addEventListener('loadeddata', () => {
        console.log(`Audio loaded successfully: ${soundFile}`);
        resolve(audio);
      });
      
      audio.addEventListener('error', (e) => {
        console.error(`Audio load error for ${soundFile}:`, e);
        resolve(null);
      });
      
      // Set timeout for loading
      setTimeout(() => {
        console.warn(`Audio loading timeout for ${soundFile}`);
        resolve(null);
      }, 5000);
      
      // Set the source - this triggers loading
      audio.src = soundFile;
      audio.preload = 'auto';
      audio.load();
    });
  };

  const playAlarmSound = async (soundType: string) => {
    console.log(`Attempting to play alarm sound: ${soundType}`);
    
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }

    const sound = ALARM_SOUNDS.find(s => s.value === soundType);
    if (!sound) {
      console.error('Sound not found:', soundType);
      toast.error('Selected sound not available');
      return;
    }

    try {
      // Create and test audio
      const audio = await createAndTestAudio(sound.file);
      
      if (!audio) {
        console.error('Failed to create audio element');
        toast.error(`Could not load audio file: ${sound.label}`);
        return;
      }

      // Configure audio
      audio.loop = true;
      audio.volume = 0.8; // Start at 80% volume
      
      setCurrentAudio(audio);
      
      // Attempt to play
      try {
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Audio playback started successfully');
          
          // Stop after 30 seconds to prevent infinite looping
          setTimeout(() => {
            if (audio) {
              audio.pause();
              audio.currentTime = 0;
              setCurrentAudio(null);
              console.log('Alarm auto-stopped after 30 seconds');
            }
          }, 30000);
          
        }
      } catch (playError) {
        console.error('Audio playback failed:', playError);
        
        // Show more specific error messages
        if (playError.name === 'NotAllowedError') {
          toast.error('Audio blocked by browser. Please interact with the page first, then try again.');
        } else if (playError.name === 'NotSupportedError') {
          toast.error('Audio format not supported by your browser.');
        } else {
          toast.error(`Audio playback failed: ${playError.message}`);
        }
      }
      
    } catch (error) {
      console.error('Error in playAlarmSound:', error);
      toast.error('Failed to initialize audio playback');
    }
  };

  const playPreviewSound = async (soundType: string) => {
    console.log(`Attempting to preview sound: ${soundType}`);
    
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }

    const sound = ALARM_SOUNDS.find(s => s.value === soundType);
    if (!sound) {
      console.error('Sound not found for preview:', soundType);
      return;
    }

    try {
      const audio = await createAndTestAudio(sound.file);
      
      if (!audio) {
        toast.error(`Could not load preview for: ${sound.label}. Check if the file exists at ${sound.file}`);
        return;
      }

      audio.volume = 0.6; // Lower volume for preview
      setCurrentAudio(audio);
      
      try {
        await audio.play();
        console.log('Preview started successfully');
        
        // Stop preview after 3 seconds
        setTimeout(() => {
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
            setCurrentAudio(null);
            console.log('Preview stopped after 3 seconds');
          }
        }, 3000);
        
      } catch (playError) {
        console.error('Preview playback failed:', playError);
        
        if (playError.name === 'NotAllowedError') {
          toast.error('Please click somewhere on the page first to enable audio preview');
        } else {
          toast.error(`Preview failed: ${playError.message}`);
        }
      }
      
    } catch (error) {
      console.error('Error in playPreviewSound:', error);
      toast.error('Failed to load audio for preview');
    }
  };

  // Test audio files on component mount
  const testAudioFiles = async () => {
    console.log('Testing MP3 audio file availability...');
    const results: {[key: string]: boolean} = {};
    
    for (const sound of ALARM_SOUNDS) {
      setAudioLoadingStatus(prev => ({ ...prev, [sound.value]: 'loading' }));
      
      const audio = await createAndTestAudio(sound.file);
      const isAvailable = audio !== null;
      
      results[sound.value] = isAvailable;
      setAudioLoadingStatus(prev => ({ 
        ...prev, 
        [sound.value]: isAvailable ? 'loaded' : 'error' 
      }));
      
      console.log(`${sound.label}: ${isAvailable ? 'Available' : 'Not Available'}`);
    }
    
    const availableCount = Object.values(results).filter(Boolean).length;
    console.log(`Audio test complete: ${availableCount}/${ALARM_SOUNDS.length} files available`);
    
    if (availableCount === 0) {
      toast.error('No alarm sounds could be loaded. Please check that MP3 files are in the /public/sounds/ folder.');
    } else if (availableCount < ALARM_SOUNDS.length) {
      toast.warning(`Only ${availableCount} of ${ALARM_SOUNDS.length} alarm sounds are available.`);
    } else {
      toast.success('All alarm sounds loaded successfully!');
    }
  };

  // Test audio files after component mount
  useEffect(() => {
    // Test audio files after a brief delay to ensure component is mounted
    const timer = setTimeout(() => {
      testAudioFiles();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
          <DialogContent className="sm:max-w-md" aria-describedby="sleep-timer-description">
            <DialogHeader>
              <DialogTitle>
                {editingTimer ? 'Edit Timer' : 'Create New Timer'}
              </DialogTitle>
              <DialogDescription id="sleep-timer-description">
                Configure your sleep and wake timer settings
              </DialogDescription>
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
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{sound.label}</span>
                              <span className="text-xs text-muted-foreground">{sound.description}</span>
                            </div>
                            <div className="ml-2">
                              {audioLoadingStatus[sound.value] === 'loading' && (
                                <span className="text-xs text-yellow-600">Loading...</span>
                              )}
                              {audioLoadingStatus[sound.value] === 'loaded' && (
                                <span className="text-xs text-green-600">✓</span>
                              )}
                              {audioLoadingStatus[sound.value] === 'error' && (
                                <span className="text-xs text-red-600">✗</span>
                              )}
                            </div>
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
                    disabled={audioLoadingStatus[formData.soundType] !== 'loaded'}
                  >
                    <Volume2 className="h-4 w-4" />
                    {audioLoadingStatus[formData.soundType] === 'loading' ? 'Loading...' :
                     audioLoadingStatus[formData.soundType] === 'error' ? 'File Not Available' :
                     'Preview Sound (3s)'}
                  </Button>
                  
                  {audioLoadingStatus[formData.soundType] === 'error' && (
                    <p className="text-xs text-red-600">
                      Audio file not found: {ALARM_SOUNDS.find(s => s.value === formData.soundType)?.file}
                    </p>
                  )}
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
          <p>• <strong>Required files:</strong> street-alarm.mp3, warning-buzzer.mp3, vintage-alarm.mp3 in /public/sounds/</p>
          <p>• MP3 format provides better browser compatibility than WAV</p>
        </CardContent>
      </Card>
    </div>
  );
} (
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
        ) :