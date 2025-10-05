import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RepeatIcon, Trash, Lock, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task, TaskCategory, PRIORITIES, RECURRING_OPTIONS } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FREE_CATEGORIES } from '@/types/subscription';
import LocationInput from './LocationInput';

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask?: (id: string) => void;
  categories: TaskCategory[];
}

export default function EditTaskDialog({ task, open, onOpenChange, onUpdateTask, onDeleteTask, categories }: EditTaskDialogProps) {
  const { isPremium } = useSubscription();
  
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [category, setCategory] = useState<string | undefined>(task.category);
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate);
  const [startTime, setStartTime] = useState(task.startTime || '');
  const [duration, setDuration] = useState(task.duration || '');
  const [customDuration, setCustomDuration] = useState('');
  const [completed, setCompleted] = useState(task.completed);
  const [recurring, setRecurring] = useState<Task['recurring']>(task.recurring || 'none');
  const [recurringUpdateOption, setRecurringUpdateOption] = useState<'this' | 'all'>('this');
  const [location, setLocation] = useState(task.location || '');
  
  // Filter categories for free users
  const availableCategories = isPremium 
    ? categories 
    : categories.filter(cat => FREE_CATEGORIES.includes(cat.name));

  // Check if the current duration is a predefined value or custom
  const isCustomDuration = (duration: string) => {
    const predefinedValues = ['15', '30', '45', '60', '90', '120', '180', '240', '480'];
    return duration && !predefinedValues.includes(duration);
  };

  // Update form when task changes
  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setStartTime(task.startTime || '');
      
      // Handle duration - check if it's custom or predefined
      if (task.duration && isCustomDuration(task.duration)) {
        setDuration('custom');
        setCustomDuration(task.duration);
      } else {
        setDuration(task.duration || '');
        setCustomDuration('');
      }
      
      setCompleted(task.completed);
      setRecurring(task.recurring || 'none');
      setLocation(task.location || '');
      setRecurringUpdateOption('this');
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalDuration = duration === 'custom' ? customDuration : duration;
    const isRecurringInstance = task.recurringParentId;
    
    // Default: update just this task
    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      completed,
      category,
      priority,
      dueDate,
      startTime: startTime.trim() || undefined,
      duration: finalDuration.trim() || undefined,
      recurring: isRecurringInstance ? 'none' : recurring,
      location: location.trim() || undefined,
    };

    onUpdateTask(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task details (optional)" 
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className="flex items-center gap-2">
                        {cat.icon && <span className="text-base">{cat.icon}</span>}
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {!isPremium && categories.some(cat => !FREE_CATEGORIES.includes(cat.name)) && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground border-t mt-1">
                      <div className="flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        <span>Premium categories available with subscription</span>
                      </div>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(val: Task['priority']) => setPriority(val)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((pri) => (
                    <SelectItem key={pri.value} value={pri.value}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${pri.color} mr-2`} />
                        <span>{pri.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input 
                id="startTime" 
                type="time"
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {duration === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customDuration">Custom Duration (minutes)</Label>
              <Input 
                id="customDuration" 
                type="number"
                value={customDuration} 
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="e.g., 45"
              />
            </div>
          )}

          {!task.recurringParentId && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="recurring">Recurring</Label>
                {!isPremium && (
                  <div className="flex items-center text-xs text-amber-500 dark:text-amber-400">
                    <Lock className="h-3 w-3 mr-0.5" />
                    Premium Feature
                  </div>
                )}
              </div>
              <Select 
                value={recurring || 'none'} 
                onValueChange={(val) => {
                  // Only allow recurring tasks for premium users
                  if (!isPremium && val !== 'none') {
                    return;
                  }
                  setRecurring(val as Task['recurring']);
                }}
              >
                <SelectTrigger id="recurring" disabled={!isPremium}>
                  <SelectValue placeholder="Not recurring" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span>Not recurring</span>
                  </SelectItem>
                  {isPremium ? (
                    RECURRING_OPTIONS.filter(option => option.value !== 'none').map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <RepeatIcon className="mr-2 h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground border-t mt-1">
                      <div className="flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        <span>Recurring tasks available with premium</span>
                      </div>
                    </div>
                  )}
                </SelectContent>
              </Select>
              {recurring !== 'none' && isPremium && (
                <p className="text-xs text-muted-foreground">
                  This task will automatically repeat based on the selected frequency.
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="location">Location</Label>
              {!isPremium && (
                <div className="flex items-center text-xs text-amber-500 dark:text-amber-400">
                  <Lock className="h-3 w-3 mr-0.5" />
                  Premium Feature
                </div>
              )}
            </div>
            <LocationInput
              value={location}
              onChange={setLocation}
              disabled={!isPremium}
              placeholder={isPremium ? "Enter location" : "Upgrade to premium to add locations"}
              label=""
            />
          </div>
          
          <div className="flex justify-between pt-2">
            {onDeleteTask && (
              <Button 
                type="button" 
                variant="destructive"
                onClick={() => {
                  if (onDeleteTask) onDeleteTask(task.id);
                  onOpenChange(false);
                }}
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            
            <div className="flex gap-2 ml-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Task</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}