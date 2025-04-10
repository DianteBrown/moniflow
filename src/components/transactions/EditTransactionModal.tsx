import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TransactionForm from "@/components/budget/TransactionForm";
import { Transaction } from "@/services/transactionService";
import { Category } from "@/services/categoryService";
import { format } from "date-fns";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  transaction: Transaction;
  categories: Category[];
}

interface TransactionFormData {
  amount: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
}

const EditTransactionModal = ({ 
  isOpen, 
  onClose, 
  onEditTransaction, 
  transaction,
  categories 
}: EditTransactionModalProps) => {
  const handleSubmit = async (formData: TransactionFormData) => {
    // Format the data for the API
    const updatedTransaction: Transaction = {
      ...transaction,
      amount: Number(formData.amount),
      description: formData.description || "",
      category_id: formData.category,
      date: format(formData.date, "yyyy-MM-dd"),
      type: formData.type
    };
    
    onEditTransaction(updatedTransaction);
  };

  // Convert transaction data to form data format
  const initialFormData: TransactionFormData = {
    amount: String(Math.abs(transaction.amount)),
    type: transaction.type,
    category: transaction.category_id,
    description: transaction.description,
    date: new Date(transaction.date)
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm 
          onSubmit={handleSubmit} 
          onCancel={onClose}
          initialData={initialFormData}
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionModal; 