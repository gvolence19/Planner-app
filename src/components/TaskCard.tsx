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
const SafeLocationDisplay = ({ location, showMap = false }: { location: any; showMap?: boolean }) => {
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
      "group overflow-hidden border-l-4 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg",
      task.completed && "opacity-75 border-l-gray-300 dark:border-l-gray-600",
      !task.completed && category?.color && `border-l-[${category.color}]`,
      // AI task styling
      isAISuggested && "border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50",
      className
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 shrink-0 rounded-full p-0 transition-colors", 
              task.completed ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onToggleComplete(task)}
          >
            {task.completed ? (
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Circle className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="sr-only">Toggle completion</span>
          </Button>
          
          <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1 sm:gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Fun Task Icon - Enhanced */}
                <div className="flex items-center gap-1 shrink-0">
                  <span 
                    className="text-xl sm:text-2xl transition-transform hover:scale-110" 
                    title={`Task: ${task.title}`}
                  >
                    {taskIcon}
                  </span>
                  
                  {/* Priority indicator emoji */}
                  {task.priority && (
                    <span 
                      className="text-sm opacity-75" 
                      title={`${task.priority} priority`}
                    >
                      {PRIORITY_ICONS[task.priority as keyof typeof PRIORITY_ICONS]}
                    </span>
                  )}
                </div>
                
                <h3 className={cn(
                  "font-medium text-sm sm:text-base leading-tight transition-all duration-300",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                
                {/* AI Badge */}
                {isAISuggested && (
                  <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200 shrink-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              
              {task.priority && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-auto text-[10px] sm:text-xs capitalize whitespace-nowrap px-1.5 py-0 sm:px-2 sm:py-0.5 shrink-0", 
                    priorityColor
                  )}
                >
                  {task.priority}
                </Badge>
              )}
            </div>
            
            {task.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 ml-8">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground ml-8">
              {task.dueDate && (
                <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  {task.startTime && (
                    <>
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-0.5 sm:ml-1" />
                      <span>{task.startTime}</span>
                    </>
                  )}
                </div>
              )}

              {task.duration && (
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>{task.duration}min</span>
                </div>
              )}
              
              {task.category && (
                <Badge 
                  variant="outline"
                  className={cn(
                    "rounded-full text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5",
                    category?.color && `bg-opacity-10 bg-[${category.color}] border-[${category.color}] text-[${category.color}]`
                  )}
                >
                  {typeof task.category === 'string' ? task.category : task.category?.name || 'Unknown'}
                </Badge>
              )}
              
              {task.recurring && task.recurring !== 'none' && (
                <Badge variant="outline" className="rounded-full text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                  🔄 {task.recurring}
                </Badge>
              )}
            </div>
            
            {task.location && (
              <div className="mt-2 sm:mt-3 text-xs ml-8">
                <SafeLocationDisplay location={task.location} showMap={false} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-1 sm:p-2 pt-0">
        <div className="flex ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-1 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                onClick={() => onEdit(task)}
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
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
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-1 text-destructive hover:text-destructive hover:bg-red-50 transition-colors"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-1 text-primary hover:text-primary hover:bg-green-50 transition-colors"
                >
                  <a 
                    href={`https://www.google.com/maps/place/?q=place_id:${task.location.placeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
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