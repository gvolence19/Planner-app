import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Edit2, Trash2, FolderOpen, Archive } from 'lucide-react';
import { Project } from '@/types/project';

const PRESET_COLORS = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Lime', value: 'bg-lime-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Sky', value: 'bg-sky-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Violet', value: 'bg-violet-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

interface ProjectManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  isPremium: boolean;
}

export default function ProjectManager({ 
  open, 
  onOpenChange, 
  projects, 
  onProjectsChange,
  isPremium
}: ProjectManagerProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  if (!isPremium) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Projects (Premium Feature)</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Project grouping is a premium feature that allows you to organize your tasks into projects.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              Upgrade to Premium
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleAddProject = () => {
    if (!projectName.trim()) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName.trim(),
      description: projectDescription.trim() || undefined,
      color: selectedColor,
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false
    };
    
    if (editIndex !== null) {
      const updatedProjects = [...projects];
      updatedProjects[editIndex] = { ...newProject, id: projects[editIndex].id };
      onProjectsChange(updatedProjects);
      setEditIndex(null);
    } else {
      onProjectsChange([...projects, newProject]);
    }
    
    resetForm();
  };

  const handleDeleteProject = (index: number) => {
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    onProjectsChange(updatedProjects);
    
    if (editIndex === index) {
      resetForm();
    }
  };

  const handleEditProject = (index: number) => {
    const project = projects[index];
    setProjectName(project.name);
    setProjectDescription(project.description || '');
    setSelectedColor(project.color);
    setEditIndex(index);
  };

  const resetForm = () => {
    setProjectName('');
    setProjectDescription('');
    setSelectedColor(PRESET_COLORS[0].value);
    setEditIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Projects</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="projectDescription">Description (Optional)</Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Select Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <div 
                  key={color.value}
                  className={`
                    w-8 h-8 rounded-full ${color.value} cursor-pointer 
                    border-2 ${selectedColor === color.value ? 'border-black dark:border-white' : 'border-transparent'}
                  `}
                  title={color.name}
                  onClick={() => setSelectedColor(color.value)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleAddProject} 
              className="flex-1"
            >
              {editIndex !== null ? (
                <Edit2 className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {editIndex !== null ? 'Update Project' : 'Add Project'}
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
            Your Projects
          </div>
          <div className="divide-y">
            {projects.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No projects yet. Add your first project above.
              </div>
            ) : (
              projects.map((project, index) => (
                <div key={project.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${project.color} mr-3`} />
                    <div>
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-muted-foreground">{project.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditProject(index)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteProject(index)}
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