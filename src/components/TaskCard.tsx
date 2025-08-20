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
      return location.displayName || 
             location.name || 
             location.address || 
             location.title || 
             location.description ||
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
      {showMap && location?.placeId && (
        <a 
          href={`https://www.google.com/maps/place/?q=place_id:${location.placeId}`}
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
      "task-card group relative overflow-hidden border-0 shadow-md hover:shadow-xl",
      task.completed && "task-card-completed",
      // Modern gradient border based on priority
      !task.completed && task.priority === 'high' && "border-l-4 border-l-red-400",
      !task.completed && task.priority === 'medium' && "border-l-4 border-l-yellow-400", 
      !task.completed && task.priority === 'low' && "border-l-4 border-l-green-400",
      !task.completed && !task.priority && category?.color && `border-l-4 border-l-[${category.color}]`,
      // AI task modern styling
      isAISuggested && "bg-gradient-to-r from-purple-50/80 via-white to-pink-50/80 border-purple-200 dark:from-purple-900/30 dark:via-card dark:to-pink-900/30 dark:border-purple-700",
      className
    )}>
      {/* Completion Status Indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full transition-all duration-300",
        task.completed ? "bg-green-500" : category?.color ? `bg-[${category.color}]` : "bg-muted"
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
                ? "text-green-600 border-green-300 bg-green-50 hover:bg-green-100" 
                : "text-muted-foreground border-muted-foreground/30 hover:text-primary hover:border-primary hover:bg-primary/5"
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
                  <div className="badge-modern bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                    <Sparkles className="h-3 w-3 mr-1" />
                    <span className="text-xs font-semibold">AI</span>
                  </div>
                )}
              </div>
              
              {/* Priority Badge */}
              {task.priority && (
                <div className={cn(
                  "badge-modern shrink-0",
                  task.priority === 'high' && "badge-priority-high",
                  task.priority === 'medium' && "badge-priority-medium", 
                  task.priority === 'low' && "badge-priority-low"
                )}>
                  {task.priority}
                </div>
              )}
            </div>
            
            {/* Description */}
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed ml-10">
                {task.description}
              </p>
            )}
            
            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground ml-10">
              {/* Date and time */}
              {task.dueDate && (
                <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-full">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  {task.startTime && (
                    <>
                      <Clock className="h-4 w-4 ml-1" />
                      <span>{task.startTime}</span>
                    </>
                  )}
                </div>
              )}

              {/* Duration */}
              {task.duration && (
                <div className="flex items-center gap-1.5 bg-muted/30 px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span>{task.duration}min</span>
                </div>
              )}
              
              {/* Category with Icon */}
              {task.category && (
                <div className={cn(
                  "badge-modern flex items-center gap-1.5",
                  category?.color && `bg-[${category.color}]/10 text-[${category.color}] border-[${category.color}]/30`
                )}>
                  {category?.icon && (
                    <span className="text-sm">{category.icon}</span>
                  )}
                  <span>{typeof task.category === 'string' ? task.category : task.category?.name || 'Unknown'}</span>
                </div>
              )}
              
              {/* Recurring indicator */}
              {task.recurring && task.recurring !== 'none' && (
                <div className="badge-modern bg-blue-100 text-blue-800 border-blue-200">
                  <span className="mr-1">🔄</span>
                  {task.recurring}
                </div>
              )}
            </div>
            
            {/* Location */}
            {task.location && (
              <div className="mt-3 ml-10">
                <SafeLocationDisplay location={task.location} showMap={false} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Modern Action Buttons */}
      <CardFooter className="px-4 py-3 bg-muted/20 border-t border-muted/30">
        <div className="flex justify-end gap-2 ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="btn-modern h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                onClick={() => onEdit(task)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit task</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="btn-modern h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete task</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete task</TooltipContent>
          </Tooltip>
          
          {task.location?.placeId && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="btn-modern h-8 w-8 p-0 text-primary hover:text-primary hover:bg-green-50"
                >
                  <a 
                    href={`https://www.google.com/maps/place/?q=place_id:${task.location.placeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="sr-only">View on map</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View on Google Maps</TooltipContent>
            </Tooltip>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}