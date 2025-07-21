import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Settings, Edit2, Trash2 } from 'lucide-react';
import { TaskCategory } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  { name: 'Rose', value: 'bg-rose-500' },
  { name: 'Gray', value: 'bg-gray-500' },
  { name: 'Slate', value: 'bg-slate-500' },
];

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: TaskCategory[];
  onCategoriesChange: (categories: TaskCategory[]) => void;
}

export default function CategoryManager({ 
  open, 
  onOpenChange, 
  categories, 
  onCategoriesChange 
}: CategoryManagerProps) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].value);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleAddCategory = () => {
    if (!categoryName.trim()) return;
    
    const newCategory = {
      name: categoryName.trim(),
      color: selectedColor
    };
    
    if (editIndex !== null) {
      // Edit existing category
      const updatedCategories = [...categories];
      updatedCategories[editIndex] = newCategory;
      onCategoriesChange(updatedCategories);
      setEditIndex(null);
    } else {
      // Add new category
      onCategoriesChange([...categories, newCategory]);
    }
    
    resetForm();
  };

  const handleDeleteCategory = (index: number) => {
    const updatedCategories = [...categories];
    updatedCategories.splice(index, 1);
    onCategoriesChange(updatedCategories);
    
    // If we're currently editing this category, reset the form
    if (editIndex === index) {
      resetForm();
    }
  };

  const handleEditCategory = (index: number) => {
    const category = categories[index];
    setCategoryName(category.name);
    setSelectedColor(category.color);
    setEditIndex(index);
  };

  const resetForm = () => {
    setCategoryName('');
    setSelectedColor(PRESET_COLORS[0].value);
    setEditIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
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
              onClick={handleAddCategory} 
              className="flex-1"
            >
              {editIndex !== null ? (
                <Edit2 className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {editIndex !== null ? 'Update Category' : 'Add Category'}
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
            Your Categories
          </div>
          <div className="divide-y">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No custom categories yet. Add your first category above.
              </div>
            ) : (
              categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${category.color} mr-2`} />
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditCategory(index)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteCategory(index)}
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