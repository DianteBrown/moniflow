import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TransactionForm from "@/components/budget/TransactionForm";
import { useState } from "react";
import { transactionService, Transaction, CreateTransactionData } from "@/services/transactionService";
import { toast } from "sonner";
import { format } from "date-fns";
import { Category } from "@/services/categoryService";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Transaction) => void;
  categories: Category[];
}

interface TransactionFormData {
  amount: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
}

const AddTransactionModal = ({ isOpen, onClose, onAddTransaction, categories }: AddTransactionModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: TransactionFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Format the data for the API
      const transactionData: CreateTransactionData = {
        amount: Number(formData.amount),
        description: formData.description || "",
        category_id: formData.category,
        date: format(formData.date, "yyyy-MM-dd"),
        type: formData.type
      };
      
      const transaction = await transactionService.createTransaction(transactionData);
      onAddTransaction(transaction);
      toast.success("Transaction added successfully");
      onClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm 
          onSubmit={handleSubmit} 
          onCancel={() => !isSubmitting && onClose()}
          categories={categories}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal; 