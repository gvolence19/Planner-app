import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Edit2, Trash2, FileText, Clock } from 'lucide-react';
import { TaskTemplate } from '@/types/project';
import { TaskCategory } from '@/types';

interface TaskTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: TaskTemplate[];
  onTemplatesChange: (templates: TaskTemplate[]) => void;
  categories: TaskCategory[];
  isPremium: boolean;
}

export default function TaskTemplateManager({ 
  open, 
  onOpenChange, 
  templates, 
  onTemplatesChange,
  categories,
  isPremium
}: TaskTemplateManagerProps) {
  const [templateName, setTemplateName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('none'); // ✅ Changed from '' to 'none'
  const [tags, setTags] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);

  if (!isPremium) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Task Templates (Premium Feature)</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Save frequently used task setups as templates for quick task creation.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Upgrade to Premium
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleAddTemplate = () => {
    if (!templateName.trim() || !taskTitle.trim()) return;
    
    const newTemplate: TaskTemplate = {
      id: Date.now().toString(),
      name: templateName.trim(),
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      priority,
      category: category === 'none' ? undefined : category, // ✅ Handle 'none' value
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()) : undefined,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
      createdAt: new Date()
    };
    
    if (editIndex !== null) {
      const updatedTemplates = [...templates];
      updatedTemplates[editIndex] = { ...newTemplate, id: templates[editIndex].id };
      onTemplatesChange(updatedTemplates);
      setEditIndex(null);
    } else {
      onTemplatesChange([...templates, newTemplate]);
    }
    
    resetForm();
  };

  const handleDeleteTemplate = (index: number) => {
    const updatedTemplates = [...templates];
    updatedTemplates.splice(index, 1);
    onTemplatesChange(updatedTemplates);
    
    if (editIndex === index) {
      resetForm();
    }
  };

  const handleEditTemplate = (index: number) => {
    const template = templates[index];
    setTemplateName(template.name);
    setTaskTitle(template.title);
    setTaskDescription(template.description || '');
    setPriority(template.priority);
    setCategory(template.category || 'none'); // ✅ Use 'none' instead of ''
    setTags(template.tags?.join(', ') || '');
    setEstimatedDuration(template.estimatedDuration?.toString() || '');
    setEditIndex(index);
  };

  const resetForm = () => {
    setTemplateName('');
    setTaskTitle('');
    setTaskDescription('');
    setPriority('medium');
    setCategory('none'); // ✅ Use 'none' instead of ''
    setTags('');
    setEstimatedDuration('');
    setEditIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Task Templates</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Weekly Team Meeting"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="taskTitle">Task Title</Label>
            <Input
              id="taskTitle"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Enter default task title"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="taskDescription">Description (Optional)</Label>
            <Textarea
              id="taskDescription"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Enter default task description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem> {/* ✅ Changed from "" to "none" */}
                  {categories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${cat.color} mr-2`} />
                        {cat.icon && <span className="mr-1">{cat.icon}</span>}
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="urgent, weekly, team"
              />
            </div>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="estimatedDuration">Duration (minutes)</Label>
              <Input
                id="estimatedDuration"
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="60"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAddTemplate} 
              className="flex-1"
            >
              {editIndex !== null ? (
                <Edit2 className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {editIndex !== null ? 'Update Template' : 'Save Template'}
            </Button>
            {editIndex !== null && (
              <Button variant="outline" onClick={resetForm}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <div className="font-medium p-2 bg-muted">
            Your Templates
          </div>
          <div className="divide-y">
            {templates.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No templates yet. Create your first template above.
              </div>
            ) : (
              templates.map((template, index) => (
                <div key={template.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-muted-foreground mr-3" />
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.title}
                        {template.estimatedDuration && (
                          <span className="ml-2 inline-flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {template.estimatedDuration}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditTemplate(index)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteTemplate(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}