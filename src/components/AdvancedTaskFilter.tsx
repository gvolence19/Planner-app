import { useState, useEffect } from 'react';
import { Calendar, X, Filter, Check, Search, MapPin, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { TaskFilter } from '@/types/project';
import { TaskCategory, Priority } from '@/types';
import { Project } from '@/types/project';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface AdvancedTaskFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  categories: TaskCategory[];
  projects: Project[];
  isPremium: boolean;
}

export default function AdvancedTaskFilter({
  open,
  onOpenChange,
  filter,
  onFilterChange,
  categories,
  projects,
  isPremium
}: AdvancedTaskFilterProps) {
  const [localFilter, setLocalFilter] = useState<TaskFilter>(filter);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLocalFilter(filter);
  }, [filter]);

  const handleApplyFilter = () => {
    onFilterChange(localFilter);
    onOpenChange(false);
  };

  const handleClearFilter = () => {
    const emptyFilter: TaskFilter = {};
    setLocalFilter(emptyFilter);
    onFilterChange(emptyFilter);
    setSearchTerm('');
  };

  const handleCategoryToggle = (categoryName: string) => {
    const categories = localFilter.categories || [];
    const updatedCategories = categories.includes(categoryName)
      ? categories.filter(c => c !== categoryName)
      : [...categories, categoryName];
    
    setLocalFilter({
      ...localFilter,
      categories: updatedCategories.length > 0 ? updatedCategories : undefined
    });
  };

  const handlePriorityToggle = (priority: Priority) => {
    const priorities = localFilter.priorities || [];
    const updatedPriorities = priorities.includes(priority)
      ? priorities.filter(p => p !== priority)
      : [...priorities, priority];
    
    setLocalFilter({
      ...localFilter,
      priorities: updatedPriorities.length > 0 ? updatedPriorities : undefined
    });
  };

  const handleProjectToggle = (projectId: string) => {
    if (!isPremium) return; // Premium feature guard
    
    const projectIds = localFilter.projects || [];
    const updatedProjects = projectIds.includes(projectId)
      ? projectIds.filter(p => p !== projectId)
      : [...projectIds, projectId];
    
    setLocalFilter({
      ...localFilter,
      projects: updatedProjects.length > 0 ? updatedProjects : undefined
    });
  };

  const handleDateRangeChange = (dateRange: DateRange | undefined) => {
    setLocalFilter({
      ...localFilter,
      dateRange: dateRange?.from && dateRange?.to ? {
        start: dateRange.from,
        end: dateRange.to
      } : undefined
    });
  };

  const handleTagsChange = (tags: string) => {
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setLocalFilter({
      ...localFilter,
      tags: tagArray.length > 0 ? tagArray : undefined
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilter.categories?.length) count++;
    if (localFilter.priorities?.length) count++;
    if (localFilter.projects?.length) count++;
    if (localFilter.dateRange) count++;
    if (localFilter.completed !== undefined) count++;
    if (localFilter.overdue !== undefined) count++;
    if (localFilter.hasLocation !== undefined) count++;
    if (localFilter.tags?.length) count++;
    return count;
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Categories & Projects</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categories Filter */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Categories</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                {filteredCategories.map((category) => (
                  <div key={category.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.name}`}
                      checked={localFilter.categories?.includes(category.name) || false}
                      onCheckedChange={() => handleCategoryToggle(category.name)}
                    />
                    <label
                      htmlFor={`category-${category.name}`}
                      className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    </label>
                  </div>
                ))}
              </div>
              {localFilter.categories?.length && (
                <div className="flex flex-wrap gap-1">
                  {localFilter.categories.map((categoryName) => (
                    <Badge key={categoryName} variant="secondary" className="text-xs">
                      {categoryName}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handleCategoryToggle(categoryName)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Filter */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Priority</Label>
              <div className="space-y-2">
                {[
                  { value: 'high' as Priority, label: 'High', color: 'text-red-600', icon: '🔴' },
                  { value: 'medium' as Priority, label: 'Medium', color: 'text-yellow-600', icon: '🟡' },
                  { value: 'low' as Priority, label: 'Low', color: 'text-blue-600', icon: '🔵' }
                ].map((priority) => (
                  <div key={priority.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority.value}`}
                      checked={localFilter.priorities?.includes(priority.value) || false}
                      onCheckedChange={() => handlePriorityToggle(priority.value)}
                    />
                    <label
                      htmlFor={`priority-${priority.value}`}
                      className={`flex items-center gap-2 cursor-pointer flex-1 text-sm ${priority.color}`}
                    >
                      <span>{priority.icon}</span>
                      <span>{priority.label}</span>
                    </label>
                  </div>
                ))}
              </div>
              {localFilter.priorities?.length && (
                <div className="flex flex-wrap gap-1">
                  {localFilter.priorities.map((priority) => (
                    <Badge key={priority} variant="secondary" className="text-xs">
                      {priority}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handlePriorityToggle(priority)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Projects Filter (Premium) */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                Projects
                {!isPremium && (
                  <Badge variant="outline" className="text-xs">Premium</Badge>
                )}
              </Label>
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                {!isPremium ? (
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Premium to filter by projects
                  </p>
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={localFilter.projects?.includes(project.id) || false}
                        onCheckedChange={() => handleProjectToggle(project.id)}
                      />
                      <label
                        htmlFor={`project-${project.id}`}
                        className="flex items-center gap-2 cursor-pointer flex-1 text-sm"
                      >
                        <span>{project.icon || '📁'}</span>
                        <span>{project.name}</span>
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: project.color }} />
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No projects available
                  </p>
                )}
              </div>
              {localFilter.projects?.length && isPremium && (
                <div className="flex flex-wrap gap-1">
                  {localFilter.projects.map((projectId) => {
                    const project = projects.find(p => p.id === projectId);
                    return project ? (
                      <Badge key={projectId} variant="secondary" className="text-xs">
                        {project.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                          onClick={() => handleProjectToggle(projectId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Task Status</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed-true"
                    checked={localFilter.completed === true}
                    onCheckedChange={(checked) => 
                      setLocalFilter({
                        ...localFilter,
                        completed: checked ? true : undefined
                      })
                    }
                  />
                  <label htmlFor="completed-true" className="text-sm cursor-pointer flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Completed tasks only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completed-false"
                    checked={localFilter.completed === false}
                    onCheckedChange={(checked) => 
                      setLocalFilter({
                        ...localFilter,
                        completed: checked ? false : undefined
                      })
                    }
                  />
                  <label htmlFor="completed-false" className="text-sm cursor-pointer flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Pending tasks only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdue"
                    checked={localFilter.overdue === true}
                    onCheckedChange={(checked) => 
                      setLocalFilter({
                        ...localFilter,
                        overdue: checked ? true : undefined
                      })
                    }
                  />
                  <label htmlFor="overdue" className="text-sm cursor-pointer flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    Overdue tasks only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-location"
                    checked={localFilter.hasLocation === true}
                    onCheckedChange={(checked) => 
                      setLocalFilter({
                        ...localFilter,
                        hasLocation: checked ? true : undefined
                      })
                    }
                  />
                  <label htmlFor="has-location" className="text-sm cursor-pointer flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    Tasks with location
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Date Range</Label>
            <div className="flex items-center gap-4">
              <DatePickerWithRange
                value={{
                  from: localFilter.dateRange?.start,
                  to: localFilter.dateRange?.end
                }}
                onSelect={handleDateRangeChange}
                placeholder="Select date range"
              />
              {localFilter.dateRange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocalFilter({ ...localFilter, dateRange: undefined })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {localFilter.dateRange && (
              <p className="text-sm text-muted-foreground">
                From {format(localFilter.dateRange.start, 'PPP')} to {format(localFilter.dateRange.end, 'PPP')}
              </p>
            )}
          </div>

          {/* Tags Filter */}
          <div className="space-y-3">
            <Label htmlFor="tags" className="text-base font-semibold">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="work, urgent, meeting..."
              value={localFilter.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
            />
            {localFilter.tags?.length && (
              <div className="flex flex-wrap gap-1">
                {localFilter.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleClearFilter}>
              Clear All Filters
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilter}>
                Apply Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}