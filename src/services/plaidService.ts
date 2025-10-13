import api from './api';

export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
}

export interface PlaidExchangeResponse {
  access_token: string;
  item_id: string;
  request_id: string;
}

export interface PlaidAccount {
  account_id: string;
  name: string;
  type: string;
  subtype: string;
  balances: {
    available: number | null;
    current: number | null;
    limit: number | null;
  };
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  date: string;
  name: string;
  merchant_name?: string;
  category?: string[];
  account_owner?: string;
}

export interface PlaidTransactionsResponse {
  transactions: PlaidTransaction[];
  accounts: PlaidAccount[];
  total_transactions: number;
}

export interface PlaidSyncResponse {
  data: any;
  cursor: string;
}

export interface ConnectedBank {
  id: string;
  item_id: string;
  institution_id: string;
  institution_name: string;
  status: string;
  error_message?: string;
  last_successful_update?: string;
  created_at: string;
  plaid_accounts: PlaidAccountInfo[];
}

export interface PlaidAccountInfo {
  id: string;
  account_id: string;
  name: string;
  official_name: string;
  type: string;
  subtype: string;
  mask: string;
  balance_current: number | null;
  balance_available: number | null;
  balance_limit: number | null;
  is_active: boolean;
}

export interface ConnectedBanksResponse {
  banks: ConnectedBank[];
}

class PlaidService {
  private accessToken: string | null = null;

  async createLinkToken(): Promise<PlaidLinkTokenResponse> {
    const response = await api.post('/plaid/create-link-token', {
      // Add any user-specific data for the link token
      user_id: localStorage.getItem('userId') || 'demo-user',
      client_name: 'Moniflow Budget App'
    });
    console.log('createLinkToken function called', response.data);
    return response.data;
  }

  async exchangePublicToken(publicToken: string, institution_id: any): Promise<PlaidExchangeResponse> {
    const response = await api.post('/plaid/connect-bank', {
      public_token: publicToken,
      institution_id: institution_id
    });
    // Store the access token for future use
    this.accessToken = response.data.access_token;
    return response.data;
  }

  async getAccounts(): Promise<PlaidAccount[]> {
    const response = await api.get('/plaid/accounts');
    return response.data.accounts;
  }

  async getTransactions(startDate: string, endDate: string): Promise<PlaidTransactionsResponse> {
    const response = await api.get('/plaid/transactions', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  }

  async syncTransactions(cursor?: string, count: number = 100): Promise<PlaidSyncResponse> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please connect your bank account first.');
    }

    const response = await api.post('/plaid/sync-transactions', {
      access_token: this.accessToken,
      cursor: cursor || null,
      count,
    });
    return response.data;
  }

  // Method to get the current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Method to set access token (useful for persistence)
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Get connected banks
  async getConnectedBanks(): Promise<ConnectedBanksResponse> {
    const response = await api.get('/plaid/connected-banks');
    return response.data;
  }

  // Sync all banks
  async syncAllBanks(): Promise<any> {
    const response = await api.post('/plaid/sync-all-banks');
    return response.data;
  }

  // Disconnect a bank
  async disconnectBank(bankId: string): Promise<any> {
    const response = await api.delete(`/plaid/disconnect-bank/${bankId}`);
    return response.data;
  }
}

export const plaidService = new PlaidService();