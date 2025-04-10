import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash } from "lucide-react";
import { categoryService, Category } from "@/services/categoryService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#0047AB" // Default color - cobalt blue
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({ name: "", color: "#0047AB" });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      color: category.color || "#0047AB"
    });
    setIsEditModalOpen(true);
  };

  const handleAddCategory = async () => {
    try {
      const newCategory = await categoryService.createCategory(formData);
      setCategories(prev => [...prev, newCategory]);
      toast.success("Category added successfully");
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error("Failed to add category");
      console.error("Error adding category:", error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!currentCategory) return;
    
    try {
      const updatedCategory = await categoryService.updateCategory(currentCategory.id, formData);
      setCategories(prev => prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
      toast.success("Category updated successfully");
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("Failed to update category");
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        await categoryService.deleteCategory(id);
        setCategories(prev => prev.filter(cat => cat.id !== id));
        toast.success("Category deleted successfully");
      } catch (error) {
        toast.error("Failed to delete category");
        console.error("Error deleting category:", error);
      }
    }
  };

  const CategoryForm = ({ isEdit = false, onSubmit }: { isEdit?: boolean, onSubmit: () => void }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Groceries, Utilities, etc."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="color">Category Color</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-12 h-9 p-1"
          />
          <span className="text-sm">{formData.color}</span>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          variant="outline" 
          onClick={() => isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false)}
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!formData.name}>
          {isEdit ? "Update" : "Add"} Category
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleOpenAddModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No categories found</p>
          <Button onClick={handleOpenAddModal}>Add Your First Category</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="border dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: category.color || "#0047AB" }} 
                  />
                  {category.name}
                </CardTitle>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!category.is_default && (
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.is_default ? "Default Category" : "Custom Category"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Category Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <CategoryForm onSubmit={handleAddCategory} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm isEdit onSubmit={handleUpdateCategory} />
        </DialogContent>
      </Dialog>
    </div>
  );
} 