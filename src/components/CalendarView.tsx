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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
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
              className="text-gray-500 hover:text-gray-700"
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
      
      {/* List View of Events and Tasks for Selected Date (iOS Calendar style) */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-medium mb-3">
          {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : "Today's Schedule"}
        </h3>
        <div className="space-y-2">
          {selectedDate && getEventsForDate(selectedDate).map((event) => (
            <div 
              key={event.id} 
              className="flex items-start gap-3 p-2 rounded-md border hover:bg-muted/20 cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              <div 
                className="w-1 self-stretch rounded-full" 
                style={{ backgroundColor: event.color || '#3b82f6' }}
              ></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{event.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {event.allDay ? 'All day' : event.startTime ? format(new Date(event.startTime), 'h:mm a') : ''} 
                  {event.endTime && !event.allDay ? ` - ${format(new Date(event.endTime), 'h:mm a')}` : ''}
                </p>
                {event.location && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {event.location}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {selectedDate && getTasksForDay(selectedDate).map((task) => (
            <div 
              key={task.id} 
              className="flex items-start gap-3 p-2 rounded-md border hover:bg-muted/20 cursor-pointer"
              onClick={() => setSelectedTask(task)}
            >
              <div 
                className="w-1 self-stretch rounded-full" 
                style={{ backgroundColor: getCategoryColor(task.category).replace('bg-', '') }}
              ></div>
              <div 
                className="cursor-pointer mt-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  const updatedTask = {...task, completed: !task.completed};
                  onUpdateTask(updatedTask);
                }}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center 
                  ${task.completed ? 'bg-green-500 text-white' : 'border border-gray-400'}`}>
                  {task.completed && <span className="text-[8px]">✓</span>}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h4>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(task.dueDate), 'h:mm a')}
                  </p>
                )}
                {task.location && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {typeof task.location === 'string' ? task.location : task.location.description}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {selectedDate && getEventsForDate(selectedDate).length === 0 && getTasksForDay(selectedDate).length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No events or tasks scheduled for {isSameDay(selectedDate, new Date()) ? "today" : format(selectedDate, 'MMM d')}
            </div>
          )}
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