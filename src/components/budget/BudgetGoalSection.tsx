import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CategoryIconComponent } from "@/components/icons/CategoryIcons";
import { format, addMonths, subMonths } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useBudgetGoals, 
  useSetBudget,
  useDeleteBudget,
  BudgetedCategory,
  UnbudgetedCategory 
} from "@/hooks/queries/useBudgetGoals";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Add new interface for the ModalState
interface ModalState {
  type: 'add' | 'edit' | 'delete' | null;
  category: (UnbudgetedCategory | BudgetedCategory) | null;
}

export default function BudgetGoalSection() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [modalState, setModalState] = useState<ModalState>({ type: null, category: null });
  const [budgetAmount, setBudgetAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyUpdated, setRecentlyUpdated] = useState<string | null>(null);
  
  // Compute modal state derived values
  const isModalOpen = modalState.type !== null;
  const selectedCategory = modalState.category;
  const isEditing = modalState.type === 'edit';

  // Query hook
  const { 
    data: categories = [],
    isLoading
  } = useBudgetGoals(selectedMonth);
  
  // Mutation hooks
  const setBudgetMutation = useSetBudget();
  const deleteBudgetMutation = useDeleteBudget();

  // Split categories into budgeted and unbudgeted
  const budgeted = categories
    .filter((cat): cat is BudgetedCategory => 
      cat.budget_status === 'budgeted'
    );
  
  const unbudgeted = categories
    .filter((cat): cat is UnbudgetedCategory => 
      cat.budget_status === 'unbudgeted'
    );

  const closeModal = () => {
    setModalState({ type: null, category: null });
    setBudgetAmount("");
  };

  const handleSetBudget = async () => {
    if (!selectedCategory || !budgetAmount || isNaN(Number(budgetAmount))) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    const amount = Number(budgetAmount);
    const monthStr = format(selectedMonth, 'yyyy-MM');
    
    try {
      // Optimistically update UI
      setRecentlyUpdated(selectedCategory.id);
      
      await setBudgetMutation.mutateAsync({
        categoryId: selectedCategory.id,
        amount,
        month: monthStr
      });
      
      toast.success(isEditing ? "Budget updated successfully" : "Budget set successfully");
      
      // Clear the animation after 2 seconds
      setTimeout(() => {
        setRecentlyUpdated(null);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = typeof error === 'object' && error !== null
        ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
          || "Failed to set budget"
        : "Failed to set budget";
      toast.error(isEditing ? `Failed to update budget: ${errorMessage}` : `Failed to set budget: ${errorMessage}`);
      setRecentlyUpdated(null);
    } finally {
      closeModal();
    }
  };

  const handleDeleteBudget = async (category: BudgetedCategory) => {
    if (!category) return;
    
    const monthStr = format(selectedMonth, 'yyyy-MM');
    
    try {
      setRecentlyUpdated(category.id);
      
      await deleteBudgetMutation.mutateAsync({
        categoryId: category.id,
        month: monthStr
      });
      
      toast.success("Budget removed successfully");
      
      // Clear the animation after 2 seconds
      setTimeout(() => {
        setRecentlyUpdated(null);
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = typeof error === 'object' && error !== null
        ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message
          || "Failed to remove budget"
        : "Failed to remove budget";
      toast.error(`Failed to remove budget: ${errorMessage}`);
      setRecentlyUpdated(null);
    }
  };

  const openBudgetModal = (category: UnbudgetedCategory) => {
    setModalState({ type: 'add', category });
    setBudgetAmount("");
  };

  const openEditBudgetModal = (category: BudgetedCategory) => {
    setModalState({ type: 'edit', category });
    setBudgetAmount(category.monthly_budget?.toString() || "0");
  };

  const openDeleteBudgetModal = (category: BudgetedCategory) => {
    // Instead of showing a dialog, directly handle the delete
    handleDeleteBudget(category);
  };

  const handlePrevMonth = () => setSelectedMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedMonth((prev) => addMonths(prev, 1));

  const totalBudget = budgeted.reduce((sum, cat) => sum + (cat.monthly_budget || 0), 0);
  const totalSpent = budgeted.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const totalProgress = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  const filteredBudgeted = budgeted.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUnbudgeted = unbudgeted.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Card className="border dark:border-gray-800 mb-8">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Budget Goals</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrevMonth}>&lt;</Button>
            <span className="font-medium text-base">{format(selectedMonth, "MMMM, yyyy")}</span>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>&gt;</Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Total Budget Summary */}
          <div className="mb-6 p-4 rounded-lg border dark:border-gray-800 bg-muted/30">
            <h4 className="font-semibold mb-3">Monthly Overview</h4>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
                <div className="text-lg font-semibold">${totalBudget.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Spent</div>
                <div className="text-lg font-semibold text-red-500">${totalSpent.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="text-lg font-semibold text-green-500">${totalRemaining.toFixed(2)}</div>
              </div>
            </div>
            <Progress value={totalProgress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2 text-right">
              {totalProgress.toFixed(1)}% of budget used
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Budgeted Categories */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Budgeted categories: {format(selectedMonth, "MMMM, yyyy")}</h4>
            {isLoading ? (
              <div>Loading...</div>
            ) : filteredBudgeted.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                {budgeted.length === 0 ? "No budgeted categories" : "No matching budgeted categories"}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBudgeted.map((cat) => {
                  const budget = cat.monthly_budget || 0;
                  const spent = cat.spent_amount || 0;
                  const remaining = budget - spent;
                  const percent = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
                  
                  return (
                    <div 
                      key={cat.id} 
                      className={cn(
                        "p-4 mb-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-background transition-all duration-500",
                        recentlyUpdated === cat.id && "border-green-500 shadow-lg shadow-green-500/20"
                      )}
                    >
                      {/* Header with category name and menu button */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-background p-2 border border-gray-200 dark:border-gray-800" style={{ backgroundColor: `${cat.color}20` }}>
                            <CategoryIconComponent iconId={cat.icon} size={24} style={{ color: cat.color }} />
                          </div>
                          <span className="font-semibold text-base">{cat.name}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 w-8 rounded-full p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditBudgetModal(cat)}>
                              Edit Budget
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-500" 
                              onClick={() => openDeleteBudgetModal(cat)}
                            >
                              Remove Budget
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Budget details in clear labels */}
                      <div className="space-y-1 mb-2">
                        <div className="flex items-center">
                          <span className="text-sm w-24 font-medium text-muted-foreground">Limit:</span>
                          <span className="text-base font-semibold">${budget.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm w-24 font-medium text-muted-foreground">Spent:</span>
                          <span className="text-base font-semibold text-red-500">${spent.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm w-24 font-medium text-muted-foreground">Remaining:</span>
                          <span className="text-base font-semibold text-green-500">${remaining.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                        <div
                          style={{ width: `${percent}%` }}
                          className={cn(
                            "h-full",
                            percent > 75 ? "bg-red-500" : 
                            percent > 50 ? "bg-orange-400" : 
                            "bg-green-500"
                          )}
                        />
                      </div>
                      
                      {/* Date indicator as shown in reference */}
                      <div className="flex justify-end">
                        <span className="text-xs text-muted-foreground">({format(selectedMonth, "MMMM, yyyy")})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Unbudgeted Categories */}
          <div>
            <h4 className="font-semibold mb-2">Not budgeted this month</h4>
            {isLoading ? (
              <div>Loading...</div>
            ) : filteredUnbudgeted.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                {unbudgeted.length === 0 ? "All categories have budgets" : "No matching unbudgeted categories"}
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                {filteredUnbudgeted.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3 p-4 mb-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-background">
                    <div className="rounded-full bg-background p-2 border border-gray-200 dark:border-gray-800" style={{ backgroundColor: `${cat.color}20` }}>
                      <CategoryIconComponent iconId={cat.icon} size={24} style={{ color: cat.color }} />
                    </div>
                    <span className="font-semibold flex-1">{cat.name}</span>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="h-9 w-28 border-gray-300 dark:border-gray-600 uppercase text-sm tracking-wide"
                      onClick={() => openBudgetModal(cat)}
                    >
                      Set Budget
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Setting Dialog */}
      {(modalState.type === 'add' || modalState.type === 'edit') && (
        <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Update Budget" : "Set Budget"}
              </DialogTitle>
            </DialogHeader>
            {selectedCategory && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4">
                  <CategoryIconComponent iconId={selectedCategory.icon} size={32} style={{ color: selectedCategory.color }} />
                  <span className="font-medium">{selectedCategory.name}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budgetAmount" className="text-right col-span-1">
                    Amount
                  </Label>
                  <div className="col-span-3 relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                    <Input
                      id="budgetAmount"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-8"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSetBudget} 
                disabled={setBudgetMutation.isPending || !budgetAmount || isNaN(Number(budgetAmount))}
              >
                {setBudgetMutation.isPending 
                  ? "Saving..." 
                  : isEditing 
                    ? "Update Budget" 
                    : "Set Budget"
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 