import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFormData {
  name: string;
  color: string;
}

interface CategoryFormProps {
  isEdit?: boolean;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  initialData?: CategoryFormData;
}

const CategoryForm = memo(({ 
  isEdit = false, 
  onSubmit, 
  onCancel,
  initialData 
}: CategoryFormProps) => {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || {
      name: "",
      color: "#0047AB" // Default color - cobalt blue
    }
  );

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
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
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!formData.name}>
          {isEdit ? "Update" : "Add"} Category
        </Button>
      </div>
    </div>
  );
});

CategoryForm.displayName = "CategoryForm";

export type { CategoryFormData };
export default CategoryForm; 