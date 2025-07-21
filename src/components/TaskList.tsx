import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { Task, TaskCategory } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EditTaskDialog from './EditTaskDialog';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  categories: TaskCategory[];
}

export default function TaskList({ tasks, onUpdateTask, onDeleteTask, categories }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleTaskCompletion = (id: string, completed: boolean) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      onUpdateTask({
        ...taskToUpdate,
        completed
      });
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const priorityInfo = [
      { value: 'low', label: 'Low', color: 'bg-blue-500' },
      { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
      { value: 'high', label: 'High', color: 'bg-red-500' },
    ].find(p => p.value === priority);
    
    return (
      <Badge 
        className={`${priorityInfo?.color} text-white`} 
        variant="outline"
      >
        {priority === 'high' && <AlertTriangle className="mr-1 h-3 w-3" />}
        {priorityInfo?.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    const categoryInfo = categories.find(c => c.name === category);
    return categoryInfo ? (
      <Badge className={`${categoryInfo.color} text-white`} variant="outline">
        {category}
      </Badge>
    ) : null;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion status (incomplete first)
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    // Then by priority (high to low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    // Then by due date (if available)
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    // Finally by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tasks yet. Add a task to get started.</p>
        </div>
      ) : (
        sortedTasks.map(task => (
          <Card key={task.id} className={`${task.completed ? 'opacity-70' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={task.completed} 
                  onCheckedChange={(checked) => handleTaskCompletion(task.id, checked === true)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    {getPriorityBadge(task.priority)}
                    {getCategoryBadge(task.category)}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 break-words">
                      {task.description}
                    </p>
                  )}
                  
                  {task.dueDate && (
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => setEditingTask(task)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onDeleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {editingTask && (
        <EditTaskDialog 
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => {
            if (!open) setEditingTask(null);
          }}
          onUpdateTask={onUpdateTask}
          categories={categories}
        />
      )}
    </div>
  );
}