import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  categoryService, 
  Category, 
  CreateCategoryData 
} from '@/services/categoryService';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  list: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
}

// Hook for fetching categories
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoryService.getCategories(),
  });
}

// Hooks for data mutations
export function useAddCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCategoryData) => categoryService.createCategory(data),
    onSuccess: (newCategory) => {
      // Update categories list
      queryClient.setQueryData<Category[]>(
        categoryKeys.list(), 
        (oldData = []) => [...oldData, newCategory]
      );
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryData> }) => 
      categoryService.updateCategory(id, data),
    onSuccess: (updatedCategory) => {
      // Update the specific category in the list
      queryClient.setQueryData<Category[]>(
        categoryKeys.list(),
        (oldData = []) => oldData.map(c => 
          c.id === updatedCategory.id ? updatedCategory : c
        )
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: (_, id) => {
      // Update the categories list by removing the deleted one
      queryClient.setQueryData<Category[]>(
        categoryKeys.list(),
        (oldData = []) => oldData.filter(c => c.id !== id)
      );
    },
  });
} 