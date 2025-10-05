import React from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Circle, Edit, Trash2, MapPin, Calendar, Clock, ArrowUpRight, Sparkles } from 'lucide-react'

import { Task, TaskCategory } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getFunTaskIcon, PRIORITY_ICONS } from '@/lib/taskIcons'

interface TaskCardProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  categories: TaskCategory[]
  className?: string
}

// Safe component to handle location display without causing React Error #31
const SafeLocationDisplay = ({ location, showMap = false }: { location: unknown; showMap?: boolean }) => {
  const displayText = React.useMemo(() => {
    if (!location) return '';
    
    if (typeof location === 'string') return location;
    
    if (typeof location === 'object' && location !== null) {
      return (location as any).displayName || 
             (location as any).name || 
             (location as any).address || 
             (location as any).title || 
             (location as any).description ||
             'Unknown location';
    }
    
    return String(location);
  }, [location]);

  if (!displayText) return null;

  return (
    <div className="flex items-center gap-1">
      <MapPin className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground truncate">
        {displayText}
      </span>
      {showMap && (location as any)?.placeId && (
        <a 
          href={`https://www.google.com/maps/place/?q=place_id:${(location as any).placeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1"
        >
          <ArrowUpRight className="h-3 w-3 text-muted-foreground hover:text-foreground" />
        </a>
      )}
    </div>
  );
};

export default function TaskCard({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete,
  categories,
  className
}: TaskCardProps) {
  const category = categories.find(c => c.name === task.category);
  const priorityColors = {
    high: "text-red-500 dark:text-red-400",
    medium: "text-amber-500 dark:text-amber-400",
    low: "text-green-500 dark:text-green-400",
  };
  
  const priorityColor = task.priority ? priorityColors[task.priority as keyof typeof priorityColors] : '';
  
  // Check if this is an AI-suggested task
  const isAISuggested = task.isAISuggested || task.aiCategory;
  
  // Get the fun icon for this task
  const taskIcon = getFunTaskIcon(task.title, task.category, task.priority);
  
  return (
    <Card className={cn(
      "task-card group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all",
      // KEY FIX: Add proper background colors for light and dark mode
      "bg-white dark:bg-gray-800",
      task.completed && "task-card-completed opacity-75",
      // Modern gradient border based on priority
      !task.completed && task.priority === 'high' && "border-l-4 border-l-red-400 dark:border-l-red-500",
      !task.completed && task.priority === 'medium' && "border-l-4 border-l-yellow-400 dark:border-l-yellow-500", 
      !task.completed && task.priority === 'low' && "border-l-4 border-l-green-400 dark:border-l-green-500",
      !task.completed && !task.priority && category?.color && `border-l-4 border-l-[${category.color}]`,
      // AI task modern styling with proper dark mode support
      isAISuggested && "bg-gradient-to-r from-purple-50/80 via-white to-pink-50/80 border-purple-200 dark:from-purple-900/20 dark:via-gray-800 dark:to-pink-900/20 dark:border-purple-700",
      className
    )}>
      {/* Completion Status Indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full transition-all duration-300",
        task.completed ? "bg-green-500 dark:bg-green-400" : category?.color ? `bg-[${category.color}]` : "bg-muted"
      )} />
      
      <CardContent className="p-4 sm:p-6 relative">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Enhanced Completion Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 rounded-full p-0 transition-all duration-300 border-2", 
              task.completed 
                ? "text-green-600 dark:text-green-400 border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50" 
                : "text-muted-foreground border-muted-foreground/30 hover:text-primary hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10"
            )}
            onClick={() => onToggleComplete(task)}
          >
            {task.completed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle completion</span>
          </Button>
          
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header with title and priority */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Task Icon with modern styling */}
                <div className="flex items-center gap-2 shrink-0">
                  <span 
                    className="text-2xl transition-transform duration-200 hover:scale-110" 
                    title={`Task: ${task.title}`}
                  >
                    {taskIcon}
                  </span>
                  
                  {/* Priority indicator */}
                  {task.priority && (
                    <span 
                      className="text-lg opacity-80" 
                      title={`${task.priority} priority`}
                    >
                      {PRIORITY_ICONS[task.priority as keyof typeof PRIORITY_ICONS]}
                    </span>
                  )}
                </div>
                
                <h3 className={cn(
                  "font-bold text-base sm:text-lg leading-tight transition-all duration-300",
                  "text-gray-900 dark:text-gray-100",
                  task.completed && "line-through text-muted-foreground opacity-70"
                )}>
                  {task.completed && "🎉 "}
                  {task.title}
                  {!task.completed && task.priority === 'high' && " ⚡"}
                  {!task.completed && task.priority === 'medium' && " 🔥"}
                  {!task.completed && task.priority === 'low' && " ✨"}
                </h3>
                
                {/* AI Badge with modern styling */}
                {isAISuggested && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                )}
              </div>
              
              {/* Priority Badge */}
              {task.priority && (
                <Badge className={cn(
                  "shrink-0 uppercase text-xs font-bold",
                  task.priority === 'high' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-700",
                  task.priority === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700", 
                  task.priority === 'low' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-700"
                )}>
                  {task.priority}
                </Badge>
              )}
            </div>
            
            {/* Description */}
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed ml-10">
                {task.description}
              </p>
            )}
            
            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 ml-10 text-xs text-muted-foreground">
              {/* Category */}
              {task.category && (
                <div className="flex items-center gap-1">
                  <span className="text-base">{category?.icon || '📁'}</span>
                  <span className="font-medium">{task.category}</span>
                </div>
              )}
              
              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              
              {/* Start Time */}
              {task.startTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.startTime}</span>
                </div>
              )}
              
              {/* Duration */}
              {task.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.duration} min</span>
                </div>
              )}
              
              {/* Location */}
              {task.location && (
                <SafeLocationDisplay location={task.location} showMap />
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Action Footer - only visible on hover */}
      <CardFooter className="p-3 border-t border-border/50 dark:border-border bg-gray-50/50 dark:bg-gray-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center justify-end gap-2 w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit task</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete task</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
}