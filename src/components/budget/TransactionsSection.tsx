import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import { Transaction, CreateTransactionData } from "@/services/transactionService";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import AddTransactionModal from "@/components/transactions/AddTransactionModal";
import EditTransactionModal from "@/components/transactions/EditTransactionModal";
import DeleteTransactionDialog from "@/components/transactions/DeleteTransactionDialog";
import TransactionImportExport from "@/components/transactions/TransactionImportExport";
import TransactionDashboard from "@/components/transactions/TransactionDashboard";
import CategoryPanel from "@/components/categories/CategoryPanel";
import { 
  useTransactions, 
  useTransactionSummary,
  useAddTransaction,
  useUpdateTransaction,
  useDeleteTransaction 
} from "@/hooks/queries/useTransactions";
import { 
  useCategories
} from "@/hooks/queries/useCategories";

export default function TransactionsSection() {
  // Transaction state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  
  // Query hooks
  const { 
    data: transactions = [], 
    isLoading: isTransactionsLoading,
    isRefetching: isTransactionsRefetching,
    refetch: refetchTransactions
  } = useTransactions();
  
  const {
    data: summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      period: { start: "", end: "" }
    },
    isLoading: isSummaryLoading
  } = useTransactionSummary('all_time');
  
  const { 
    data: categories = [],
    isLoading: isCategoriesLoading 
  } = useCategories();
  
  // Mutation hooks
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  
  const loading = isTransactionsLoading || isSummaryLoading || isCategoriesLoading;
  
  const handleAddTransaction = async (transactionData: CreateTransactionData) => {
    try {
      await addTransaction.mutateAsync(transactionData);
      setIsAddModalOpen(false);
      toast.success("Transaction added successfully");
    } catch (error) {
      toast.error("Failed to add transaction");
      console.error("Error adding transaction:", error);
    }
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      toast.success("Transaction deleted successfully");
    } catch (error) {
      toast.error("Failed to delete transaction");
      console.error("Error deleting transaction:", error);
    }
  };

  const handleEditTransaction = async (updatedTransaction: Transaction) => {
    try {
      await updateTransaction.mutateAsync({
        id: updatedTransaction.id,
        data: updatedTransaction
      });
      setIsEditModalOpen(false);
      setSelectedTransaction(null);
      toast.success("Transaction updated successfully");
    } catch (error) {
      toast.error("Failed to update transaction");
      console.error("Error updating transaction:", error);
    }
  };


  return (
    <div className="space-y-8">
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

      {/* Transactions Dashboard */}
      <div className="flex flex-col space-y-4">
        {/* Categories Panel */}
        <CategoryPanel
          show={showCategories}
          onToggle={() => setShowCategories(!showCategories)}
          categories={categories || []}
        />

        <div className="flex justify-end">
          <TransactionImportExport
            transactions={transactions}
            categories={categories}
            onImportComplete={() => {
              // React Query will handle the refetching
            }}
          />
        </div>
        <AnimatePresence mode="sync">
          <TransactionDashboard
            transactions={transactions}
            categories={categories}
            loading={loading}
            isRefreshing={isTransactionsRefetching}
            onRefreshTransactions={() => refetchTransactions()}
          />
        </AnimatePresence>
      </div>

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
            if (transactionToDelete) {
            handleDeleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
            }
          }}
          transaction={transactionToDelete}
        />
      )}
    </div>
  );
} 