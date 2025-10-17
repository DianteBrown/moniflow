import api from './api';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  type: 'income' | 'expense';
  is_manual_created?: boolean;
  bank_info?: {
    institution_name: string;
    account_name: string;
    account_type: string;
  };
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

// Interface for CSV import data
export interface CSVTransactionData {
  amount: number;
  description: string;
  category: string; // Category name instead of ID
  date: string;
  type: 'income' | 'expense';
}

// Interface for bulk import response
export interface BulkImportResponse {
  importedCount: number;
  createdCategories: string[];
  failedRows: {
    rowIndex: number;
    error: string;
  }[];
}

class TransactionService {
  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get<{ transactions: Transaction[] }>('/budget/transactions');
    console.log(response.data.transactions);
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

  async getTransactionSummary(period: 'current_month' | 'all_time' = 'current_month'): Promise<TransactionSummary> {
    const params = new URLSearchParams();
    params.append('period', period);
    
    const response = await api.get<{ summary: TransactionSummary }>(`/budget/summary?${params.toString()}`);
    return response.data.summary;
  }

  /**
   * Export transactions to CSV format
   * @param transactions The transactions to export
   * @param categoryMap Map of category IDs to names
   * @returns CSV string
   */
  exportToCSV(transactions: Transaction[], categoryMap: Record<string, string>): string {
    // Define the CSV headers
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Bank', 'Account'];
    
    // Convert transactions to CSV rows
    const rows = transactions.map(transaction => {
      return [
        new Date(transaction.date).toISOString().split('T')[0], // Format date as YYYY-MM-DD
        transaction.type,
        categoryMap[transaction.category_id] || 'Unknown Category',
        transaction.description,
        transaction.amount.toString(),
        transaction.bank_info?.institution_name || '',
        transaction.bank_info?.account_name || ''
      ];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }

  /**
   * Import transactions from CSV content
   * @param csvContent The CSV content as a string
   * @returns Promise with import results
   */
  async importFromCSV(csvContent: string): Promise<BulkImportResponse> {
    // Ensure the CSV has a description column, even if it's empty
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    // Check if Description header exists
    if (!headers.some(h => h.trim().toLowerCase() === 'description')) {
      // Add Description header
      headers.splice(headers.length - 1, 0, 'Description');
      
      // Add empty description field to each row
      const updatedLines = [headers.join(',')];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const fields = lines[i].split(',');
        fields.splice(fields.length - 1, 0, '');
        updatedLines.push(fields.join(','));
      }
      
      csvContent = updatedLines.join('\n');
    }
    
    const response = await api.post<BulkImportResponse>(
      '/budget/transactions/import',
      { csvContent }
    );
    return response.data;
  }

  /**
   * Parse CSV string into transaction data
   * @param csvContent The CSV content as a string
   * @returns Parsed transaction data 
   */
  parseCSV(csvContent: string): CSVTransactionData[] {
    // Split CSV by lines
    const lines = csvContent.split('\n');
    
    // Extract headers
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    // Map expected fields to actual CSV headers
    const fieldMap: Record<string, number> = {};
    
    // Match headers to expected fields (with some flexibility)
    const dateIndex = headers.findIndex(h => h.includes('date'));
    const typeIndex = headers.findIndex(h => h.includes('type'));
    const categoryIndex = headers.findIndex(h => h.includes('category'));
    const descriptionIndex = headers.findIndex(h => h.includes('description'));
    const amountIndex = headers.findIndex(h => h.includes('amount'));
    
    if (dateIndex === -1 || typeIndex === -1 || categoryIndex === -1 || amountIndex === -1) {
      throw new Error('Invalid CSV format. Required columns: Date, Type, Category, Amount. Description is optional.');
    }
    
    fieldMap.date = dateIndex;
    fieldMap.type = typeIndex;
    fieldMap.category = categoryIndex;
    fieldMap.description = descriptionIndex;
    fieldMap.amount = amountIndex;
    
    // Parse data rows
    const transactions: CSVTransactionData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Handle quoted fields with commas
      const fields: string[] = [];
      let field = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(field);
          field = '';
        } else {
          field += char;
        }
      }
      
      // Push the last field
      fields.push(field);
      
      // Validate field count
      if (fields.length !== headers.length) {
        console.warn(`Skipping line ${i}: invalid field count`);
        continue;
      }
      
      // Parse date
      let date = fields[fieldMap.date].trim();
      // Try to parse and standardize the date format
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Skipping line ${i}: invalid date format`);
        continue;
      }
      date = parsedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      // Parse type
      const type = fields[fieldMap.type].trim().toLowerCase();
      if (type !== 'income' && type !== 'expense') {
        console.warn(`Skipping line ${i}: invalid type (must be 'income' or 'expense')`);
        continue;
      }
      
      // Parse amount
      // Remove currency symbols and commas
      const amountStr = fields[fieldMap.amount].replace(/[$,]/g, '').trim();
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) {
        console.warn(`Skipping line ${i}: invalid amount`);
        continue;
      }
      
      // Ensure amount is positive (type field determines if it's income or expense)
      const finalAmount = Math.abs(amount);
      
      transactions.push({
        date,
        type: type as 'income' | 'expense',
        category: fields[fieldMap.category].trim(),
        description: descriptionIndex >= 0 && fields[fieldMap.description] ? fields[fieldMap.description].trim() : "",
        amount: finalAmount
      });
    }
    
    return transactions;
  }
}

export const transactionService = new TransactionService(); 