import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Edit2, Trash2, Tag } from "lucide-react";
import { Category } from "@/services/categoryService";
import { toast } from "sonner";
import DeleteCategoryDialog from "./DeleteCategoryDialog";
import CategoryForm, { CategoryFormData } from "./CategoryForm";
import { CategoryIconComponent } from "@/components/icons/CategoryIcons";
import { useAddCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/queries/useCategories";

interface CategoryPanelProps {
  show: boolean;
  onToggle: () => void;
  categories: Category[];
}

interface ModalState {
  type: 'add' | 'edit' | 'delete' | null;
  category?: Category | null;
  isLoading?: boolean;
  error?: string;
}

export default function CategoryPanel({
  show,
  onToggle,
  categories,
}: CategoryPanelProps) {
  const [modalState, setModalState] = useState<ModalState>({ type: null, isLoading: false });

  // React Query mutation hooks
  const addCategoryMutation = useAddCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

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
      await addCategoryMutation.mutateAsync(formData);
      toast.success("Category added successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to add category");
      console.error("Error adding category:", error);
    }
  }, [addCategoryMutation, closeModal]);

  const handleUpdateCategory = useCallback(async (formData: CategoryFormData) => {
    if (!modalState.category) return;
    
    try {
      await updateCategoryMutation.mutateAsync({
        id: modalState.category.id,
        data: formData
      });
      toast.success("Category updated successfully");
      closeModal();
    } catch (error) {
      toast.error("Failed to update category");
      console.error("Error updating category:", error);
    }
  }, [modalState.category, updateCategoryMutation, closeModal]);

  const handleDeleteCategory = useCallback(async () => {
    const category = modalState.category;
    if (!category) return;
    
    if (category.is_default) {
      toast.error("Default categories cannot be deleted");
      return;
    }
    
    try {
      setModalState(prev => ({ ...prev, isLoading: true, error: undefined }));
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success("Category deleted successfully");
      closeModal();
    } catch (error: unknown) {
      // Check for the specific error message
      const errorMessage = typeof error === 'object' && error !== null
        ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
          || (error as Error)?.message
        : "Failed to delete category";
      setModalState(prev => ({ 
        ...prev, 
        error: errorMessage
      }));
    } finally {
      setModalState(prev => ({ ...prev, isLoading: false }));
    }
  }, [modalState.category, deleteCategoryMutation, closeModal]);

  const sortedCategories = useMemo(() => {
    return [...categories]
      .filter(cat => !cat.is_default) // Exclude default categories
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const expenseCategories = useMemo(() => {
    return sortedCategories.filter(cat => cat.type === 'expense' || cat.type === 'both');
  }, [sortedCategories]);

  const incomeCategories = useMemo(() => {
    return sortedCategories.filter(cat => cat.type === 'income' || cat.type === 'both');
  }, [sortedCategories]);

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
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold mb-2">Expense Categories</h4>
              <div className="flex flex-wrap gap-4">
                {expenseCategories.length === 0 && <span className="text-muted-foreground text-sm">No expense categories</span>}
                {expenseCategories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center border rounded-lg dark:border-gray-800 hover:bg-muted/50 transition-colors group w-full sm:w-auto"
                  >
                    <div className="flex items-center gap-3 p-3 flex-1 sm:flex-initial">
                      <CategoryIconComponent 
                        iconId={category.icon || "shopping-cart"} 
                        size={22} 
                        className="flex-shrink-0" 
                        style={{ color: category.color || "#0047AB" }}
                      />
                      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <span className="font-medium truncate sm:truncate-none sm:whitespace-nowrap">{category.name}</span>
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-2">Income Categories</h4>
              <div className="flex flex-wrap gap-4">
                {incomeCategories.length === 0 && <span className="text-muted-foreground text-sm">No income categories</span>}
                {incomeCategories.map((category) => (
                  <div 
                    key={category.id} 
                    className="flex items-center border rounded-lg dark:border-gray-800 hover:bg-muted/50 transition-colors group w-full sm:w-auto"
                  >
                    <div className="flex items-center gap-3 p-3 flex-1 sm:flex-initial">
                      <CategoryIconComponent 
                        iconId={category.icon || "shopping-cart"} 
                        size={22} 
                        className="flex-shrink-0" 
                        style={{ color: category.color || "#0047AB" }}
                      />
                      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <span className="font-medium truncate sm:truncate-none sm:whitespace-nowrap">{category.name}</span>
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Category Modal */}
      {(modalState.type === 'add' || modalState.type === 'edit') && (
        <Dialog open={true} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{modalState.type === 'add' ? 'Add Category' : 'Edit Category'}</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={modalState.type === 'add' ? handleAddCategory : handleUpdateCategory}
              onCancel={closeModal}
              initialData={modalState.type === 'edit' && modalState.category ? {
                name: modalState.category.name,
                type: modalState.category.type,
                color: modalState.category.color,
                icon: modalState.category.icon
              } : undefined}
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
          isLoading={!!modalState.isLoading}
          error={modalState.error}
        />
      )}
    </>
  );
} 