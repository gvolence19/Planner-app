import React, { useState } from 'react';
import { format, addDays, addWeeks, startOfTomorrow, startOfToday, isAfter, isBefore, startOfDay } from 'date-fns';
import { Clock, Calendar, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MissedTasksRescheduleProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDismissMissed?: (taskIds: string[]) => void;
}

export default function MissedTasksReschedule({ 
  tasks, 
  onUpdateTask, 
  onDismissMissed 
}: MissedTasksRescheduleProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Find missed tasks (incomplete tasks with due dates in the past)
  const missedTasks = tasks.filter(task => {
    if (task.completed || dismissed.has(task.id)) return false;
    if (!task.dueDate) return false;
    
    const today = startOfToday();
    const taskDueDate = startOfDay(new Date(task.dueDate));
    
    return isBefore(taskDueDate, today);
  });

  if (missedTasks.length === 0) return null;

  const rescheduleTask = (task: Task, newDate: Date) => {
    const updatedTask = {
      ...task,
      dueDate: newDate,
    };
    onUpdateTask(updatedTask);
  };

  const rescheduleAllTasks = (newDate: Date) => {
    missedTasks.forEach(task => {
      rescheduleTask(task, newDate);
    });
  };

  const dismissTask = (taskId: string) => {
    setDismissed(prev => new Set(prev).add(taskId));
  };

  const dismissAll = () => {
    const taskIds = missedTasks.map(t => t.id);
    setDismissed(prev => {
      const newSet = new Set(prev);
      taskIds.forEach(id => newSet.add(id));
      return newSet;
    });
    onDismissMissed?.(taskIds);
  };

  const getQuickRescheduleOptions = () => [
    {
      label: 'Today',
      date: startOfToday(),
      icon: '📅'
    },
    {
      label: 'Tomorrow',
      date: startOfTomorrow(),
      icon: '⏰'
    },
    {
      label: 'Next Week',
      date: addWeeks(startOfToday(), 1),
      icon: '📆'
    },
    {
      label: 'In 3 Days',
      date: addDays(startOfToday(), 3),
      icon: '🗓️'
    }
  ];

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedMissedTasks = [...missedTasks].sort((a, b) => {
    // Sort by priority (high first), then by how overdue they are
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // Then by due date (most overdue first)
    return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
  });

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950 mb-6">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-orange-800 dark:text-orange-200">
                  {missedTasks.length} Missed Task{missedTasks.length !== 1 ? 's' : ''}
                </CardTitle>
                <Badge variant="outline" className="bg-orange-200 text-orange-800 border-orange-300">
                  Needs Attention
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* Quick reschedule all buttons */}
                <div className="hidden sm:flex gap-1">
                  {getQuickRescheduleOptions().slice(0, 2).map((option) => (
                    <Button
                      key={option.label}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs bg-white hover:bg-orange-100 border-orange-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        rescheduleAllTasks(option.date);
                      }}
                    >
                      {option.icon} {option.label}
                    </Button>
                  ))}
                </div>
                
                {/* More options dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 text-xs bg-white hover:bg-orange-100 border-orange-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Reschedule All
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {getQuickRescheduleOptions().map((option) => (
                      <DropdownMenuItem
                        key={option.label}
                        onClick={() => rescheduleAllTasks(option.date)}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {format(option.date, 'MMM d')}
                        </span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={dismissAll} className="text-muted-foreground">
                      <X className="h-4 w-4 mr-2" />
                      Dismiss All
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-orange-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-orange-600" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-2">
            {sortedMissedTasks.map((task) => {
              const daysOverdue = Math.floor(
                (startOfToday().getTime() - new Date(task.dueDate!).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      {task.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === 'high' ? 'border-red-300 text-red-700' :
                            task.priority === 'medium' ? 'border-amber-300 text-amber-700' :
                            'border-green-300 text-green-700'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>Due: {format(new Date(task.dueDate!), 'MMM d, yyyy')}</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        ({daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-3">
                    {/* Quick reschedule buttons for individual tasks */}
                    <div className="hidden sm:flex gap-1">
                      {getQuickRescheduleOptions().slice(0, 2).map((option) => (
                        <Button
                          key={option.label}
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs hover:bg-orange-100"
                          onClick={() => rescheduleTask(task, option.date)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                    
                    {/* More options for individual task */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-7 px-2 text-xs hover:bg-orange-100"
                        >
                          <Calendar className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {getQuickRescheduleOptions().map((option) => (
                          <DropdownMenuItem
                            key={option.label}
                            onClick={() => rescheduleTask(task, option.date)}
                          >
                            <span className="mr-2">{option.icon}</span>
                            {option.label}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {format(option.date, 'MMM d')}
                            </span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => dismissTask(task.id)}
                          className="text-muted-foreground"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Dismiss
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
            
            {missedTasks.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  💡 Tip: Use "Reschedule All" to quickly move all missed tasks to the same date
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}