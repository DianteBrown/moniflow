import api from './api';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_default: boolean;
  type: 'income' | 'expense' | 'both';
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryData {
  name: string;
  color?: string;
  icon?: string;
}

class CategoryService {
  async getCategories(): Promise<Category[]> {
    const response = await api.get<{ categories: Category[] }>('/categories');
    return response.data.categories;
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const response = await api.post<{ message: string; category: Category }>(
      '/categories',
      data
    );
    return response.data.category;
  }

  async updateCategory(id: string, data: Partial<CreateCategoryData>): Promise<Category> {
    const response = await api.put<{ message: string; category: Category }>(
      `/categories/${id}`,
      data
    );
    return response.data.category;
  }

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
}

export const categoryService = new CategoryService(); 