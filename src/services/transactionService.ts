import api from './api';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  type: 'income' | 'expense';
  created_at?: string;
  updated_at?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  period: {
    start: string;
    end: string;
  };
}

export interface CreateTransactionData {
  amount: number;
  description: string;
  category_id: string;
  date: string;
  type: 'income' | 'expense';
}

class TransactionService {
  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get<{ transactions: Transaction[] }>('/budget/transactions');
    return response.data.transactions;
  }

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post<{ message: string; transaction: Transaction }>(
      '/budget/transactions',
      data
    );
    return response.data.transaction;
  }

  async updateTransaction(id: string, data: Partial<CreateTransactionData>): Promise<Transaction> {
    const response = await api.put<{ message: string; transaction: Transaction }>(
      `/budget/transactions/${id}`,
      data
    );
    return response.data.transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/budget/transactions/${id}`);
  }

  async getTransactionSummary(): Promise<TransactionSummary> {
    const response = await api.get<TransactionSummary>('/budget/summary');
    return response.data;
  }
}

export const transactionService = new TransactionService(); 