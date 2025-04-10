import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Edit2, Trash2, Tag } from "lucide-react";
import { Category, categoryService } from "@/services/categoryService";
import { toast } from "sonner";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import CategoryForm, { CategoryFormData } from "./CategoryForm";

interface CategoryPanelProps {
  show: boolean;
  onToggle: () => void;
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

interface ModalState {
  type: 'add' | 'edit' | 'delete' | null;
  category?: Category | null;
  isLoading?: boolean;
}

export default function CategoryPanel({
  show,
  onToggle,
  categories,
  onCategoriesChange
}: CategoryPanelProps) {
  const [modalState, setModalState] = useState<ModalState>({ type: null, isLoading: false });

  const closeModal = useCallback(() => {
    setModalState({ type: null });
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setModalState({ type: 'add' });
  }, []);

  const handleOpenEditModal = useCallback((category: Category) => {
    setModalState({ type: 'edit', category });
  }, []);

  const handleOpenDeleteModal = useCallback((category: Category) => {
    setModalState({ type: 'delete', category });
  }, []);

  const handleAddCategory = useCallback(async (formData: CategoryFormData) => {
    try {
      const newCategory = await categoryService.createCategory(formData);
      onCategoriesChange([...categories, newCategory]);
      toast.success("Category added successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to add category");
      console.error("Error adding category:", error);
    }
  }, [categories, onCategoriesChange, closeModal]);

  const handleUpdateCategory = useCallback(async (formData: CategoryFormData) => {
    if (!modalState.category) return;
    
    try {
      const updatedCategory = await categoryService.updateCategory(modalState.category.id, formData);
      onCategoriesChange(
        categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      toast.success("Category updated successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to update category");
      console.error("Error updating category:", error);
    }
  }, [categories, modalState.category, onCategoriesChange, closeModal]);

  const handleDeleteCategory = useCallback(async () => {
    const category = modalState.category;
    if (!category) return;
    
    if (category.is_default) {
      toast.error("Default categories cannot be deleted");
      return;
    }
    
    try {
      setModalState(prev => ({ ...prev, isLoading: true }));
      await categoryService.deleteCategory(category.id);
      onCategoriesChange(categories.filter(cat => cat.id !== category.id));
      toast.success("Category deleted successfully");
      closeModal();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to delete category";
      toast.error(errorMessage);
      console.error("Error deleting category:", error);
    } finally {
      setModalState(prev => ({ ...prev, isLoading: false }));
    }
  }, [categories, modalState.category, onCategoriesChange, closeModal]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      // Default categories first, then alphabetically
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  if (!show) {
    return (
      <Button 
        onClick={onToggle} 
        variant="outline"
        className="w-full justify-center items-center h-10 rounded-lg transition-all"
        size="sm"
      >
        <div className="flex items-center">
          <div className="p-1 rounded-full bg-muted">
            <Tag className="h-3.5 w-3.5" />
          </div>
          <span className="ml-2 font-medium">Show Categories</span>
        </div>
      </Button>
    );
  }

  return (
    <>
      <Card className="border dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-4">
            <CardTitle>Categories</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onToggle}
            >
              Hide Categories
            </Button>
          </div>
          <Button 
            onClick={handleOpenAddModal} 
            size="sm"
            className="bg-primary/90 hover:bg-primary h-9 rounded-lg transition-all"
          >
            <div className="flex items-center">
              <div className="p-1 rounded-full bg-primary-foreground/20">
                <PlusCircle className="h-3.5 w-3.5" />
              </div>
              <span className="ml-1.5 font-medium">Add Category</span>
            </div>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {sortedCategories.map((category) => (
              <div 
                key={category.id} 
                className="flex items-center border rounded-lg dark:border-gray-800 hover:bg-muted/50 transition-colors group w-full sm:w-auto"
              >
                <div className="flex items-center gap-3 p-3 flex-1 sm:flex-initial">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: category.color || "#0047AB" }} 
                  />
                  <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                    <span className="font-medium truncate sm:truncate-none sm:whitespace-nowrap">{category.name}</span>
                    {category.is_default && (
                      <span className="text-xs py-0.5 px-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-sm whitespace-nowrap">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                {!category.is_default && (
                  <div className="flex gap-1 border-l dark:border-gray-800 ml-auto">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-full aspect-square text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-none" 
                      onClick={() => handleOpenEditModal(category)}
                      title="Edit category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-full aspect-square text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none"
                      onClick={() => handleOpenDeleteModal(category)}
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <Dialog open={modalState.type === 'add'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <CategoryForm 
            onSubmit={handleAddCategory}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Modal */}
      {modalState.type === 'edit' && modalState.category && (
        <Dialog open={true} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              isEdit 
              onSubmit={handleUpdateCategory}
              onCancel={closeModal}
              initialData={{
                name: modalState.category.name,
                color: modalState.category.color
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Category Dialog */}
      {modalState.type === 'delete' && modalState.category && (
        <DeleteCategoryDialog
          isOpen={true}
          onClose={closeModal}
          onConfirm={handleDeleteCategory}
          category={modalState.category}
          isLoading={modalState.isLoading}
        />
      )}
    </>
  );
} 