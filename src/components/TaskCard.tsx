import React from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Circle, Edit, Trash2, MapPin, Calendar, Clock, ArrowUpRight } from 'lucide-react'

import { Task, TaskCategory } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import LocationDisplay from './LocationDisplay'

interface TaskCardProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  categories: TaskCategory[]
  className?: string
}

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
  
  return (
    <Card className={cn(
      "group overflow-hidden border-l-4 transition-all duration-300 hover:translate-y-[-2px]",
      task.completed && "opacity-75 border-l-gray-300 dark:border-l-gray-600",
      !task.completed && category?.color && `border-l-[${category.color}]`,
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
              <h3 className={cn(
                "font-medium text-sm sm:text-base leading-tight truncate transition-all duration-300",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              
              {task.priority && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "ml-auto text-[10px] sm:text-xs capitalize whitespace-nowrap px-1.5 py-0 sm:px-2 sm:py-0.5", 
                    priorityColor
                  )}
                >
                  {task.priority}
                </Badge>
              )}
            </div>
            
            {task.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-2 sm:mt-3 text-[10px] sm:text-xs text-muted-foreground">
              {task.dueDate && (
                <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                  {!task.dueTime && new Date(task.dueDate).getHours() === 0 && new Date(task.dueDate).getMinutes() === 0 ? null : (
                    <>
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-0.5 sm:ml-1" />
                      <span>{format(new Date(task.dueDate), 'h:mm a')}</span>
                    </>
                  )}
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
                  {task.category}
                </Badge>
              )}
              
              {task.recurring && task.recurring !== 'none' && (
                <Badge variant="outline" className="rounded-full text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                  {task.recurring}
                </Badge>
              )}
            </div>
            
            {task.location && (
              <div className="mt-2 sm:mt-3 text-xs">
                <LocationDisplay location={task.location} showMap={false} />
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
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-1"
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
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-1 text-destructive hover:text-destructive"
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
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-1 text-primary hover:text-primary"
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