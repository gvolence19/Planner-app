import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  RepeatIcon,
  MoreHorizontal 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { format, addWeeks, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export type RecurringFrequency = 'none' | 'weekly' | 'biweekly' | 'monthly';

export interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
  createdAt: Date;
  weekIndex: number; // 0 = current week, 1 = next week, etc.
  recurring: RecurringFrequency;
  recurringParentId?: string; // Used to link recurring items together
}

export default function GroceryList() {
  const [groceryItems, setGroceryItems] = useLocalStorage<GroceryItem[]>('planner-grocery-items', []);
  const [newItemName, setNewItemName] = useState('');
  const [activeWeek, setActiveWeek] = useState<number>(0); // 0 = current week, 1 = next week, etc.
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [selectedRecurringFrequency, setSelectedRecurringFrequency] = useState<RecurringFrequency>('none');

  // Fix date objects that come from localStorage as strings
  useEffect(() => {
    if (groceryItems.length > 0) {
      const fixedItems = groceryItems.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        // Add missing fields for backward compatibility
        weekIndex: item.weekIndex !== undefined ? item.weekIndex : 0,
        recurring: item.recurring || 'none'
      }));
      setGroceryItems(fixedItems);
    }

    // Process recurring items daily
    processRecurringItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Process all recurring items and create instances for future weeks if needed
  const processRecurringItems = () => {
    const recurringItems = groceryItems.filter(item => 
      item.recurring !== 'none' && !item.recurringParentId);
    
    if (recurringItems.length === 0) return;

    const today = new Date();
    const newItems: GroceryItem[] = [];
    const existingItemsByParent = new Map<string, GroceryItem[]>();
    
    // Group all child items by their parent ID
    groceryItems.forEach(item => {
      if (item.recurringParentId) {
        const items = existingItemsByParent.get(item.recurringParentId) || [];
        items.push(item);
        existingItemsByParent.set(item.recurringParentId, items);
      }
    });
    
    // Process each recurring item
    recurringItems.forEach(parentItem => {
      const childItems = existingItemsByParent.get(parentItem.id) || [];
      const childWeeks = new Set(childItems.map(item => item.weekIndex));
      
      // Create items for weeks that don't have this recurring item yet
      for (let weekIdx = 0; weekIdx <= 3; weekIdx++) {
        // Skip if this week already has the item
        if (weekIdx === parentItem.weekIndex || childWeeks.has(weekIdx)) {
          continue;
        }
        
        // Check if we should add the item to this week based on frequency
        let shouldAddToWeek = false;
        
        switch (parentItem.recurring) {
          case 'weekly':
            shouldAddToWeek = true;
            break;
          case 'biweekly':
            shouldAddToWeek = weekIdx % 2 === parentItem.weekIndex % 2;
            break;
          case 'monthly':
            // Roughly every 4 weeks
            shouldAddToWeek = (weekIdx - parentItem.weekIndex) % 4 === 0;
            break;
        }
        
        if (shouldAddToWeek) {
          const newItem: GroceryItem = {
            id: crypto.randomUUID(),
            name: parentItem.name,
            completed: false,
            createdAt: new Date(),
            weekIndex: weekIdx,
            recurring: 'none',  // Only the parent has the recurring property
            recurringParentId: parentItem.id
          };
          
          newItems.push(newItem);
        }
      }
    });
    
    // Add all new items
    if (newItems.length > 0) {
      setGroceryItems([...groceryItems, ...newItems]);
    }
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: newItemName.trim(),
      completed: false,
      createdAt: new Date(),
      weekIndex: activeWeek,
      recurring: 'none'
    };
    
    setGroceryItems([...groceryItems, newItem]);
    setNewItemName('');
  };

  const toggleItem = (id: string, completed: boolean) => {
    setGroceryItems(
      groceryItems.map(item => 
        item.id === id ? { ...item, completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    const itemToDelete = groceryItems.find(item => item.id === id);
    
    if (!itemToDelete) return;
    
    // If this is a recurring parent, also delete all child items
    if (itemToDelete.recurring !== 'none') {
      setGroceryItems(groceryItems.filter(
        item => item.id !== id && item.recurringParentId !== id
      ));
    } 
    // If this is a recurring child, ask if they want to delete all related items
    else if (itemToDelete.recurringParentId) {
      const parentItem = groceryItems.find(item => item.id === itemToDelete.recurringParentId);
      
      if (confirm(`Delete this item from all weeks? Click OK to delete from all weeks, or Cancel to delete just this instance.`)) {
        // Delete parent and all children
        setGroceryItems(groceryItems.filter(
          item => item.id !== parentItem?.id && item.recurringParentId !== parentItem?.id
        ));
      } else {
        // Delete just this instance
        setGroceryItems(groceryItems.filter(item => item.id !== id));
      }
    } 
    // Regular item
    else {
      setGroceryItems(groceryItems.filter(item => item.id !== id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  const openRecurringDialog = (item: GroceryItem) => {
    setSelectedItem(item);
    setSelectedRecurringFrequency(item.recurring || 'none');
    setIsRecurringDialogOpen(true);
  };

  const handleRecurringChange = () => {
    if (!selectedItem) return;
    
    // Update the recurring status of the item
    const updatedItems = groceryItems.map(item => {
      if (item.id === selectedItem.id) {
        return { ...item, recurring: selectedRecurringFrequency };
      }
      return item;
    });
    
    setGroceryItems(updatedItems);
    setIsRecurringDialogOpen(false);
    
    // Immediately process recurring items to create instances
    setTimeout(() => {
      processRecurringItems();
    }, 100);
  };

  // Generate week tabs (current week + 3 weeks)
  const getWeekTabs = () => {
    const tabs = [];
    
    for (let i = 0; i <= 3; i++) {
      const weekStart = startOfWeek(addWeeks(new Date(), i));
      const weekEnd = endOfWeek(weekStart);
      
      const label = i === 0 
        ? 'This Week' 
        : i === 1 
          ? 'Next Week' 
          : `Week ${i+1}`;

      const dateRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
      
      tabs.push({
        value: i.toString(),
        label,
        dateRange,
        weekStart,
        weekEnd
      });
    }
    
    return tabs;
  };

  const weekTabs = getWeekTabs();

  // Filter and sort items for the active week
  const getItemsForWeek = (weekIndex: number) => {
    return [...groceryItems]
      .filter(item => item.weekIndex === weekIndex)
      .sort((a, b) => {
        // Sort recurring items first
        if ((a.recurring !== 'none' || a.recurringParentId) && 
            !(b.recurring !== 'none' || b.recurringParentId)) {
          return -1;
        }
        if (!(a.recurring !== 'none' || a.recurringParentId) && 
            (b.recurring !== 'none' || b.recurringParentId)) {
          return 1;
        }
        
        // Then by completion status
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        
        // Then by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  };

  // Get recurring frequency label
  const getRecurringLabel = (frequency: RecurringFrequency): string => {
    switch(frequency) {
      case 'weekly': return 'Every week';
      case 'biweekly': return 'Every 2 weeks';
      case 'monthly': return 'Every month';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="0" 
        onValueChange={(value) => setActiveWeek(parseInt(value))}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Grocery List</h2>
          <TabsList>
            {weekTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {weekTabs.map((tab, index) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              {tab.dateRange}
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                value={activeWeek === index ? newItemName : ''}
                onChange={(e) => activeWeek === index && setNewItemName(e.target.value)}
                onKeyDown={activeWeek === index ? handleKeyPress : undefined}
                placeholder={`Add item for ${tab.label.toLowerCase()}...`}
                className="flex-1"
                disabled={activeWeek !== index}
              />
              <Button 
                onClick={addItem} 
                size="icon" 
                disabled={activeWeek !== index || !newItemName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {getItemsForWeek(index).length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>No items for {tab.label.toLowerCase()}.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {getItemsForWeek(index).map(item => (
                  <Card key={item.id} className={item.recurring !== 'none' || item.recurringParentId ? 'border-blue-200' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={item.completed}
                            onCheckedChange={(checked) => toggleItem(item.id, checked === true)} 
                          />
                          <div>
                            <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                              {item.name}
                            </span>
                            {(item.recurring !== 'none' || item.recurringParentId) && (
                              <Badge variant="outline" className="ml-2 bg-blue-50">
                                <RepeatIcon className="h-3 w-3 mr-1" />
                                {item.recurring !== 'none' ? getRecurringLabel(item.recurring) : 'Recurring'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {!item.recurringParentId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => openRecurringDialog(item)}>
                                  <RepeatIcon className="h-4 w-4 mr-2" />
                                  {item.recurring === 'none' ? 'Make recurring' : 'Edit recurrence'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deleteItem(item.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          
                          {item.recurringParentId && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Recurring Item Dialog */}
      <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Recurring Schedule</DialogTitle>
            <DialogDescription>
              Choose how often you want "{selectedItem?.name}" to appear in your grocery list.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={selectedRecurringFrequency}
              onValueChange={(value) => setSelectedRecurringFrequency(value as RecurringFrequency)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Not recurring</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {selectedRecurringFrequency !== 'none' && (
              <p className="text-sm text-muted-foreground mt-2">
                This item will automatically appear in future weeks according to the selected schedule.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecurringDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecurringChange}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}