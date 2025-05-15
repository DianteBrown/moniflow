import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  transactionService, 
  Transaction, 
  CreateTransactionData
} from '@/services/transactionService';
import { budgetGoalKeys } from '@/hooks/queries/useBudgetGoals';
import { format } from 'date-fns';

// Query keys
export const transactionKeys = {
  all: ['transactions'] as const,
  list: () => [...transactionKeys.all, 'list'] as const,
  summary: (period: string) => [...transactionKeys.all, 'summary', period] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
}

// Hooks for data fetching
export function useTransactions() {
  return useQuery({
    queryKey: transactionKeys.list(),
    queryFn: () => transactionService.getTransactions(),
  });
}

export function useTransactionSummary(period: 'current_month' | 'all_time' = 'current_month') {
  return useQuery({
    queryKey: transactionKeys.summary(period),
    queryFn: () => transactionService.getTransactionSummary(period),
  });
}

// Hooks for data mutations
export function useAddTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTransactionData) => transactionService.createTransaction(data),
    onSuccess: (newTransaction) => {
      // Update transactions list - add new transaction at the top
      queryClient.setQueryData<Transaction[]>(
        transactionKeys.list(), 
        (oldData = []) => [newTransaction, ...oldData]
      );
      
      // Only invalidate summary queries, not the transaction list
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.summary('all_time'),
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.summary('current_month'),
        exact: false 
      });
      
      // Invalidate budget goals for the transaction's month
      const transactionMonth = format(new Date(newTransaction.date), 'yyyy-MM');
      queryClient.invalidateQueries({ 
        queryKey: budgetGoalKeys.month(transactionMonth) 
      });
      
      // Also invalidate current month budget goals if transaction is not in current month
      const currentMonth = format(new Date(), 'yyyy-MM');
      if (transactionMonth !== currentMonth) {
        queryClient.invalidateQueries({ 
          queryKey: budgetGoalKeys.month(currentMonth) 
        });
      }
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTransactionData> }) => 
      transactionService.updateTransaction(id, data),
    onSuccess: (updatedTransaction, { data: updatedData }) => {
      // Update the specific transaction in the list
      queryClient.setQueryData<Transaction[]>(
        transactionKeys.list(),
        (oldData = []) => oldData.map(t => 
          t.id === updatedTransaction.id ? updatedTransaction : t
        )
      );
      
      // Only invalidate summary queries, not the transaction list
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.summary('all_time'),
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.summary('current_month'),
        exact: false 
      });
      
      // Invalidate budget goals for the updated transaction's month
      const transactionMonth = format(new Date(updatedTransaction.date), 'yyyy-MM');
      queryClient.invalidateQueries({ 
        queryKey: budgetGoalKeys.month(transactionMonth) 
      });
      
      // If the date was changed, also invalidate the old month's budget goals
      if (updatedData.date) {
        const oldData = queryClient.getQueryData<Transaction[]>(transactionKeys.list());
        const oldTransaction = oldData?.find(t => t.id === updatedTransaction.id);
        
        if (oldTransaction && oldTransaction.date !== updatedTransaction.date) {
          const oldMonth = format(new Date(oldTransaction.date), 'yyyy-MM');
          if (oldMonth !== transactionMonth) {
            queryClient.invalidateQueries({ 
              queryKey: budgetGoalKeys.month(oldMonth) 
            });
          }
        }
      }
      
      // Also invalidate current month budget goals if transaction is not in current month
      const currentMonth = format(new Date(), 'yyyy-MM');
      if (transactionMonth !== currentMonth) {
        queryClient.invalidateQueries({ 
          queryKey: budgetGoalKeys.month(currentMonth) 
        });
      }
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: (_, id) => {
      // Get the transaction before removing it from cache
      const oldData = queryClient.getQueryData<Transaction[]>(transactionKeys.list());
      const deletedTransaction = oldData?.find(t => t.id === id);
      
      // Update the transactions list by removing the deleted one
      queryClient.setQueryData<Transaction[]>(
        transactionKeys.list(),
        (oldData = []) => oldData.filter(t => t.id !== id)
      );
      
      // Only invalidate summary queries, not the transaction list
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.summary('all_time'),
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.summary('current_month'),
        exact: false 
      });
      
      // Invalidate budget goals for the deleted transaction's month
      if (deletedTransaction) {
        const transactionMonth = format(new Date(deletedTransaction.date), 'yyyy-MM');
        queryClient.invalidateQueries({ 
          queryKey: budgetGoalKeys.month(transactionMonth) 
        });
        
        // Also invalidate current month budget goals if transaction is not in current month
        const currentMonth = format(new Date(), 'yyyy-MM');
        if (transactionMonth !== currentMonth) {
          queryClient.invalidateQueries({ 
            queryKey: budgetGoalKeys.month(currentMonth) 
          });
        }
      }
    },
  });
} 