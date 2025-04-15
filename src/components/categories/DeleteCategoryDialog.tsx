import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Category } from "@/services/categoryService";
import { Loader2, AlertCircle } from "lucide-react";

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: Category;
  isLoading?: boolean;
  error?: string;
}

export default function DeleteCategoryDialog({
  isOpen,
  onClose,
  onConfirm,
  category,
  isLoading = false,
  error
}: DeleteCategoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this category? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Category:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }} 
                />
                <span className="font-medium">{category.name}</span>
              </div>
            </div>
            {category.is_default && (
              <div className="text-sm text-red-500 mt-2">
                Note: This is a default category and cannot be deleted.
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 p-3 mt-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={category.is_default || isLoading}
            className="min-w-[80px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 