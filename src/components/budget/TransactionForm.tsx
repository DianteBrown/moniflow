import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@/services/categoryService";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { CategoryIconComponent } from "@/components/icons/CategoryIcons";

interface TransactionFormData {
  amount: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
}

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  initialData?: TransactionFormData;
  categories?: Category[];
  isSubmitting?: boolean;
}

export default function TransactionForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  categories = [],
  isSubmitting = false
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>(
    initialData || {
      amount: "",
      type: "expense",
      category: "",
      description: "",
      date: new Date()
    }
  );
  const [dateInput, setDateInput] = useState(formData.date ? format(formData.date, "yyyy-MM-dd") : "");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      onSubmit(formData);
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInput(value);
    
    // Try to parse the date
    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(parsedDate)) {
      setFormData({ ...formData, date: parsedDate });
    }
  };

  // Filter categories by type
  const filteredCategories = (categories || []).filter(
    (cat) => cat.type === formData.type || cat.type === 'both'
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value: 'income' | 'expense') => 
            setFormData({ ...formData, type: value })
          }
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="pl-7"
            placeholder="0.00"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1 rounded-md border bg-muted/30">
          {filteredCategories.length === 0 && (
            <span className="text-muted-foreground text-sm col-span-3 sm:col-span-4">No categories available</span>
          )}
          {filteredCategories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`flex flex-col items-center p-2 rounded-md border transition-colors focus:outline-none ${
                formData.category === category.id
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:bg-muted"
              }`}
              onClick={() => setFormData({ ...formData, category: category.id })}
              disabled={isSubmitting}
            >
              <CategoryIconComponent iconId={category.icon || "shopping-cart"} size={28} style={{ color: category.color || "#0047AB" }} />
              <span className="text-xs mt-1 text-center truncate w-16">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <div className="relative">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateInput}
                onChange={handleDateInputChange}
                className="w-full"
                disabled={isSubmitting}
              />
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("px-3")}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
            </div>
            <PopoverContent 
              className="p-0" 
              align="end"
              side="bottom"
              sideOffset={5}
            >
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => {
                  if (date) {
                    setFormData({ ...formData, date });
                    setDateInput(format(date, "yyyy-MM-dd"));
                    setIsCalendarOpen(false);
                  }
                }}
                initialFocus
                disabled={isSubmitting}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!formData.amount || !formData.category || isSubmitting}
          className={cn(
            formData.type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700',
            'min-w-[120px]'
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <>{initialData ? 'Update' : 'Add'} {formData.type === 'income' ? 'Income' : 'Expense'}</>
          )}
        </Button>
      </div>
    </form>
  );
} 