import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, Coffee, Utensils, Moon, Bell, Settings, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Meal types with default times and icons
const MEAL_TYPES = {
  breakfast: {
    name: 'Breakfast',
    icon: Coffee,
    defaultTime: '08:00',
    color: 'bg-orange-500'
  },
  lunch: {
    name: 'Lunch', 
    icon: Utensils,
    defaultTime: '12:30',
    color: 'bg-green-500'
  },
  dinner: {
    name: 'Dinner',
    icon: Moon,
    defaultTime: '18:30',
    color: 'bg-purple-500'
  }
};

interface MealReminder {
  id: string;
  type: keyof typeof MEAL_TYPES;
  time: string;
  enabled: boolean;
  customMessage?: string;
  recurring: boolean;
}

interface MealReminderManagerProps {
  onAddTask?: (task: any) => void;
}

export default function MealReminderManager({ onAddTask }: MealReminderManagerProps) {
  const [reminders, setReminders] = useState<MealReminder[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<MealReminder | null>(null);

  // Load reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meal-reminders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReminders(parsed);
      } catch (error) {
        console.error('Error loading meal reminders:', error);
      }
    } else {
      // Initialize with default reminders
      const defaultReminders: MealReminder[] = Object.keys(MEAL_TYPES).map(type => ({
        id: crypto.randomUUID(),
        type: type as keyof typeof MEAL_TYPES,
        time: MEAL_TYPES[type as keyof typeof MEAL_TYPES].defaultTime,
        enabled: true,
        recurring: true
      }));
      setReminders(defaultReminders);
    }
  }, []);

  // Save to localStorage whenever reminders change
  useEffect(() => {
    localStorage.setItem('meal-reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Check for due reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.time === currentTime) {
          const mealType = MEAL_TYPES[reminder.type];
          const message = reminder.customMessage || `Time for ${mealType.name.toLowerCase()}!`;
          
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`🍽️ ${mealType.name} Reminder`, {
              body: message,
              icon: '/favicon.svg'
            });
          }
          
          // Show toast
          toast(`🍽️ ${mealType.name} Reminder`, {
            description: message,
            duration: 5000
          });

          // Add as task if recurring and onAddTask is provided
          if (reminder.recurring && onAddTask) {
            const task = {
              id: crypto.randomUUID(),
              title: `${mealType.name} Time`,
              description: message,
              completed: false,
              priority: 'medium' as const,
              category: 'Health',
              createdAt: new Date(),
              dueDate: new Date(),
              recurring: 'daily' as const
            };
            onAddTask(task);
          }
        }
      });
    };

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders, onAddTask]);

  const toggleReminder = (id: string) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, enabled: !reminder.enabled }
          : reminder
      )
    );
  };

  const updateReminder = (updatedReminder: MealReminder) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === updatedReminder.id ? updatedReminder : reminder
      )
    );
    setEditingReminder(null);
    toast.success('Meal reminder updated!');
  };

  const addCustomReminder = () => {
    const newReminder: MealReminder = {
      id: crypto.randomUUID(),
      type: 'breakfast',
      time: '10:00',
      enabled: true,
      customMessage: 'Custom meal reminder',
      recurring: true
    };
    setReminders(prev => [...prev, newReminder]);
    setEditingReminder(newReminder);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    setEditingReminder(null);
    toast.success('Meal reminder deleted!');
  };

  const getNextMealReminder = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const enabledReminders = reminders.filter(r => r.enabled);
    const upcomingReminders = enabledReminders
      .map(reminder => {
        const [hours, minutes] = reminder.time.split(':').map(Number);
        const reminderTime = hours * 60 + minutes;
        return {
          ...reminder,
          minutesUntil: reminderTime > currentTime 
            ? reminderTime - currentTime 
            : (24 * 60) - currentTime + reminderTime // Next day
        };
      })
      .sort((a, b) => a.minutesUntil - b.minutesUntil);

    return upcomingReminders[0] || null;
  };

  const nextMeal = getNextMealReminder();

  return (
    <div className="space-y-4">
      {/* Next Meal Reminder Card */}
      {nextMeal && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(MEAL_TYPES[nextMeal.type].icon, {
                  className: `h-6 w-6 text-white rounded-full p-1 ${MEAL_TYPES[nextMeal.type].color}`
                })}
                <div>
                  <h3 className="font-semibold">Next: {MEAL_TYPES[nextMeal.type].name}</h3>
                  <p className="text-sm text-muted-foreground">
                    in {Math.floor(nextMeal.minutesUntil / 60)}h {nextMeal.minutesUntil % 60}m at {nextMeal.time}
                  </p>
                </div>
              </div>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meal Reminders Grid */}
      <div className="grid gap-3">
        {reminders.map(reminder => {
          const mealType = MEAL_TYPES[reminder.type];
          const IconComponent = mealType.icon;
          
          return (
            <Card key={reminder.id} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${mealType.color}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{mealType.name}</h4>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{reminder.time}</span>
                        {reminder.recurring && (
                          <Badge variant="secondary" className="text-xs">Daily</Badge>
                        )}
                      </div>
                      {reminder.customMessage && (
                        <p className="text-xs text-muted-foreground mt-1">
                          "{reminder.customMessage}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={() => toggleReminder(reminder.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingReminder(reminder)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Custom Reminder Button */}
      <Button
        variant="outline"
        onClick={addCustomReminder}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Meal Reminder
      </Button>

      {/* Edit Reminder Dialog */}
      <Dialog open={!!editingReminder} onOpenChange={(open) => !open && setEditingReminder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meal Reminder</DialogTitle>
          </DialogHeader>
          {editingReminder && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reminder-type">Meal Type</Label>
                <select
                  id="reminder-type"
                  value={editingReminder.type}
                  onChange={(e) => setEditingReminder({
                    ...editingReminder,
                    type: e.target.value as keyof typeof MEAL_TYPES
                  })}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  {Object.entries(MEAL_TYPES).map(([key, meal]) => (
                    <option key={key} value={key}>{meal.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="reminder-time">Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={editingReminder.time}
                  onChange={(e) => setEditingReminder({
                    ...editingReminder,
                    time: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="custom-message">Custom Message (optional)</Label>
                <Input
                  id="custom-message"
                  placeholder="e.g., Don't forget your vitamins!"
                  value={editingReminder.customMessage || ''}
                  onChange={(e) => setEditingReminder({
                    ...editingReminder,
                    customMessage: e.target.value
                  })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={editingReminder.recurring}
                  onCheckedChange={(checked) => setEditingReminder({
                    ...editingReminder,
                    recurring: checked
                  })}
                />
                <Label htmlFor="recurring">Create daily tasks</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={editingReminder.enabled}
                  onCheckedChange={(checked) => setEditingReminder({
                    ...editingReminder,
                    enabled: checked
                  })}
                />
                <Label htmlFor="enabled">Enable reminder</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => updateReminder(editingReminder)}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                {reminders.length > 3 && (
                  <Button
                    variant="destructive"
                    onClick={() => deleteReminder(editingReminder.id)}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setEditingReminder(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}