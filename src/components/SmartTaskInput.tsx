// Super Smart Task Input with Advanced AI Auto-Population
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Brain, Lightbulb, Wand2, Clock, MapPin, Star, Zap } from 'lucide-react';
import { Task, TaskCategory } from '@/types';
import { PatternLearningSystem } from '@/lib/pattern-learning';
import { AdvancedAITaskService, AdvancedAITaskSuggestion, getTaskAIIcon } from './AdvancedAITaskService';

interface SuperSmartTaskInputProps {
  onTaskCreate: (taskData: {
    title?: string;
    category?: string;
    priority?: Task['priority'];
    location?: string;
    duration?: string;
    startTime?: string;
    dueDate?: Date;
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
  startTime?: string;
  dueDate?: Date;
}

export const SuperSmartTaskInput: React.FC<SuperSmartTaskInputProps> = ({
  onTaskCreate,
  tasks,
  categories,
  placeholder = "What do you need to do? (e.g., 'doctor appointment tomorrow 2pm')",
  value = '',
  onChange
}) => {
  const [input, setInput] = useState(value);
  const [predictions, setPredictions] = useState<{
    category?: string;
    priority?: Task['priority'];
    location?: string;
    duration?: string;
    startTime?: string;
    dueDate?: Date;
  }>({});
  const [showPredictions, setShowPredictions] = useState(false);
  const [hasAppliedPredictions, setHasAppliedPredictions] = useState(false);
  
  // Advanced AI state
  const [aiSuggestions, setAiSuggestions] = useState<AdvancedAITaskSuggestion[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<AdvancedAITaskSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state with external value prop
  useEffect(() => {
    setInput(value);
    setHasAppliedPredictions(false);
  }, [value]);

  // Load contextual smart suggestions when component mounts or tasks change
  useEffect(() => {
    const existingTaskTitles = tasks.map(task => task.title);
    const categoryNames = categories.map(cat => cat.name);
    
    // Generate smart suggestions based on time, existing tasks, and patterns
    getContextualSmartSuggestions(existingTaskTitles, categoryNames);
  }, [tasks, categories]);

  // Enhanced AI suggestions as user types
  useEffect(() => {
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (input.trim().length > 1) {
      setIsLoadingSuggestions(true);
      setShowAISuggestions(true);
      setSelectedSuggestionIndex(0);
      
      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const existingTaskTitles = tasks.map(task => task.title);
          const categoryNames = categories.map(cat => cat.name);
          
          const suggestions = await AdvancedAITaskService.getSmartSuggestions(input, existingTaskTitles, categoryNames);
          setAiSuggestions(suggestions);
        } catch (error) {
          console.error('Error getting advanced AI suggestions:', error);
          setAiSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 100); // Faster response for better UX
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

  const getContextualSmartSuggestions = async (existingTaskTitles: string[], categoryNames: string[]) => {
    try {
      // Get time-aware contextual suggestions
      const hour = new Date().getHours();
      const day = new Date().getDay();
      const suggestions: AdvancedAITaskSuggestion[] = [];

      // Morning suggestions (6-10 AM)
      if (hour >= 6 && hour <= 10) {
        suggestions.push({
          title: 'Plan today\'s priorities',
          category: 'personal',
          priority: 'medium',
          duration: '15',
          confidence: 0.8,
          reason: 'Great way to start the day!',
          autoFillData: {
            recommendedTime: '08:00',
            preparationTasks: ['Review calendar', 'Check emails'],
            followUpTasks: ['Update task progress throughout day']
          }
        });
      }

      // Workday suggestions (Mon-Fri, 9-17)
      if (day >= 1 && day <= 5 && hour >= 9 && hour <= 17) {
        if (!existingTaskTitles.some(task => task.toLowerCase().includes('meeting'))) {
          suggestions.push({
            title: 'Schedule team check-in',
            category: 'work',
            priority: 'medium',
            duration: '30',
            confidence: 0.7,
            reason: 'Good for team coordination',
            autoFillData: {
              recommendedTime: '10:00',
              preparationTasks: ['Prepare agenda', 'Check team availability'],
              followUpTasks: ['Send meeting summary']
            }
          });
        }
      }

      // Weekend suggestions
      if (day === 0 || day === 6) {
        suggestions.push({
          title: 'Weekend grocery shopping',
          category: 'shopping',
          priority: 'medium',
          duration: '60',
          confidence: 0.75,
          reason: 'Perfect weekend activity',
          autoFillData: {
            recommendedTime: '10:00',
            preparationTasks: ['Make shopping list', 'Check store hours'],
            followUpTasks: ['Plan meals for the week']
          }
        });
      }

      // Health-focused suggestions if no recent health tasks
      const hasHealthTasks = existingTaskTitles.some(task => 
        task.toLowerCase().includes('doctor') || 
        task.toLowerCase().includes('dental') ||
        task.toLowerCase().includes('workout')
      );

      if (!hasHealthTasks) {
        suggestions.push({
          title: 'Schedule annual checkup',
          category: 'health',
          priority: 'high',
          duration: '60',
          confidence: 0.8,
          reason: 'Important health maintenance',
          autoFillData: {
            recommendedTime: '10:00',
            preparationTasks: ['Check insurance coverage', 'Gather medical history'],
            followUpTasks: ['Schedule any recommended follow-ups']
          }
        });
      }

      setSmartSuggestions(suggestions.slice(0, 3));
    } catch (error) {
      console.error('Error generating contextual suggestions:', error);
    }
  };

  const parseAdvancedNaturalLanguage = (text: string): ParsedTaskData => {
    const cleanText = text.trim();
    
    // Enhanced time parsing
    let startTime: string | undefined;
    let dueDate: Date | undefined;
    
    // Parse time (2pm, 14:00, 2:30pm, etc.)
    const timeMatch = cleanText.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridian = timeMatch[3]?.toLowerCase();
      
      if (meridian === 'pm' && hours < 12) hours += 12;
      if (meridian === 'am' && hours === 12) hours = 0;
      
      startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // Parse date (today, tomorrow, monday, next week, etc.)
    const now = new Date();
    dueDate = new Date(now);
    
    if (/\btoday\b/i.test(cleanText)) {
      dueDate = new Date(now);
    } else if (/\btomorrow\b/i.test(cleanText)) {
      dueDate.setDate(now.getDate() + 1);
    } else if (/\bnext week\b/i.test(cleanText)) {
      dueDate.setDate(now.getDate() + 7);
    } else {
      // Parse specific days (monday, tuesday, etc.)
      const dayMatch = cleanText.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
      if (dayMatch) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDay = days.indexOf(dayMatch[1].toLowerCase());
        const currentDay = now.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence
        dueDate.setDate(now.getDate() + daysToAdd);
      }
    }

    // Enhanced priority detection
    let priority: Task['priority'] | undefined;
    if (/\b(urgent|asap|emergency|critical|important|high priority|rush)\b/i.test(cleanText)) {
      priority = 'high';
    } else if (/\b(low priority|minor|when free|eventually|someday|optional)\b/i.test(cleanText)) {
      priority = 'low';
    } else if (/\b(medium|normal|regular|standard)\b/i.test(cleanText)) {
      priority = 'medium';
    }

    // Enhanced location detection
    let location: string | undefined;
    const locationPatterns = [
      /\b(?:at|in|@)\s+([^,.\n]+?)(?:\s+(?:today|tomorrow|by|on|at\s+\d)|\s*[,.\n]|$)/i,
      /\blocation:?\s*([^,.\n]+)/i,
      /\bplace:?\s*([^,.\n]+)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        location = match[1].trim();
        break;
      }
    }

    // Enhanced duration detection
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

    // Enhanced category detection with context
    let category: string | undefined;
    
    // Medical keywords
    if (/\b(doctor|dentist|medical|health|appointment|checkup|physical|vaccine|therapy|prescription)\b/i.test(cleanText)) {
      category = categories.find(c => c.name.toLowerCase() === 'health')?.name;
    }
    // Fitness keywords
    else if (/\b(gym|workout|exercise|fitness|run|yoga|sport|training)\b/i.test(cleanText)) {
      category = categories.find(c => c.name.toLowerCase() === 'fitness')?.name;
    }
    // Work keywords
    else if (/\b(meeting|work|office|client|project|presentation|interview|business)\b/i.test(cleanText)) {
      category = categories.find(c => c.name.toLowerCase() === 'work')?.name;
    }
    // Shopping keywords
    else if (/\b(buy|shop|grocery|store|purchase|pick up|mall)\b/i.test(cleanText)) {
      category = categories.find(c => c.name.toLowerCase() === 'shopping')?.name;
    }
    // Travel keywords
    else if (/\b(flight|airport|hotel|vacation|trip|travel|booking)\b/i.test(cleanText)) {
      category = categories.find(c => c.name.toLowerCase() === 'travel')?.name;
    }

    // Clean the title by removing extracted information
    let title = cleanText
      .replace(/\b(urgent|asap|emergency|critical|important|high|low|minor|when\s+free|eventually|someday|medium|normal|regular)\b/gi, '')
      .replace(/\b(?:at|in|@)\s+[^,.\n]+/gi, '')
      .replace(/\b\d+\s*(min|minute|minutes|hour|hours|h)\b/gi, '')
      .replace(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week)\b/gi, '')
      .replace(/\d{1,2}:?\d{0,2}\s*(am|pm)?/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return {
      title: title || cleanText,
      category,
      priority,
      location,
      duration,
      startTime,
      dueDate: startTime ? dueDate : undefined
    };
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

    // Merge with advanced natural language parsing
    const parsed = parseAdvancedNaturalLanguage(text);
    
    const finalPredictions = {
      category: parsed.category || predicted.category,
      priority: parsed.priority || predicted.priority,
      location: parsed.location || predicted.location,
      duration: parsed.duration,
      startTime: parsed.startTime,
      dueDate: parsed.dueDate
    };

    setPredictions(finalPredictions);
    setShowPredictions(Object.values(finalPredictions).some(Boolean));
  };

  useEffect(() => {
    if (hasAppliedPredictions) return;
    
    const timeoutId = setTimeout(() => {
      generatePredictions(input);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [input, hasAppliedPredictions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    setHasAppliedPredictions(false);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showAISuggestions && aiSuggestions.length > 0) {
        // Populate form with AI suggestion for editing (don't create immediately)
        addTaskFromAISuggestion(aiSuggestions[selectedSuggestionIndex], false);
      } else if (input.trim()) {
        // Always allow manual task creation when user types and presses Enter
        handleApplyPredictions();
      }
    } else if (e.key === 'ArrowDown' && showAISuggestions && aiSuggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev + 1) % aiSuggestions.length);
    } else if (e.key === 'ArrowUp' && showAISuggestions && aiSuggestions.length > 0) {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => (prev - 1 + aiSuggestions.length) % aiSuggestions.length);
    } else if (e.key === 'Escape') {
      setShowAISuggestions(false);
      setAiSuggestions([]);
      setShowPredictions(false);
    }
  };

  const addTaskFromAISuggestion = (suggestion: AdvancedAITaskSuggestion, shouldCreateImmediately = false) => {
    if (shouldCreateImmediately) {
      // Direct creation (when clicking on suggestion)
      const taskData = {
        title: suggestion.title,
        category: suggestion.category,
        priority: suggestion.priority,
        location: suggestion.location,
        duration: suggestion.duration,
        startTime: suggestion.autoFillData?.recommendedTime || suggestion.startTime,
        dueDate: suggestion.suggestedDate,
        isAISuggested: true,
        aiCategory: suggestion.category
      };

      console.log('Creating task from AI suggestion:', taskData);
      onTaskCreate(taskData);
      
      // Clear states
      setInput('');
      setShowAISuggestions(false);
      setAiSuggestions([]);
      setHasAppliedPredictions(true);
      
      if (onChange) {
        onChange('');
      }
    } else {
      // Populate form fields for editing (when pressing Enter)
      setInput(suggestion.title);
      
      // Set predictions from AI suggestion
      setPredictions({
        category: suggestion.category,
        priority: suggestion.priority,
        location: suggestion.location,
        duration: suggestion.duration,
        startTime: suggestion.autoFillData?.recommendedTime || suggestion.startTime,
        dueDate: suggestion.suggestedDate
      });
      
      setShowPredictions(true);
      setShowAISuggestions(false);
      setAiSuggestions([]);
      
      if (onChange) {
        onChange(suggestion.title);
      }
      
      console.log('Populated form from AI suggestion:', suggestion);
    }
  };

  const addSmartSuggestion = (suggestion: AdvancedAITaskSuggestion) => {
    addTaskFromAISuggestion(suggestion, true); // Create immediately for contextual suggestions
    setSmartSuggestions(prev => prev.filter(s => s.title !== suggestion.title));
  };

  const handleApplyPredictions = () => {
    const parsed = parseAdvancedNaturalLanguage(input);
    
    const taskData = {
      title: parsed.title || input.trim(), // Ensure we always have a title
      category: predictions.category || parsed.category,
      priority: predictions.priority || parsed.priority,
      location: predictions.location || parsed.location,
      duration: predictions.duration || parsed.duration,
      startTime: predictions.startTime || parsed.startTime,
      dueDate: predictions.dueDate || parsed.dueDate
    };

    console.log('Creating manual task:', taskData); // Debug log
    onTaskCreate(taskData);
    
    // Clear all states
    setInput('');
    setHasAppliedPredictions(true);
    setPredictions({});
    setShowPredictions(false);
    setShowAISuggestions(false);
    
    if (onChange) {
      onChange('');
    }
  };

  const removePrediction = (type: 'category' | 'priority' | 'location' | 'duration' | 'startTime' | 'dueDate') => {
    setPredictions(prev => ({
      ...prev,
      [type]: undefined
    }));
    
    const updatedPredictions = { ...predictions, [type]: undefined };
    setShowPredictions(Object.values(updatedPredictions).some(Boolean));
  };

  return (
    <div className="space-y-2">
      {/* Contextual Smart Suggestions */}
      {smartSuggestions.length > 0 && !input.trim() && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">AI Suggestions for You</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {smartSuggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => addSmartSuggestion(suggestion)}
                  className="h-8 text-xs border-purple-200 hover:bg-purple-100 flex items-center gap-1"
                >
                  <span>{getTaskAIIcon(suggestion.category, suggestion.title)}</span>
                  <span>{suggestion.title}</span>
                  {suggestion.autoFillData?.recommendedTime && (
                    <Clock className="h-3 w-3 text-purple-500" />
                  )}
                  <Wand2 className="h-3 w-3 text-purple-500" />
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
        
        {/* Advanced AI Suggestions Dropdown */}
        {showAISuggestions && (
          <Card className="absolute z-50 w-full mt-1 border-purple-200 shadow-xl bg-white">
            <CardContent className="p-0">
              {isLoadingSuggestions ? (
                <div className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600">
                    <Zap className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">AI analyzing your request...</span>
                  </div>
                </div>
              ) : aiSuggestions.length > 0 ? (
                <div>
                  <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <div className="text-xs text-purple-700 font-medium flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Smart AI Suggestions • ↵ to select • ↑↓ to navigate
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {aiSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => addTaskFromAISuggestion(suggestion, true)} // Create immediately when clicked
                        className={`w-full text-left p-4 hover:bg-purple-50 transition-colors flex items-start justify-between group border-b border-gray-100 last:border-b-0 ${
                          idx === selectedSuggestionIndex ? 'bg-purple-100 border-l-4 border-l-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl mt-1">{getTaskAIIcon(suggestion.category, suggestion.title)}</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 mb-1">
                              {suggestion.title}
                            </div>
                            <div className="text-xs text-purple-600 mb-2">
                              {suggestion.reason}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {suggestion.category}
                              </Badge>
                              {suggestion.duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{suggestion.duration}min</span>
                                </div>
                              )}
                              {suggestion.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{suggestion.location}</span>
                                </div>
                              )}
                              {suggestion.autoFillData?.recommendedTime && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  <span>{suggestion.autoFillData.recommendedTime}</span>
                                </div>
                              )}
                            </div>
                            {suggestion.autoFillData?.preparationTasks && suggestion.autoFillData.preparationTasks.length > 0 && (
                              <div className="mt-2 text-xs text-gray-400">
                                <span className="font-medium">AI will help with:</span> {suggestion.autoFillData.preparationTasks.slice(0, 2).join(', ')}
                                {suggestion.autoFillData.preparationTasks.length > 2 && '...'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {idx === selectedSuggestionIndex && (
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
                      Press ↵ to select • Use ↑↓ arrows to navigate • Esc to close
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

      {/* Enhanced Predictions Display */}
      {showPredictions && !hasAppliedPredictions && !showAISuggestions && (
        <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-md border border-blue-200">
          <div className="text-xs text-blue-700 font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Auto-detected:
          </div>
          
          {predictions.category && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-300">
              <span className="mr-1">📁</span>
              {predictions.category}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-red-200"
                onClick={() => removePrediction('category')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {predictions.priority && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-300">
              <span className="mr-1">
                {predictions.priority === 'high' ? '🔴' : 
                 predictions.priority === 'medium' ? '🟡' : '🟢'}
              </span>
              {predictions.priority} priority
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-red-200"
                onClick={() => removePrediction('priority')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {predictions.startTime && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-300">
              <Clock className="h-3 w-3 mr-1" />
              {predictions.startTime}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-red-200"
                onClick={() => removePrediction('startTime')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {predictions.dueDate && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-300">
              <span className="mr-1">📅</span>
              {predictions.dueDate.toLocaleDateString()}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-red-200"
                onClick={() => removePrediction('dueDate')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {predictions.location && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-300">
              <MapPin className="h-3 w-3 mr-1" />
              {predictions.location}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-red-200"
                onClick={() => removePrediction('location')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {predictions.duration && (
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 border-blue-300">
              <span className="mr-1">⏱️</span>
              {predictions.duration}min
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-red-200"
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

// Export both named and default exports for flexibility
export default SuperSmartTaskInput;

// Also export with the expected name for compatibility
export { SuperSmartTaskInput as SmartTaskInput };