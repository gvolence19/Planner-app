// src/components/CalendarView.tsx - Fixed JSX Syntax Errors
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, RepeatIcon, MapPin, CalendarClock, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task, TaskCategory, CalendarEvent } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EditTaskDialog from './EditTaskDialog';
import NewTaskDialog from './NewTaskDialog';
import CalendarSettings from './CalendarSettings';
import CalendarEventComponent from './CalendarEvent';
import LocationDisplay from './LocationDisplay';
import { useCalendarSync } from '@/hooks/use-calendar-sync';
import { formatCalendarDate, formatMonthYear } from '@/lib/date-utils';

interface CalendarViewProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Task) => void;
  categories: TaskCategory[];
}

// Calendar Event Detail Modal Component
const CalendarEventDetailModal = ({ event, open, onOpenChange }: {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!event) return null;

  const formatEventTime = () => {
    if (!event.startTime) return null;
    
    const start = new Date(event.startTime);
    const end = event.endTime ? new Date(event.endTime) : null;
    
    if (event.allDay) {
      return format(start, 'EEEE, MMMM d, yyyy');
    }
    
    const startFormat = format(start, 'EEEE, MMMM d, yyyy • h:mm a');
    if (end) {
      const endFormat = format(end, 'h:mm a');
      return `${startFormat} - ${endFormat}`;
    }
    
    return startFormat;
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${open ? 'block' : 'hidden'}`}>
      <div className="bg-background text-foreground rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto border">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div 
              className="w-1 h-6 rounded-full flex-shrink-0 mt-0.5" 
              style={{ backgroundColor: event.color || '#3b82f6' }}
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{event.title}</h2>
              {event.source && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {event.source === 'google' ? 'Google Calendar' : event.source}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-4">
            {/* Date and Time */}
            <div className="flex items-start gap-3">
              <CalendarClock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{formatEventTime()}</p>
                {event.allDay && (
                  <p className="text-sm text-muted-foreground">All day</p>
                )}
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground break-words">
                    {event.location}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 text-muted-foreground mt-0.5">📝</div>
                <div className="flex-1">
                  <p className="font-medium">Description</p>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {event.description}
                  </div>
                </div>
              </div>
            )}

            {/* External link */}
            {event.htmlLink && (
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open(event.htmlLink, '_blank', 'noopener,noreferrer')}
                >
                  Open in {event.source === 'google' ? 'Google Calendar' : 'External Calendar'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CalendarView({ tasks, onUpdateTask, onDeleteTask, onAddTask, categories }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  
  // Hook for calendar sync functionality
  const {
    calendarAccounts,
    calendarEvents,
    loading,
    syncErrors,
    lastSyncTime,
    addCalendarAccount,
    removeCalendarAccount,
    toggleCalendarVisibility,
    syncCalendar,
    forceRefresh,
    clearSyncError,
    getEventsForDate,
    hasErrors,
    visibleAccountsCount,
  } = useCalendarSync();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);
  const blankDays = Array.from({ length: startDay }, (_, i) => i);
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day);
    });
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-500';
    const categoryInfo = categories.find(c => c.name === category);
    return categoryInfo ? categoryInfo.color : 'bg-gray-500';
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const handleDayDoubleClick = (day: Date) => {
    setSelectedDate(day);
    setIsNewTaskDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  const handleForceRefresh = async () => {
    try {
      await forceRefresh();
    } catch (error) {
      console.error('Failed to refresh calendars:', error);
    }
  };

  return (
    <div>
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1 items-center">
          {/* Sync status and refresh button */}
          {visibleAccountsCount > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForceRefresh}
                disabled={loading}
                className="h-8 px-2"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {lastSyncTime && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs text-muted-foreground">
                      {format(lastSyncTime, 'HH:mm')}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Last synced: {format(lastSyncTime, 'MMM d, HH:mm')}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
          
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCalendarSettingsOpen(true)}
            aria-label="Calendar settings"
          >
            <CalendarClock className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sync errors display */}
      {hasErrors && (
        <div className="mb-4 space-y-2">
          {syncErrors.map((error) => {
            const account = calendarAccounts.find(acc => acc.id === error.accountId);
            return (
              <Alert key={error.accountId} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    {account?.email}: {error.message}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSyncError(error.accountId)}
                  >
                    ✕
                  </Button>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}

      {/* Calendar accounts indicator */}
      {calendarAccounts.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {calendarAccounts.filter(account => account.visible).map((account) => (
            <div 
              key={account.id}
              className="flex items-center text-xs gap-1 px-2 py-1 rounded-full border"
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: account.color }}
              />
              <span>{account.email}</span>
              {syncErrors.find(e => e.accountId === account.id) && (
                <AlertCircle className="h-3 w-3 text-red-500" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* iOS-style Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="py-1 font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-1">
        {/* Empty cells for days before the first day of the month */}
        {blankDays.map(day => (
          <div key={`blank-${day}`} className="aspect-square border-0 bg-transparent p-0.5" />
        ))}

        {/* Actual days of the month */}
        {monthDays.map(day => {
          const dayTasks = getTasksForDay(day);
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          const dayOfMonth = format(day, 'd');
          
          return (
            <div 
              key={day.toString()} 
              className={`aspect-square border-0 p-0.5 overflow-hidden cursor-pointer rounded-full transition-all`}
              onClick={() => handleDayClick(day)}
              onDoubleClick={() => handleDayDoubleClick(day)}
            >
              {/* iOS-style day cell */}
              <div className={`
                flex flex-col items-center h-full rounded-full relative
                ${isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/40'}
                ${selectedDate && isSameDay(day, selectedDate) && !isToday ? 'bg-muted ring-2 ring-primary' : ''}
              `}>
                {/* Day number in circle */}
                <div className={`
                  w-full aspect-square flex items-center justify-center text-center 
                  text-sm sm:text-base font-medium mb-0.5
                `}>
                  {dayOfMonth}
                </div>
                
                {/* Dots indicators for tasks and events (iOS style) */}
                <div className="flex items-center justify-center gap-0.5 absolute bottom-1.5">
                  {dayEvents.length > 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  )}
                  {dayTasks.length > 0 && (
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      dayTasks.some(t => t.completed === false) ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Timeline View Combining Tasks and Events */}
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">
            {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : "Today's Schedule"}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Events</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Tasks</span>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-green-200 rounded-full"></div>
          
          <div className="space-y-3">
            {(() => {
              // Combine and sort events and tasks by time
              const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];
              const selectedTasks = selectedDate ? getTasksForDay(selectedDate) : [];
              
              const timelineItems: Array<{
                type: 'event' | 'task';
                time: Date | null;
                item: CalendarEvent | Task;
                sortTime: number;
              }> = [];
              
              // Add events to timeline
              selectedEvents.forEach(event => {
                const eventTime = event.startTime ? new Date(event.startTime) : null;
                timelineItems.push({
                  type: 'event',
                  time: eventTime,
                  item: event,
                  sortTime: eventTime ? eventTime.getTime() : (event.allDay ? 0 : Number.MAX_SAFE_INTEGER)
                });
              });
              
              // Add tasks to timeline
              selectedTasks.forEach(task => {
                let taskTime = null;
                if (task.dueDate) {
                  const taskDate = new Date(task.dueDate);
                  
                  // If task has a startTime field (like "14:30"), combine it with the due date
                  if (task.startTime && task.startTime.trim()) {
                    const [hours, minutes] = task.startTime.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                      const combinedDateTime = new Date(taskDate);
                      combinedDateTime.setHours(hours, minutes, 0, 0);
                      taskTime = combinedDateTime;
                    }
                  } else {
                    // Check if the dueDate itself has time information
                    const dueDateStr = typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toString();
                    const hasSpecificTime = dueDateStr.includes('T') || 
                                           (taskDate.getHours() !== 0 || taskDate.getMinutes() !== 0);
                    taskTime = hasSpecificTime ? taskDate : null;
                  }
                }
                timelineItems.push({
                  type: 'task',
                  time: taskTime,
                  item: task,
                  sortTime: taskTime ? taskTime.getTime() : Number.MAX_SAFE_INTEGER
                });
              });
              
              // Sort by time (all-day events first, then timed items, then no-time items last)
              timelineItems.sort((a, b) => {
                const aIsAllDay = a.type === 'event' && (a.item as CalendarEvent).allDay;
                const bIsAllDay = b.type === 'event' && (b.item as CalendarEvent).allDay;
                const aHasNoTime = a.time === null;
                const bHasNoTime = b.time === null;
                
                // All-day events come first
                if (aIsAllDay && !bIsAllDay) return -1;
                if (bIsAllDay && !aIsAllDay) return 1;
                if (aIsAllDay && bIsAllDay) return 0;
                
                // Items with no time come last
                if (aHasNoTime && !bHasNoTime) return 1;
                if (bHasNoTime && !aHasNoTime) return -1;
                if (aHasNoTime && bHasNoTime) return 0;
                
                // Sort by time for items that have specific times
                return a.sortTime - b.sortTime;
              });
              
              if (timelineItems.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                      📅
                    </div>
                    No events or tasks scheduled for {selectedDate && isSameDay(selectedDate, new Date()) ? "today" : selectedDate ? format(selectedDate, 'MMM d') : 'this date'}
                  </div>
                );
              }
              
              return timelineItems.map((timelineItem, index) => {
                const { type, time, item } = timelineItem;
                const isEvent = type === 'event';
                const event = isEvent ? item as CalendarEvent : null;
                const task = !isEvent ? item as Task : null;
                
                return (
                  <div key={`${type}-${item.id}`} className="relative flex items-start gap-4 group">
                    {/* Timeline Node */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                        isEvent ? 'bg-blue-500' : task?.completed ? 'bg-green-500' : 'bg-orange-500'
                      } transition-transform group-hover:scale-110`}>
                      </div>
                    </div>
                    
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 text-right">
                      <div className="text-xs font-medium text-muted-foreground dark:text-white">
                        {time ? (
                          isEvent && event?.allDay ? (
                            <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                              ALL DAY
                            </span>
                          ) : (
                            format(time, 'h:mm a')
                          )
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                            {isEvent ? 'ALL DAY' : 'NO TIME'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 min-w-0 p-3 rounded-lg border transition-all cursor-pointer ${
                      isEvent 
                        ? 'bg-blue-50/50 border-blue-200/50 hover:bg-blue-100/50 dark:bg-blue-900/20 dark:border-blue-800/30 dark:hover:bg-blue-900/30' 
                        : task?.completed 
                          ? 'bg-green-50/50 border-green-200/50 hover:bg-green-100/50 opacity-75 dark:bg-green-900/20 dark:border-green-800/30 dark:hover:bg-green-900/30'
                          : 'bg-orange-50/50 border-orange-200/50 hover:bg-orange-100/50 dark:bg-orange-900/20 dark:border-orange-800/30 dark:hover:bg-orange-900/30'
                    }`}
                    onClick={() => {
                      if (isEvent && event) {
                        handleEventClick(event);
                      } else if (task) {
                        setSelectedTask(task);
                      }
                    }}>
                      <div className="flex items-start gap-3">
                        {/* Color indicator */}
                        <div 
                          className="w-1 h-12 rounded-full flex-shrink-0" 
                          style={{ 
                            backgroundColor: isEvent 
                              ? event?.color || '#3b82f6' 
                              : getCategoryColor(task?.category).includes('bg-') 
                                ? getCategoryColor(task?.category).replace('bg-', '#') 
                                : '#f59e0b'
                          }}
                        />
                        
                        {/* Task checkbox (for tasks only) */}
                        {task && (
                          <div 
                            className="cursor-pointer mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedTask = {...task, completed: !task.completed};
                              onUpdateTask(updatedTask);
                            }}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              task.completed 
                                ? 'bg-green-500 text-white shadow-sm' 
                                : 'border-2 border-gray-300 hover:border-green-400'
                            }`}>
                              {task.completed && <span className="text-xs">✓</span>}
                            </div>
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium text-sm leading-tight ${
                              task?.completed ? 'line-through text-muted-foreground dark:text-gray-400' : 'dark:text-white'
                            }`}>
                              {isEvent ? event?.title : task?.title}
                              {/* Fun emojis for tasks */}
                              {task && !task.completed && (
                                <span className="ml-2">
                                  {task.priority === 'high' ? '🔥' : task.priority === 'medium' ? '⚡' : '✨'}
                                </span>
                              )}
                              {task?.completed && <span className="ml-2">🎉</span>}
                            </h4>
                            
                            {/* Type badge */}
                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              isEvent 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}>
                              {isEvent ? 'EVENT' : 'TASK'}
                            </div>
                          </div>
                          
                          {/* Duration/Time info */}
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground dark:text-gray-300">
                            {isEvent && event && (
                              <>
                                {event.allDay ? (
                                  <span>All day event</span>
                                ) : event.endTime ? (
                                  <span>
                                    {event.startTime && event.endTime && 
                                      `${format(new Date(event.startTime), 'h:mm a')} - ${format(new Date(event.endTime), 'h:mm a')}`
                                    }
                                  </span>
                                ) : null}
                                {event.source && (
                                  <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                    {event.source === 'google' ? 'Google' : event.source}
                                  </Badge>
                                )}
                              </>
                            )}
                            
                            {task && (
                              <div className="flex items-center gap-2">
                                {task.priority && (
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {task.priority.toUpperCase()}
                                  </span>
                                )}
                                {task.category && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {task.category}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Location */}
                          {((isEvent && event?.location) || (task && task.location)) && (
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {isEvent 
                                  ? event?.location 
                                  : typeof task?.location === 'string' 
                                    ? task.location 
                                    : task?.location?.description
                                }
                              </span>
                            </div>
                          )}
                          
                          {/* Description preview */}
                          {((isEvent && event?.description) || (task && task.description)) && (
                            <div className="mt-2 text-xs text-muted-foreground dark:text-gray-300 line-clamp-2">
                              {isEvent ? event?.description : task?.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Calendar Settings Dialog */}
      <CalendarSettings
        open={isCalendarSettingsOpen}
        onOpenChange={setIsCalendarSettingsOpen}
        connectedCalendars={calendarAccounts}
        onAddCalendar={addCalendarAccount}
        onRemoveCalendar={removeCalendarAccount}
        onToggleCalendarVisibility={toggleCalendarVisibility}
        onSyncCalendar={syncCalendar}
      />

      {/* Event Detail Modal */}
      <CalendarEventDetailModal
        event={selectedEvent}
        open={isEventDetailOpen}
        onOpenChange={setIsEventDetailOpen}
      />

      {/* Task Dialogs */}
      {selectedTask && (
        <EditTaskDialog 
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => {
            if (!open) setSelectedTask(null);
          }}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          categories={categories}
        />
      )}

      <NewTaskDialog
        open={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        onAddTask={onAddTask}
        initialDate={selectedDate || undefined}
        categories={categories}
      />
    </div>
  );
}