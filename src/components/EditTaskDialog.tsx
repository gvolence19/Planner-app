import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, RepeatIcon, Trash, Lock } from 'lucide-react';
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
  const [category, setCategory] = useState<string | undefined>(task.category?.name);
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate);
  const [completed, setCompleted] = useState(task.completed);
  const [recurring, setRecurring] = useState<Task['recurring']>(task.recurring || 'none');
  const [recurringUpdateOption, setRecurringUpdateOption] = useState<'this' | 'all'>('this');
  const [location, setLocation] = useState(task.location || '');
  
  // Filter categories for free users
  const availableCategories = isPremium 
    ? categories 
    : categories.filter(cat => FREE_CATEGORIES.includes(cat.name));

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setPriority(task.priority);
      setDueDate(task.dueDate);
      setCompleted(task.completed);
      setRecurring(task.recurring || 'none');
      setLocation(task.location || '');
      setRecurringUpdateOption('this');
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const isRecurringInstance = task.recurringParentId;
    const isRecurringParent = task.recurring && task.recurring !== 'none' && !task.recurringParentId;
    
    // Default: update just this task
    const updatedTask: Task = {
      ...task,
      title: title.trim(),
      description: description.trim() || undefined,
      completed,
      category,
      priority,
      dueDate,
      recurring: isRecurringInstance ? 'none' : recurring,
      location: location.trim() || undefined,
    };

    onUpdateTask(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${cat.color} mr-2`} />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
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

          {!task.recurringParentId && (
            <div className="space-y-2">
              <Label htmlFor="recurring">Recurring</Label>
              <Select 
                value={recurring || 'none'} 
                onValueChange={(val) => setRecurring(val as Task['recurring'])}
              >
                <SelectTrigger id="recurring">
                  <SelectValue placeholder="Not recurring" />
                </SelectTrigger>
                <SelectContent>
                  {RECURRING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.value !== 'none' && <RepeatIcon className="mr-2 h-4 w-4" />}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {recurring !== 'none' && (
                <p className="text-xs text-muted-foreground">
                  This task will automatically repeat based on the selected frequency.
                </p>
              )}
            </div>
          )}
          
          <LocationInput
            value={location}
            onChange={setLocation}
          />
          
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
            
            <div className="flex gap-2">
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