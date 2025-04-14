import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { Transaction, transactionService, TransactionSummary } from "@/services/transactionService";
import { Category, categoryService } from "@/services/categoryService";
import { toast } from "sonner";
import SpendingChart from "@/components/visualizations/SpendingChart";
import TransactionList from "@/components/transactions/TransactionList";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import EditTransactionModal from "@/components/transactions/EditTransactionModal";
import CategoryPanel from "@/components/categories/CategoryPanel";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteTransactionDialog from "@/components/transactions/DeleteTransactionDialog";

export default function Dashboard() {
  // Transaction state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    period: {
      start: "",
      end: ""
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryPanel, setShowCategoryPanel] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!loading) setIsRefreshing(true);
    try {
      const [transactionsData, summaryData, categoriesData] = await Promise.all([
        transactionService.getTransactions(),
        transactionService.getTransactionSummary(),
        categoryService.getCategories()
      ]);
      
      setTransactions(transactionsData);
      setSummary(summaryData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard data error:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Calculate optimistic summary update
  const updateSummaryOptimistically = (transaction: Transaction, isAdd: boolean = true) => {
    setSummary(prev => {
      const multiplier = isAdd ? 1 : -1;
      const amount = parseFloat(transaction.amount.toString());
      return {
        ...prev,
        totalIncome: transaction.type === 'income' 
          ? prev.totalIncome + (amount * multiplier) 
          : prev.totalIncome,
        totalExpense: transaction.type === 'expense' 
          ? prev.totalExpense + (amount * multiplier) 
          : prev.totalExpense,
        balance: transaction.type === 'income' 
          ? prev.balance + (amount * multiplier)
          : prev.balance - (amount * multiplier)
      };
    });
  };

  const handleAddTransaction = async (newTransaction: Transaction) => {
    try {
      // Optimistic update
      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      updateSummaryOptimistically(newTransaction, true);
      setIsAddModalOpen(false);
      
      // Silently refresh data in background
      fetchDashboardData();
    } catch (error) {
      // Rollback optimistic update
      setTransactions(prev => prev.filter(t => t.id !== newTransaction.id));
      updateSummaryOptimistically(newTransaction, false);
      toast.error("Failed to add transaction");
      console.error("Error adding transaction:", error);
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      // Optimistic update
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      updateSummaryOptimistically(transaction, false);
      
      // Actual API call
      await transactionService.deleteTransaction(transaction.id);
      toast.success("Transaction deleted successfully");
      
      // Silently refresh data in background
      fetchDashboardData();
    } catch (error) {
      // Rollback optimistic update
      setTransactions(prev => [...prev, transaction]);
      updateSummaryOptimistically(transaction, true);
      toast.error("Failed to delete transaction");
      console.error("Error deleting transaction:", error);
    }
  };

  const handleEditTransaction = async (updatedTransaction: Transaction) => {
    try {
      const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
      if (!oldTransaction) return;

      // Optimistic update
      setTransactions(prev => 
        prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
      );
      updateSummaryOptimistically(oldTransaction, false);
      updateSummaryOptimistically(updatedTransaction, true);
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
      
      // Actual API call
      await transactionService.updateTransaction(updatedTransaction.id, updatedTransaction);
      toast.success("Transaction updated successfully");
      
      // Silently refresh data in background
      fetchDashboardData();
    } catch (error) {
      // Rollback optimistic update
      setTransactions(prev => 
        prev.map(t => t.id === updatedTransaction.id ? selectedTransaction! : t)
      );
      toast.error("Failed to update transaction");
      console.error("Error updating transaction:", error);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            </div>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold">${summary.totalIncome.toFixed(2)}</div>
            )}
          </CardHeader>
        </Card>

        <Card className="border dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </div>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold">${summary.totalExpense.toFixed(2)}</div>
            )}
          </CardHeader>
        </Card>

        <Card className="border dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
              </div>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-xl font-bold">${summary.balance.toFixed(2)}</div>
            )}
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div>
        {loading ? (
      <Card className="border dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between py-2 px-3">
          <div>
                <CardTitle className="text-lg font-medium">Spending Overview</CardTitle>
                <CardTitle className="text-sm text-muted-foreground">Your spending patterns</CardTitle>
              </div>
            </CardHeader>
            <div className="p-6">
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
          </Card>
        ) : (
          <SpendingChart 
            transactions={transactions}
            categories={categories}
          />
        )}
                  </div>

      {/* Categories Panel */}
      <CategoryPanel
        show={showCategoryPanel}
        onToggle={() => setShowCategoryPanel(!showCategoryPanel)}
        categories={categories}
        onCategoriesChange={setCategories}
      />

      {/* Transactions List with AnimatePresence */}
      <AnimatePresence mode="sync">
        <TransactionList
          transactions={transactions}
          categories={categories}
          loading={loading}
          isRefreshing={isRefreshing}
          onAddClick={() => setIsAddModalOpen(true)}
          onEditClick={handleEditClick}
          onDeleteClick={(transaction) => setTransactionToDelete(transaction)}
        />
      </AnimatePresence>

      {/* Add Transaction Modal */}
      {isAddModalOpen && (
        <AddTransactionModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          onAddTransaction={handleAddTransaction}
          categories={categories}
        />
      )}

      {/* Edit Transaction Modal */}
      {isEditModalOpen && selectedTransaction && (
        <EditTransactionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
          }}
          onEditTransaction={handleEditTransaction}
          transaction={selectedTransaction}
          categories={categories}
        />
      )}

      {/* Delete Transaction Dialog */}
      {transactionToDelete && (
        <DeleteTransactionDialog
          isOpen={!!transactionToDelete}
          onClose={() => setTransactionToDelete(null)}
          onConfirm={() => {
            handleDeleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
          }}
          transaction={transactionToDelete}
        />
      )}
    </div>
  );
} 