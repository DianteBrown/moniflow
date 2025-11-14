import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import { Transaction } from "@/services/transactionService";
import { Category } from "@/services/categoryService";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryIconComponent } from "@/components/icons/CategoryIcons";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  isRefreshing?: boolean;
  onAddClick: () => void;
  onEditClick: (transaction: Transaction) => void;
  onDeleteClick: (transaction: Transaction) => void;
}

const TransactionSkeleton = () => (
  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800">
    <div className="flex items-start gap-3">
      <Skeleton className="w-3 h-3 rounded-full mt-1.5" />
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <Skeleton className="h-5 w-20" />
      <div className="flex gap-1">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);

export default function TransactionList({
  transactions,
  categories,
  loading,
  isRefreshing = false,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: TransactionListProps) {

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return (category?.icon && category.icon.trim() !== '') ? category.icon : 'shopping-cart';
  };

  const getFilteredTransactions = () => {
    return transactions;
  };

  const filteredAndSortedTransactions = getFilteredTransactions();


  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <p className="text-sm text-muted-foreground">
            View and manage all your financial transactions
          </p>
        </div>
        <div> </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onAddClick}
            size="sm"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 h-9 rounded-lg transition-all flex-1 sm:flex-none"
          >
            <div className="flex items-center justify-center">
              <div className="p-1 rounded-full bg-green-500/20 dark:bg-green-500/30">
                <PlusCircle className="h-3.5 w-3.5" />
              </div>
              <span className="ml-1.5 font-medium">Add</span>
            </div>
          </Button>
        </div>
      </div>
      <Card>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <TransactionSkeleton key={i} />
              ))}
            </div>
          ) : filteredAndSortedTransactions.length === 0 ? (
            <div className="text-center py-4">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="sync" initial={false}>
                {filteredAndSortedTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800 hover:bg-muted/50 transition-colors group"
                    style={{ overflow: "hidden" }}
                  >
                    <div className="flex items-start gap-3">
                      <CategoryIconComponent
                        iconId={getCategoryIcon(transaction.category_id)}
                        size={20}
                        className="mt-1.5 flex-shrink-0"
                        style={{ color: getCategoryColor(transaction.category_id) }}
                      />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{getCategoryName(transaction.category_id)}</span>
                          <span>•</span>
                          <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <motion.p
                        className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                          }`}
                        animate={{ opacity: isRefreshing ? 0.5 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                      </motion.p>
                      <div className="flex gap-1">
                        {transaction.is_manual_created && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:opacity-80"
                              style={{color: 'var(--heritage-green)'}}
                              onClick={() => onEditClick(transaction)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => onDeleteClick(transaction)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 