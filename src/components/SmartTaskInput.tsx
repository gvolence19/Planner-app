// Enhanced SmartTaskInput.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Brain, Lightbulb, Wand2 } from 'lucide-react';
import { Task, TaskCategory } from '@/types';
import { PatternLearningSystem } from '@/lib/pattern-learning';
import { AITaskService, AITaskSuggestion, getTaskAIIcon } from './AITaskService';

interface SmartTaskInputProps {
  onTaskCreate: (taskData: {
    title?: string;
    category?: string;
    priority?: Task['priority'];
    location?: string;
    duration?: string;
    isAISuggested?: boolean;
    aiCategory?: string;
  }) => void;
  tasks: Task[];
  categories: TaskCategory[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

interface ParsedTaskData {
  title: string;
  category?: string;
  priority?: Task['priority'];
  location?: string;
  duration?: string;
}

export const SmartTaskInput: React.FC<SmartTaskInputProps> = ({
  onTaskCreate,
  tasks,
  categories,
  placeholder = "What do you need to do?",
  value = '',
  onChange
}) => {
  const [input, setInput] = useState(value);
  const [predictions, setPredictions] = useState<{
    category?: string;
    priority?: Task['priority'];
    location?: string;
    duration?: string;
  }>({});
  const [showPredictions, setShowPredictions] = useState(false);
  const [hasAppliedPredictions, setHasAppliedPredictions] = useState(false);
  
  // AI-related state (similar to grocery list)
  const [aiSuggestions, setAiSuggestions] = useState<AITaskSuggestion[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<AITaskSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with external value prop
  useEffect(() => {
    setInput(value);
    setHasAppliedPredictions(false);
  }, [value]);

  // Load smart suggestions when tasks change
  useEffect(() => {
    const existingTaskTitles = tasks.map(task => task.title);
    const categoryNames = categories.map(cat => cat.name);
    
    AITaskService.getSmartSuggestions(existingTaskTitles, categoryNames)
      .then(setSmartSuggestions)
      .catch(console.error);
  }, [tasks, categories]);

  // Handle AI suggestions as user types (similar to grocery list)
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (input.trim().length > 0) {
      setIsLoadingSuggestions(true);
      setShowAISuggestions(true);
      
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const existingTaskTitles = tasks.map(task => task.title);
          const categoryNames = categories.map(cat => cat.name);
          
          const suggestions = await AITaskService.getSuggestions(input, existingTaskTitles, categoryNames);
          setAiSuggestions(suggestions);
        } catch (error) {
          console.error('Error getting AI task suggestions:', error);
          setAiSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 150);
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
  }, [input, tasks, categories]);

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

    // Extract duration
    let duration: string | undefined;
    const durationMatch = cleanText.match(/\b(\d+)\s*(min|minute|minutes|hour|hours|h)\b/i);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      if (unit.startsWith('h')) {
        duration = (value * 60).toString();
      } else {
        duration = value.toString();
      }
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
      .replace(/\b\d+\s*(min|minute|minutes|hour|hours|h)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      title: title || cleanText,
      category,
      priority,
      location,
      duration
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
    if (text.length < 3 || hasAppliedPredictions) {
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
      location: parsed.location || predicted.location,
      duration: parsed.duration
    };

    setPredictions(finalPredictions);
    setShowPredictions(Object.values(finalPredictions).some(Boolean));
  };

  useEffect(() => {
    if (hasAppliedPredictions) return;
    
    const timeoutId = setTimeout(() => {
      generatePredictions(input);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [input, hasAppliedPredictions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    setHasAppliedPredictions(false);
    
    // Call the onChange prop if provided
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (aiSuggestions.length > 0 && showAISuggestions) {
        // Add the first (top) AI suggestion
        addTaskFromAISuggestion(aiSuggestions[0]);
      } else if (input.trim() && showPredictions && !hasAppliedPredictions) {
        handleApplyPredictions();
      } else if (input.trim()) {
        handleApplyPredictions();
      }
    } else if (e.key === 'Escape') {
      setShowAISuggestions(false);
      setAiSuggestions([]);
      setShowPredictions(false);
    }
  };

  const handleFocus = () => {
    if (input.length >= 3 && !hasAppliedPredictions) {
      generatePredictions(input);
    }
  };

  const addTaskFromAISuggestion = (suggestion: AITaskSuggestion) => {
    const taskData = {
      title: suggestion.title,
      category: suggestion.category,
      priority: suggestion.priority,
      location: suggestion.location,
      duration: suggestion.duration,
      isAISuggested: true,
      aiCategory: suggestion.category
    };

    onTaskCreate(taskData);
    setInput('');
    setShowAISuggestions(false);
    setAiSuggestions([]);
    
    if (onChange) {
      onChange('');
    }
  };

  const addSmartSuggestion = (suggestion: AITaskSuggestion) => {
    addTaskFromAISuggestion(suggestion);
    
    // Remove from smart suggestions
    setSmartSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
  };

  const handleApplyPredictions = () => {
    const parsed = parseNaturalLanguage(input);
    
    const taskData = {
      title: parsed.title,
      category: predictions.category || parsed.category,
      priority: predictions.priority || parsed.priority,
      location: predictions.location || parsed.location,
      duration: predictions.duration || parsed.duration
    };

    onTaskCreate(taskData);
    
    setInput('');
    setHasAppliedPredictions(true);
    setPredictions({});
    setShowPredictions(false);
    setShowAISuggestions(false);
    
    if (onChange) {
      onChange('');
    }
  };

  const removePrediction = (type: 'category' | 'priority' | 'location' | 'duration') => {
    setPredictions(prev => ({
      ...prev,
      [type]: undefined
    }));
    
    // Hide predictions if no predictions remain
    const updatedPredictions = { ...predictions, [type]: undefined };
    setShowPredictions(Object.values(updatedPredictions).some(Boolean));
  };

  return (
    <div className="space-y-2">
      {/* Smart Suggestions (Similar to grocery list) */}
      {smartSuggestions.length > 0 && !input.trim() && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">AI Task Suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {smartSuggestions.slice(0, 4).map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => addSmartSuggestion(suggestion)}
                  className="h-8 text-xs border-purple-200 hover:bg-purple-100"
                >
                  <span className="mr-1">{getTaskAIIcon(suggestion.category, suggestion.title)}</span>
                  {suggestion.title}
                  <Wand2 className="h-3 w-3 ml-1 text-purple-500" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder={placeholder}
              className="pr-10"
            />
            {(isLoadingSuggestions || (showPredictions && !hasAppliedPredictions)) && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={handleApplyPredictions}
                title="Apply smart suggestions"
              >
                <Sparkles className={`h-4 w-4 ${isLoadingSuggestions ? 'animate-spin text-purple-500' : 'text-blue-500'}`} />
              </Button>
            )}
          </div>
        </div>
        
        {/* AI Suggestions Dropdown (Similar to grocery list) */}
        {showAISuggestions && (
          <Card className="absolute z-50 w-full mt-1 border-purple-200 shadow-xl bg-white">
            <CardContent className="p-0">
              {isLoadingSuggestions ? (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Getting smart task suggestions...</span>
                  </div>
                </div>
              ) : aiSuggestions.length > 0 ? (
                <div>
                  <div className="px-3 py-2 bg-purple-50 border-b border-purple-100">
                    <div className="text-xs text-purple-700 font-medium flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      AI Task Suggestions • Press Enter for first option
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {aiSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => addTaskFromAISuggestion(suggestion)}
                        className={`w-full text-left p-3 hover:bg-purple-50 transition-colors flex items-center justify-between group border-b border-gray-100 last:border-b-0 ${
                          idx === 0 ? 'bg-purple-25' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getTaskAIIcon(suggestion.category, suggestion.title)}</span>
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {suggestion.title}
                            </div>
                            <div className="text-xs text-purple-600 flex items-center gap-1">
                              <span>{suggestion.reason}</span>
                              <span className="text-gray-400">•</span>
                              <span className="capitalize">{suggestion.category}</span>
                              {suggestion.duration && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span>{suggestion.duration}min</span>
                                </>
                              )}
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
              ) : input.trim() && (
                <div className="p-4 text-center text-gray-500">
                  <Lightbulb className="h-4 w-4 mx-auto mb-1 opacity-50" />
                  <div className="text-sm">No AI suggestions found</div>
                  <div className="text-xs">Press Enter to add "{input}"</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pattern Learning Predictions */}
      {showPredictions && !hasAppliedPredictions && !showAISuggestions && (
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

          {predictions.duration && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
              <span className="mr-1">⏱️</span>
              {predictions.duration}min
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removePrediction('duration')}
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