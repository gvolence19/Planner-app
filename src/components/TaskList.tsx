import { useState } from "react";
import { ChevronDown, ChevronUp, ListFilter } from "lucide-react";
import { Task, TaskCategory } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import EditTaskDialog from "./EditTaskDialog";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  categories: TaskCategory[];
}

export default function TaskList({
  tasks,
  onUpdateTask,
  onDeleteTask,
  categories,
}: TaskListProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(
    undefined
  );
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "createdAt">(
    "dueDate"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Task to be edited
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Filter by completion status
    if (filter === "completed" && !task.completed) return false;
    if (filter === "pending" && task.completed) return false;

    // Filter by category
    if (categoryFilter && task.category !== categoryFilter) return false;

    // Filter by priority
    if (priorityFilter && task.priority !== priorityFilter) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(query);
      const descMatch = task.description
        ? task.description.toLowerCase().includes(query)
        : false;
      const locationMatch = task.location?.displayName
        ? task.location.displayName.toLowerCase().includes(query)
        : false;
      
      if (!titleMatch && !descMatch && !locationMatch) return false;
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Always show incomplete tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    switch (sortBy) {
      case "dueDate": {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        
        const dateComparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return sortDirection === "asc" ? dateComparison : -dateComparison;
      }
        
      case "priority": {
        const priorityValue = { high: 3, medium: 2, low: 1, undefined: 0 };
        const aValue = priorityValue[a.priority as keyof typeof priorityValue] || 0;
        const bValue = priorityValue[b.priority as keyof typeof priorityValue] || 0;
        
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
        
      case "createdAt":
        return sortDirection === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          
      default:
        return 0;
    }
  });

  const toggleComplete = (task: Task) => {
    onUpdateTask({
      ...task,
      completed: !task.completed,
    });
  };

  const handleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <ListFilter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("pending")}>
                Pending Tasks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("completed")}>
                Completed Tasks
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setCategoryFilter(undefined)}>
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.name}
                  onClick={() => setCategoryFilter(category.name)}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setPriorityFilter(undefined)}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("high")}>
                High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("medium")}>
                Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("low")}>
                Low Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as "dueDate" | "priority" | "createdAt")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="createdAt">Created</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSortDirection}
            className="h-9 w-9"
          >
            {sortDirection === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        {filter !== "all" && (
          <span>
            Status: <span className="font-medium capitalize">{filter}</span>
          </span>
        )}
        
        {categoryFilter && (
          <span>
            Category:{" "}
            <span className="font-medium">{categoryFilter}</span>
          </span>
        )}
        
        {priorityFilter && (
          <span>
            Priority:{" "}
            <span className="font-medium capitalize">{priorityFilter}</span>
          </span>
        )}
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={toggleComplete}
              onEdit={setTaskToEdit}
              onDelete={onDeleteTask}
              categories={categories}
            />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No tasks found.</p>
            {(filter !== "all" || categoryFilter || priorityFilter || searchQuery) && (
              <p className="text-sm text-muted-foreground mt-1">
                Try changing your filters.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Task Dialog */}
      {taskToEdit && (
        <EditTaskDialog
          task={taskToEdit}
          open={!!taskToEdit}
          onOpenChange={(isOpen) => {
            if (!isOpen) setTaskToEdit(null);
          }}
          onUpdateTask={onUpdateTask}
          categories={categories}
        />
      )}
    </div>
  );
}