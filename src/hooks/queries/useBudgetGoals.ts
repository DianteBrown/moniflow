import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { format } from 'date-fns';

export interface BudgetGoalResponse {
  categories: (BudgetedCategory | UnbudgetedCategory)[];
}

export interface BudgetedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthly_budget: number | null;
  spent_amount: number;
  remaining_amount: number | null;
  budget_status: 'budgeted';
}

export interface UnbudgetedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthly_budget: null;
  spent_amount: number;
  remaining_amount: null;
  budget_status: 'unbudgeted';
}

// Query keys
export const budgetGoalKeys = {
  all: ['budgetGoals'] as const,
  month: (month: string) => [...budgetGoalKeys.all, 'month', month] as const,
}

// Hooks for data fetching
export function useBudgetGoals(selectedMonth: Date) {
  const monthStr = format(selectedMonth, 'yyyy-MM');
  
  return useQuery({
    queryKey: budgetGoalKeys.month(monthStr),
    queryFn: async () => {
      const res = await api.get<BudgetGoalResponse>(`/budget/categories/budgets/status/${monthStr}`);
      return res.data.categories || [];
    },
  });
}

// Hook for setting/updating budget
export function useSetBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      categoryId, 
      amount, 
      month 
    }: { 
      categoryId: string; 
      amount: number; 
      month: string;
    }) => 
      api.put(`/budget/categories/${categoryId}/budget`, {
        monthly_budget: amount,
        month
      }),
    onSuccess: (_, { month }) => {
      // Invalidate the budget goals for this month
      queryClient.invalidateQueries({ 
        queryKey: budgetGoalKeys.month(month) 
      });
    },
  });
}

// Hook for deleting a budget
export function useDeleteBudget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      categoryId, 
      month 
    }: { 
      categoryId: string; 
      month: string;
    }) => 
      api.delete(`/budget/categories/${categoryId}/budget?month=${month}`),
    onSuccess: (_, { month }) => {
      // Invalidate the budget goals for this month
      queryClient.invalidateQueries({ 
        queryKey: budgetGoalKeys.month(month) 
      });
    },
  });
} 