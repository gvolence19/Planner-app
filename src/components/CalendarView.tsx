import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, RepeatIcon, MapPin, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task, TaskCategory, CalendarEvent } from '@/types';
import { Badge } from '@/components/ui/badge';
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

export default function CalendarView({ tasks, onUpdateTask, onDeleteTask, onAddTask, categories }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Hook for calendar sync functionality
  const {
    calendarAccounts,
    calendarEvents,
    loading,
    addCalendarAccount,
    removeCalendarAccount,
    toggleCalendarVisibility,
    syncCalendar
  } = useCalendarSync();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Adjust the start day of the week (0 = Sunday, 1 = Monday, etc.)
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

  const getEventsForDay = (day: Date) => {
    return calendarEvents.filter(event => {
      // Handle all-day events
      if (event.allDay) {
        return event.startTime && isSameDay(new Date(event.startTime), day);
      }
      // Handle timed events
      return event.startTime && isSameDay(new Date(event.startTime), day);
    });
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-500'; // Default color for tasks with no category
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

  return (
    <div>
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
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
          const dayEvents = getEventsForDay(day);
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

              {/* Tasks list - we hide this in iOS style but leave code for future use */}
              <div className="hidden absolute z-10 bg-card shadow-lg rounded-md p-2 w-48 border">
                <div className="space-y-1">
                  {/* External Calendar Events */}
                  {dayEvents.map((event) => (
                    <CalendarEventComponent 
                      key={event.id} 
                      event={event} 
                      onClick={() => setSelectedEvent(event)} 
                    />
                  ))}
                  
                  {/* Tasks */}
                  {dayTasks.map(task => (
                    <TooltipProvider key={task.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center w-full gap-1">
                            <div 
                              className="cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedTask = {...task, completed: !task.completed};
                                onUpdateTask(updatedTask);
                              }}
                            >
                              <div className={`w-2.5 h-2.5 rounded-full ${task.completed ? 'bg-green-500' : 'border border-gray-400'}`} />
                            </div>
                            <div 
                              className={`
                                inline-flex items-center rounded-full border font-medium
                                text-[10px] sm:text-xs flex-1 truncate
                                justify-start text-left px-1.5 py-0.5 cursor-pointer
                                ${task.completed ? 'line-through opacity-50' : ''}
                                ${getCategoryColor(task.category)} text-white
                              `}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                              }}
                            >
                              {task.recurring && task.recurring !== 'none' && (
                                <RepeatIcon className="h-2.5 w-2.5 mr-0.5 inline" />
                              )}
                              {task.title}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="text-sm font-medium">{task.title}</div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                          )}
                          {task.location && (
                            <LocationDisplay location={task.location} />
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
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
          {selectedDate && getEventsForDay(selectedDate).map((event) => (
            <div 
              key={event.id} 
              className="flex items-start gap-3 p-2 rounded-md border hover:bg-muted/20"
              onClick={() => setSelectedEvent(event)}
            >
              <div 
                className="w-1 self-stretch rounded-full" 
                style={{ backgroundColor: event.color || '#3b82f6' }}
              ></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{event.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {event.startTime ? format(new Date(event.startTime), 'h:mm a') : ''} 
                  {event.endTime ? ` - ${format(new Date(event.endTime), 'h:mm a')}` : ''}
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
              className="flex items-start gap-3 p-2 rounded-md border hover:bg-muted/20"
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
                    {task.location.description || task.location}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {selectedDate && getEventsForDay(selectedDate).length === 0 && getTasksForDay(selectedDate).length === 0 && (
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