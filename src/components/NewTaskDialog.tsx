import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RepeatIcon, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task, PRIORITIES, RECURRING_OPTIONS, TaskCategory } from '@/types';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { FREE_CATEGORIES } from '@/types/subscription';
import LocationInput from './LocationInput';
import { SmartTaskInput } from './SmartTaskInput';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Task) => void;
  initialDate?: Date;
  categories: TaskCategory[];
  tasks: Task[]; // Added tasks prop for SmartTaskInput
}

export default function NewTaskDialog({ open, onOpenChange, onAddTask, initialDate, categories, tasks }: NewTaskDialogProps) {
  const { isPremium } = useSubscription();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState<Date | undefined>(initialDate);
  const [recurring, setRecurring] = useState<Task['recurring']>('none');
  const [location, setLocation] = useState('');
  
  // Filter categories for free users
  const availableCategories = isPremium 
    ? categories 
    : categories.filter(cat => FREE_CATEGORIES.includes(cat.name));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      category,
      priority,
      dueDate,
      createdAt: new Date(),
      recurring,
      location: location.trim() || undefined
    };

    onAddTask(newTask);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(undefined);
    setPriority('medium');
    setDueDate(initialDate);
    setRecurring('none');
    setLocation('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Task *</Label>
            <SmartTaskInput
              onTaskCreate={(taskData) => {
                setTitle(taskData.title || '');
                setCategory(taskData.category);
                setPriority(taskData.priority || 'medium');
                setLocation(taskData.location || '');
              }}
              tasks={tasks}
              categories={categories}
              placeholder="What do you need to do?"
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
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${cat.color} mr-2`} />
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
            <Label htmlFor="dueDate">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dueDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

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
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}