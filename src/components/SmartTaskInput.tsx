// src/components/SmartTaskInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { Task, TaskCategory } from '@/types';
import { PatternLearningSystem } from '@/lib/pattern-learning';

interface SmartTaskInputProps {
  onTaskCreate: (taskData: {
    title?: string;
    category?: string;
    priority?: Task['priority'];
    location?: string;
  }) => void;
  tasks: Task[];
  categories: TaskCategory[];
  placeholder?: string;
}

interface ParsedTaskData {
  title: string;
  category?: string;
  priority?: Task['priority'];
  location?: string;
}

export const SmartTaskInput: React.FC<SmartTaskInputProps> = ({
  onTaskCreate,
  tasks,
  categories,
  placeholder = "What do you need to do?"
}) => {
  const [input, setInput] = useState('');
  const [predictions, setPredictions] = useState<{
    category?: string;
    priority?: Task['priority'];
    location?: string;
  }>({});
  const [showPredictions, setShowPredictions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseNaturalLanguage = (text: string): ParsedTaskData => {
    const cleanText = text.trim();
    
    // Extract priority keywords
    let priority: Task['priority'] | undefined;
    if (/\b(urgent|asap|emergency|critical|important|high)\b/i.test(cleanText)) {
      priority = 'high';
    } else if (/\b(low|minor|when\s+free|eventually|someday)\b/i.test(cleanText)) {
      priority = 'low';
    } else if (/\b(medium|normal|regular)\b/i.test(cleanText)) {
      priority = 'medium';
    }

    // Extract location from common patterns
    let location: string | undefined;
    const locationMatch = cleanText.match(/\b(?:at|in|@)\s+([^,.\n]+?)(?:\s+(?:today|tomorrow|by|on|at\s+\d)|\s*[,.\n]|$)/i);
    if (locationMatch) {
      location = locationMatch[1].trim();
    }

    // Extract category based on keywords
    let category: string | undefined;
    
    for (const cat of categories) {
      const categoryKeywords = getCategoryKeywords(cat.name);
      if (categoryKeywords.some(keyword => 
        new RegExp(`\\b${keyword}\\b`, 'i').test(cleanText)
      )) {
        category = cat.name;
        break;
      }
    }

    // Clean the title by removing extracted information
    let title = cleanText
      .replace(/\b(urgent|asap|emergency|critical|important|high|low|minor|when\s+free|eventually|someday|medium|normal|regular)\b/gi, '')
      .replace(/\b(?:at|in|@)\s+[^,.\n]+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      title: title || cleanText,
      category,
      priority,
      location
    };
  };

  const getCategoryKeywords = (categoryName: string): string[] => {
    const keywordMap: { [key: string]: string[] } = {
      'work': ['work', 'job', 'office', 'meeting', 'project', 'deadline', 'task', 'email', 'call'],
      'personal': ['personal', 'self', 'me', 'my', 'private', 'family', 'friend'],
      'shopping': ['buy', 'purchase', 'shop', 'store', 'market', 'grocery', 'get', 'pick up'],
      'health': ['doctor', 'appointment', 'medicine', 'health', 'exercise', 'gym', 'workout', 'medical'],
      'home': ['home', 'house', 'clean', 'repair', 'fix', 'organize', 'maintenance', 'chore'],
      'finance': ['bank', 'money', 'pay', 'bill', 'budget', 'finance', 'tax', 'payment'],
      'education': ['study', 'learn', 'course', 'class', 'homework', 'assignment', 'exam', 'school'],
      'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'book', 'plan', 'journey']
    };

    return keywordMap[categoryName.toLowerCase()] || [categoryName.toLowerCase()];
  };

  const generatePredictions = (text: string) => {
    if (text.length < 3) {
      setPredictions({});
      setShowPredictions(false);
      return;
    }

    const predicted = {
      category: PatternLearningSystem.predictCategory(text),
      priority: PatternLearningSystem.predictPriority(text),
      location: PatternLearningSystem.predictLocation(text)
    };

    // Merge with natural language parsing
    const parsed = parseNaturalLanguage(text);
    
    const finalPredictions = {
      category: parsed.category || predicted.category,
      priority: parsed.priority || predicted.priority,
      location: parsed.location || predicted.location
    };

    setPredictions(finalPredictions);
    setShowPredictions(Object.values(finalPredictions).some(Boolean));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePredictions(input);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      handleApplyPredictions();
    }
  };

  const handleFocus = () => {
    if (input.length >= 3) {
      generatePredictions(input);
    }
  };

  const handleApplyPredictions = () => {
    const parsed = parseNaturalLanguage(input);
    
    const taskData = {
      title: parsed.title,
      category: predictions.category || parsed.category,
      priority: predictions.priority || parsed.priority,
      location: predictions.location || parsed.location
    };

    console.log('Applying predictions:', taskData); // Debug log
    onTaskCreate(taskData);
    
    // Don't clear the input immediately, let the parent handle it
    // setInput('');
    setPredictions({});
    setShowPredictions(false);
  };

  const removePrediction = (type: 'category' | 'priority' | 'location') => {
    setPredictions(prev => ({
      ...prev,
      [type]: undefined
    }));
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="pr-10"
        />
        {showPredictions && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleApplyPredictions}
            title="Apply smart suggestions"
          >
            <Sparkles className="h-4 w-4 text-blue-500" />
          </Button>
        )}
      </div>

      {showPredictions && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-md">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Smart suggestions:
          </div>
          
          {predictions.category && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
              <span className="mr-1">📁</span>
              {predictions.category}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removePrediction('category')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {predictions.priority && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
              <span className="mr-1">
                {predictions.priority === 'high' ? '🔴' : 
                 predictions.priority === 'medium' ? '🟡' : '🟢'}
              </span>
              {predictions.priority} priority
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removePrediction('priority')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {predictions.location && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
              <span className="mr-1">📍</span>
              {predictions.location}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removePrediction('location')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};