import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plaidService } from '@/services/plaidService';

// Query keys
export const bankAccountKeys = {
  all: ['bankAccounts'] as const,
  lists: () => [...bankAccountKeys.all, 'list'] as const,
  detail: (id: string) => [...bankAccountKeys.all, 'detail', id] as const,
}

// Hooks for data fetching
export function useBankAccounts() {
  return useQuery({
    queryKey: bankAccountKeys.lists(),
    queryFn: () => plaidService.getConnectedBanks(),
  });
}

// Hooks for data mutations
export function useDisconnectBank() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bankId: string) => plaidService.disconnectBank(bankId),
    onSuccess: () => {
      // Invalidate bank accounts list
      queryClient.invalidateQueries({ 
        queryKey: bankAccountKeys.all 
      });
    },
  });
}

export function useRemoveBank() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bankId: string) => {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );
      
      return Promise.race([
        plaidService.removeBank(bankId),
        timeoutPromise
      ]);
    },
    onSuccess: () => {
      // Invalidate bank accounts list
      queryClient.invalidateQueries({ 
        queryKey: bankAccountKeys.all 
      });
      
      // Since we're hard deleting, also invalidate transactions and related queries
      queryClient.invalidateQueries({ 
        queryKey: ['transactions'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['categories'] 
      });
    },
    onError: (error) => {
      console.error('Remove bank mutation error:', error);
    },
  });
}

export function useSyncAllBanks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => plaidService.syncAllBanks(),
    onSuccess: () => {
      // Invalidate both bank accounts and transactions
      queryClient.invalidateQueries({ 
        queryKey: bankAccountKeys.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['transactions'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['categories'] 
      });
    },
  });
}
