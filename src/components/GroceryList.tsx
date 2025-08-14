import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Repeat,
  MoreHorizontal,
  Sparkles,
  Brain,
  Lightbulb,
  Wand2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  weekIndex: number;
  recurring: RecurringFrequency;
  recurringParentId?: string;
  isAISuggested?: boolean; // New field for AI suggestions
  aiCategory?: string; // Category for AI suggestions
}

interface AISuggestion {
  name: string;
  category: string;
  confidence: number;
  reason: string;
}

// Mock AI service for suggestions
const AIGroceryService = {
  // Common grocery categories and items
  categories: {
    'produce': ['apples', 'bananas', 'carrots', 'spinach', 'tomatoes', 'onions', 'potatoes', 'broccoli', 'lettuce', 'oranges'],
    'dairy': ['milk', 'eggs', 'cheese', 'yogurt', 'butter', 'cream cheese', 'sour cream'],
    'meat': ['chicken breast', 'ground beef', 'salmon', 'bacon', 'turkey', 'pork chops'],
    'pantry': ['bread', 'rice', 'pasta', 'flour', 'sugar', 'salt', 'pepper', 'olive oil'],
    'snacks': ['chips', 'crackers', 'nuts', 'granola bars', 'cookies'],
    'beverages': ['water', 'juice', 'coffee', 'tea', 'soda'],
    'frozen': ['ice cream', 'frozen vegetables', 'frozen fruit', 'frozen meals'],
    'cleaning': ['dish soap', 'laundry detergent', 'paper towels', 'toilet paper'],
  },

  getSuggestions: async (input: string, existingItems: string[]): Promise<AISuggestion[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const suggestions: AISuggestion[] = [];
    const inputLower = input.toLowerCase().trim();
    
    if (inputLower.length === 0) return [];
    
    // Search through all categories for matches
    Object.entries(AIGroceryService.categories).forEach(([category, items]) => {
      items.forEach(item => {
        if (!existingItems.includes(item)) {
          let confidence = 0;
          let reason = '';
          
          // Exact match at start
          if (item.toLowerCase().startsWith(inputLower)) {
            confidence = 0.95;
            reason = 'Starts with your input';
          }
          // Contains the input
          else if (item.toLowerCase().includes(inputLower)) {
            confidence = 0.7;
            reason = 'Contains your input';
          }
          // Similar items (for single character inputs)
          else if (inputLower.length === 1 && item.toLowerCase().charAt(0) === inputLower) {
            confidence = 0.5;
            reason = 'Starts with same letter';
          }
          
          if (confidence > 0) {
            suggestions.push({
              name: item,
              category,
              confidence,
              reason
            });
          }
        }
      });
    });

    // Add some dynamic suggestions based on input patterns
    const dynamicSuggestions = AIGroceryService.getDynamicSuggestions(inputLower, existingItems);
    suggestions.push(...dynamicSuggestions);

    // Smart suggestions based on what's already in the list
    if (existingItems.some(item => item.toLowerCase().includes('chicken'))) {
      if (!existingItems.some(item => item.toLowerCase().includes('rice')) && inputLower.includes('r')) {
        suggestions.push({
          name: 'rice',
          category: 'pantry',
          confidence: 0.8,
          reason: 'Perfect with chicken!'
        });
      }
    }

    if (existingItems.some(item => item.toLowerCase().includes('pasta'))) {
      if (!existingItems.some(item => item.toLowerCase().includes('sauce')) && (inputLower.includes('s') || inputLower.includes('t'))) {
        suggestions.push({
          name: 'tomato sauce',
          category: 'pantry',
          confidence: 0.8,
          reason: 'Great for pasta dishes!'
        });
      }
    }

    // Sort by confidence and return top 6
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  },

  getDynamicSuggestions: (input: string, existingItems: string[]): AISuggestion[] => {
    const suggestions: AISuggestion[] = [];
    
    // Popular items that start with the input
    const popularByLetter: { [key: string]: string[] } = {
      'a': ['apples', 'avocados', 'almonds'],
      'b': ['bananas', 'bread', 'butter', 'broccoli', 'bacon'],
      'c': ['carrots', 'cheese', 'chicken', 'coffee', 'cookies'],
      'd': ['deli meat', 'dates', 'detergent'],
      'e': ['eggs', 'english muffins'],
      'f': ['flour', 'fish', 'frozen vegetables'],
      'g': ['grapes', 'garlic', 'greek yogurt'],
      'h': ['honey', 'ham', 'herbs'],
      'i': ['ice cream', 'italian dressing'],
      'j': ['juice', 'jam'],
      'k': ['kale', 'ketchup'],
      'l': ['lettuce', 'lemons', 'laundry detergent'],
      'm': ['milk', 'mushrooms', 'meat'],
      'n': ['nuts', 'noodles'],
      'o': ['onions', 'oranges', 'olive oil'],
      'p': ['potatoes', 'pasta', 'paper towels'],
      'q': ['quinoa'],
      'r': ['rice', 'ranch dressing'],
      's': ['spinach', 'salmon', 'soap', 'sugar'],
      't': ['tomatoes', 'turkey', 'tea', 'toilet paper'],
      'u': ['unsalted butter'],
      'v': ['vegetables', 'vanilla'],
      'w': ['water', 'whole wheat bread'],
      'x': ['extra virgin olive oil'],
      'y': ['yogurt', 'yams'],
      'z': ['zucchini']
    };

    const firstLetter = input.charAt(0);
    if (popularByLetter[firstLetter]) {
      popularByLetter[firstLetter].forEach(item => {
        if (!existingItems.includes(item) && item.toLowerCase().includes(input)) {
          suggestions.push({
            name: item,
            category: 'popular',
            confidence: 0.6,
            reason: 'Popular choice'
          });
        }
      });
    }

    return suggestions;
  },

  getSmartSuggestions: async (existingItems: string[]): Promise<AISuggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const suggestions: AISuggestion[] = [];
    const existingLower = existingItems.map(item => item.toLowerCase());
    
    // Weekly essentials that might be missing
    const essentials = [
      { name: 'milk', category: 'dairy', reason: 'Weekly essential' },
      { name: 'eggs', category: 'dairy', reason: 'Versatile protein source' },
      { name: 'bread', category: 'pantry', reason: 'Staple food item' },
      { name: 'bananas', category: 'produce', reason: 'Healthy snack option' },
    ];

    essentials.forEach(item => {
      if (!existingLower.some(existing => existing.includes(item.name))) {
        suggestions.push({
          ...item,
          confidence: 0.7
        });
      }
    });

    // Complementary items based on what's already there
    const complementaryPairs = [
      { base: 'chicken', suggest: 'rice', reason: 'Classic combination' },
      { base: 'pasta', suggest: 'parmesan cheese', reason: 'Perfect pairing' },
      { base: 'cereal', suggest: 'milk', reason: 'You\'ll need milk for cereal' },
      { base: 'coffee', suggest: 'cream', reason: 'Great with coffee' },
    ];

    complementaryPairs.forEach(pair => {
      if (existingLower.some(item => item.includes(pair.base)) && 
          !existingLower.some(item => item.includes(pair.suggest))) {
        suggestions.push({
          name: pair.suggest,
          category: 'pantry',
          confidence: 0.8,
          reason: pair.reason
        });
      }
    });

    return suggestions.slice(0, 4);
  }
};

// Fun AI icons based on category
const getAIIcon = (category?: string) => {
  const icons = {
    'produce': '🥕',
    'dairy': '🥛',
    'meat': '🥩',
    'pantry': '🍞',
    'snacks': '🍿',
    'beverages': '☕',
    'frozen': '🧊',
    'cleaning': '🧽',
    'default': '✨'
  };
  return icons[category as keyof typeof icons] || icons.default;
};

export default function EnhancedGroceryList() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [selectedRecurringFrequency, setSelectedRecurringFrequency] = useState<RecurringFrequency>('none');
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [pendingItemName, setPendingItemName] = useState('');
  const [pendingItemFrequency, setPendingItemFrequency] = useState<RecurringFrequency>('none');
  
  // AI-related state
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (groceryItems.length > 0) {
      const fixedItems = groceryItems.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        weekIndex: item.weekIndex !== undefined ? item.weekIndex : 0,
        recurring: item.recurring || 'none'
      }));
      setGroceryItems(fixedItems);
    }
    processRecurringItems();
  }, []);

  // Load smart suggestions when items change
  useEffect(() => {
    const currentWeekItems = groceryItems
      .filter(item => item.weekIndex === activeWeek)
      .map(item => item.name);
    
    AIGroceryService.getSmartSuggestions(currentWeekItems)
      .then(setSmartSuggestions)
      .catch(console.error);
  }, [groceryItems, activeWeek]);

  // Handle AI suggestions as user types
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (newItemName.trim().length > 0) {
      setIsLoadingSuggestions(true);
      setShowAISuggestions(true);
      
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const currentWeekItems = groceryItems
            .filter(item => item.weekIndex === activeWeek)
            .map(item => item.name);
          
          const suggestions = await AIGroceryService.getSuggestions(newItemName, currentWeekItems);
          setAiSuggestions(suggestions);
        } catch (error) {
          console.error('Error getting AI suggestions:', error);
          setAiSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 150); // Faster response time
    } else {
      setShowAISuggestions(false);
      setAiSuggestions([]);
      setIsLoadingSuggestions(false);
    }

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [newItemName, groceryItems, activeWeek]);

  const processRecurringItems = () => {
    const recurringItems = groceryItems.filter(item => 
      item.recurring !== 'none' && !item.recurringParentId);
    
    if (recurringItems.length === 0) return;

    const today = new Date();
    const newItems: GroceryItem[] = [];
    const existingItemsByParent = new Map<string, GroceryItem[]>();
    
    groceryItems.forEach(item => {
      if (item.recurringParentId) {
        const items = existingItemsByParent.get(item.recurringParentId) || [];
        items.push(item);
        existingItemsByParent.set(item.recurringParentId, items);
      }
    });
    
    recurringItems.forEach(parentItem => {
      const childItems = existingItemsByParent.get(parentItem.id) || [];
      const childWeeks = new Set(childItems.map(item => item.weekIndex));
      
      for (let weekIdx = 0; weekIdx <= 3; weekIdx++) {
        if (weekIdx === parentItem.weekIndex || childWeeks.has(weekIdx)) {
          continue;
        }
        
        let shouldAddToWeek = false;
        
        switch (parentItem.recurring) {
          case 'weekly':
            shouldAddToWeek = true;
            break;
          case 'biweekly':
            shouldAddToWeek = weekIdx % 2 === parentItem.weekIndex % 2;
            break;
          case 'monthly':
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
            recurring: 'none',
            recurringParentId: parentItem.id,
            isAISuggested: parentItem.isAISuggested,
            aiCategory: parentItem.aiCategory
          };
          
          newItems.push(newItem);
        }
      }
    });
    
    if (newItems.length > 0) {
      setGroceryItems([...groceryItems, ...newItems]);
    }
  };

  const addItemFromSuggestion = (suggestion: AISuggestion) => {
    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: suggestion.name,
      completed: false,
      createdAt: new Date(),
      weekIndex: activeWeek,
      recurring: 'none',
      isAISuggested: true,
      aiCategory: suggestion.category
    };
    
    setGroceryItems([...groceryItems, newItem]);
    setNewItemName('');
    setShowAISuggestions(false);
  };

  const addSmartSuggestion = (suggestion: AISuggestion) => {
    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: suggestion.name,
      completed: false,
      createdAt: new Date(),
      weekIndex: activeWeek,
      recurring: 'none',
      isAISuggested: true,
      aiCategory: suggestion.category
    };
    
    setGroceryItems([...groceryItems, newItem]);
    
    // Remove from smart suggestions
    setSmartSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
  };

  const openAddItemDialog = () => {
    if (!newItemName.trim()) return;
    setPendingItemName(newItemName.trim());
    setPendingItemFrequency('none');
    setIsAddItemDialogOpen(true);
  };

  const confirmAddItem = () => {
    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: pendingItemName,
      completed: false,
      createdAt: new Date(),
      weekIndex: activeWeek,
      recurring: pendingItemFrequency
    };
    
    setGroceryItems([...groceryItems, newItem]);
    setNewItemName('');
    setPendingItemName('');
    setIsAddItemDialogOpen(false);
    setShowAISuggestions(false);
    
    if (pendingItemFrequency !== 'none') {
      setTimeout(() => {
        processRecurringItems();
      }, 100);
    }
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    openAddItemDialog();
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
    
    if (itemToDelete.recurring !== 'none') {
      setGroceryItems(groceryItems.filter(
        item => item.id !== id && item.recurringParentId !== id
      ));
    } 
    else if (itemToDelete.recurringParentId) {
      const parentItem = groceryItems.find(item => item.id === itemToDelete.recurringParentId);
      
      if (confirm(`Delete this item from all weeks? Click OK to delete from all weeks, or Cancel to delete just this instance.`)) {
        setGroceryItems(groceryItems.filter(
          item => item.id !== parentItem?.id && item.recurringParentId !== parentItem?.id
        ));
      } else {
        setGroceryItems(groceryItems.filter(item => item.id !== id));
      }
    } 
    else {
      setGroceryItems(groceryItems.filter(item => item.id !== id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (aiSuggestions.length > 0 && showAISuggestions) {
        // Add the first (top) suggestion
        addItemFromSuggestion(aiSuggestions[0]);
      } else if (newItemName.trim()) {
        addItem();
      }
    } else if (e.key === 'Escape') {
      setShowAISuggestions(false);
      setAiSuggestions([]);
    } else if (e.key === 'ArrowDown' && showAISuggestions && aiSuggestions.length > 0) {
      e.preventDefault();
      // Could implement keyboard navigation here in the future
    } else if (e.key === 'ArrowUp' && showAISuggestions && aiSuggestions.length > 0) {
      e.preventDefault();
      // Could implement keyboard navigation here in the future
    }
  };

  const openRecurringDialog = (item: GroceryItem) => {
    setSelectedItem(item);
    setSelectedRecurringFrequency(item.recurring || 'none');
    setIsRecurringDialogOpen(true);
  };

  const handleRecurringChange = () => {
    if (!selectedItem) return;
    
    const updatedItems = groceryItems.map(item => {
      if (item.id === selectedItem.id) {
        return { ...item, recurring: selectedRecurringFrequency };
      }
      return item;
    });
    
    setGroceryItems(updatedItems);
    setIsRecurringDialogOpen(false);
    
    setTimeout(() => {
      processRecurringItems();
    }, 100);
  };

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

  const getItemsForWeek = (weekIndex: number) => {
    return [...groceryItems]
      .filter(item => item.weekIndex === weekIndex)
      .sort((a, b) => {
        if ((a.recurring !== 'none' || a.recurringParentId) && 
            !(b.recurring !== 'none' || b.recurringParentId)) {
          return -1;
        }
        if (!(a.recurring !== 'none' || a.recurringParentId) && 
            (b.recurring !== 'none' || b.recurringParentId)) {
          return 1;
        }
        
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  };

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
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Enhanced Grocery List
          </h2>
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
            
            {/* Smart AI Suggestions */}
            {smartSuggestions.length > 0 && activeWeek === index && (
              <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">AI Suggestions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {smartSuggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => addSmartSuggestion(suggestion)}
                        className="h-8 text-xs border-purple-200 hover:bg-purple-100"
                      >
                        <span className="mr-1">{getAIIcon(suggestion.category)}</span>
                        {suggestion.name}
                        <Wand2 className="h-3 w-3 ml-1 text-purple-500" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Input with AI suggestions */}
            <div className="relative">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    value={activeWeek === index ? newItemName : ''}
                    onChange={(e) => activeWeek === index && setNewItemName(e.target.value)}
                    onKeyDown={activeWeek === index ? handleKeyPress : undefined}
                    placeholder={`Add item for ${tab.label.toLowerCase()}...`}
                    className="flex-1"
                    disabled={activeWeek !== index}
                  />
                  {isLoadingSuggestions && activeWeek === index && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Sparkles className="h-4 w-4 animate-spin text-purple-500" />
                    </div>
                  )}
                </div>
                <Button 
                  onClick={addItem} 
                  size="icon" 
                  disabled={activeWeek !== index || !newItemName.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* AI Suggestions Dropdown */}
              {showAISuggestions && activeWeek === index && (
                <Card className="absolute z-50 w-full mt-1 border-purple-200 shadow-xl bg-white">
                  <CardContent className="p-0">
                    {isLoadingSuggestions ? (
                      <div className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-purple-600">
                          <Sparkles className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Getting smart suggestions...</span>
                        </div>
                      </div>
                    ) : aiSuggestions.length > 0 ? (
                      <div>
                        <div className="px-3 py-2 bg-purple-50 border-b border-purple-100">
                          <div className="text-xs text-purple-700 font-medium flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            AI Suggestions • Press Enter for first option
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {aiSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => addItemFromSuggestion(suggestion)}
                              className={`w-full text-left p-3 hover:bg-purple-50 transition-colors flex items-center justify-between group border-b border-gray-100 last:border-b-0 ${
                                idx === 0 ? 'bg-purple-25' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{getAIIcon(suggestion.category)}</span>
                                <div>
                                  <div className="font-medium text-sm text-gray-900">
                                    {suggestion.name}
                                  </div>
                                  <div className="text-xs text-purple-600 flex items-center gap-1">
                                    <span>{suggestion.reason}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="capitalize">{suggestion.category}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {idx === 0 && (
                                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                                    Enter ↵
                                  </Badge>
                                )}
                                <Sparkles className="h-3 w-3 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                          <div className="text-xs text-gray-500 text-center">
                            Press ↵ for top suggestion • ↑↓ to navigate • Esc to close
                          </div>
                        </div>
                      </div>
                    ) : newItemName.trim() && (
                      <div className="p-4 text-center text-gray-500">
                        <Lightbulb className="h-4 w-4 mx-auto mb-1 opacity-50" />
                        <div className="text-sm">No suggestions found</div>
                        <div className="text-xs">Press Enter to add "{newItemName}"</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {getItemsForWeek(index).length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p>No items for {tab.label.toLowerCase()}.</p>
                  <p className="text-sm mt-1">Start typing to get AI suggestions! ✨</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {getItemsForWeek(index).map(item => (
                  <Card key={item.id} className={
                    item.recurring !== 'none' || item.recurringParentId 
                      ? 'border-blue-200' 
                      : item.isAISuggested 
                        ? 'border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50' 
                        : ''
                  }>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox 
                            checked={item.completed}
                            onCheckedChange={(checked) => toggleItem(item.id, checked === true)} 
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              {item.isAISuggested && (
                                <span className="text-lg" title="AI Suggested">
                                  {getAIIcon(item.aiCategory)}
                                </span>
                              )}
                              <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                                {item.name}
                              </span>
                              {item.isAISuggested && (
                                <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            {(item.recurring !== 'none' || item.recurringParentId) && (
                              <Badge variant="outline" className="mt-1 bg-blue-50">
                                <Repeat className="h-3 w-3 mr-1" />
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
                                  <Repeat className="h-4 w-4 mr-2" />
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

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Grocery Item</DialogTitle>
            <DialogDescription>
              Would you like "{pendingItemName}" to be a recurring item?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={pendingItemFrequency}
              onValueChange={(value) => setPendingItemFrequency(value as RecurringFrequency)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">Add once (not recurring)</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {pendingItemFrequency !== 'none' && (
              <p className="text-sm text-muted-foreground mt-2">
                This item will automatically appear in future weeks according to the selected schedule.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Recurring Item Dialog */}
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