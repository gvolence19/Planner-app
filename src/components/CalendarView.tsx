import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, RepeatIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Task, TaskCategory } from '@/types';
import { Badge } from '@/components/ui/badge';
import EditTaskDialog from './EditTaskDialog';
import NewTaskDialog from './NewTaskDialog';

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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Adjust the start day of the week (0 = Sunday, 1 = Monday, etc.)
  const startDay = getDay(monthStart);
  const blankDays = Array.from({ length: startDay }, (_, i) => i);
  
  const nextMonth = () => {
    setCurrentMonth(addDays(monthEnd, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(addDays(monthStart, -1));
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day);
    });
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-500'; // Default color for tasks with no category
    const categoryInfo = categories.find(c => c.name === category);
    return categoryInfo ? categoryInfo.color : 'bg-gray-500';
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
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-1">
        {/* Empty cells for days before the first day of the month */}
        {blankDays.map(day => (
          <div key={`blank-${day}`} className="h-24 border rounded-md bg-muted/20 p-1" />
        ))}

        {/* Actual days of the month */}
        {monthDays.map(day => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toString()} 
              className={`h-24 border rounded-md p-1 overflow-y-auto cursor-pointer ${
                isToday ? 'border-primary border-2' : 'border-border'
              }`}
              onDoubleClick={() => handleDayDoubleClick(day)}
            >
              <div className="text-right text-sm font-medium">
                {format(day, 'd')}
              </div>
              
              <div className="mt-1 space-y-1">
                {dayTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`
                      inline-flex items-center rounded-full border font-semibold 
                      transition-colors focus:outline-none focus:ring-2 
                      focus:ring-ring focus:ring-offset-2 text-xs w-full 
                      justify-start text-left px-1.5 py-0.5 cursor-pointer truncate
                      ${task.completed ? 'line-through opacity-50' : ''}
                      ${getCategoryColor(task.category)} text-white
                    `}
                    onClick={() => setSelectedTask(task)}
                  >
                    {task.recurring && task.recurring !== 'none' && (
                      <RepeatIcon className="h-3 w-3 mr-1 inline" />
                    )}
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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