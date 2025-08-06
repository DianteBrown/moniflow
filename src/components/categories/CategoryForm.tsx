import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryIcons, CategoryIconComponent } from "@/components/icons/CategoryIcons";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense' | 'both';
}

interface CategoryFormProps {
  isEdit?: boolean;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  initialData?: CategoryFormData;
}

const DEFAULT_ICON = "shopping-cart";
const DEFAULT_TYPE = 'expense';

const CategoryForm = memo(({ 
  isEdit = false, 
  onSubmit, 
  onCancel,
  initialData 
}: CategoryFormProps) => {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || {
      name: "",
      color: "#0047AB", // Default color - cobalt blue
      icon: DEFAULT_ICON,
      type: DEFAULT_TYPE
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

      <div className="space-y-2">
        <Label>Category Icon</Label>
        <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 border rounded-md bg-muted/30">
          {categoryIcons.map((icon) => (
            <button
              type="button"
              key={icon.id}
              className={`flex flex-col items-center justify-center p-1 rounded-md border transition-colors focus:outline-none ${
                formData.icon === icon.id
                  ? "border-primary bg-primary/10"
                  : "border-transparent hover:bg-muted"
              }`}
              onClick={() => setFormData({ ...formData, icon: icon.id })}
              aria-label={icon.label}
            >
              <CategoryIconComponent iconId={icon.id} size={24} className="mb-1" />
              <span className="text-xs truncate w-12 text-center">{icon.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Category Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' | 'both' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
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