import api from './api';

export interface BankAccount {
  id: string;
  user_id: string;
  account_id: string; // Plaid account ID
  name: string;
  type: string;
  subtype: string;
  institution_name: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBankAccountData {
  account_id: string;
  name: string;
  type: string;
  subtype: string;
  institution_name: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
  };
}

export interface UpdateBankAccountData {
  name?: string;
  is_active?: boolean;
}

class BankAccountService {
  async getBankAccounts(): Promise<BankAccount[]> {
    const response = await api.get<{ accounts: BankAccount[] }>('/plaid/accounts');
    return response.data.accounts;
  }

  async createBankAccount(data: CreateBankAccountData): Promise<BankAccount> {
    const response = await api.post<{ account: BankAccount }>('/plaid/accounts', data);
    return response.data.account;
  }

  async updateBankAccount(id: string, data: UpdateBankAccountData): Promise<BankAccount> {
    const response = await api.put<{ account: BankAccount }>(`/plaid/accounts/${id}`, data);
    return response.data.account;
  }

  async deleteBankAccount(id: string): Promise<void> {
    await api.delete(`/plaid/accounts/${id}`);
  }

  async syncBankAccount(id: string): Promise<{ message: string; synced_count: number }> {
    const response = await api.post<{ message: string; synced_count: number }>(`/plaid/accounts/${id}/sync`);
    return response.data;
  }
}

export const bankAccountService = new BankAccountService();