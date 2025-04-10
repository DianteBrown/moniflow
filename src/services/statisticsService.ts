import api from './api';

export interface CategoryStat {
  category_id: string;
  category_name: string;
  total: number;
  percentage: number;
  color?: string;
  icon?: string;
}

export interface MonthlyStat {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryStatsResponse {
  stats: CategoryStat[];
  period: {
    start: string;
    end: string;
    name: string;
  };
}

export interface MonthlyStatsResponse {
  stats: MonthlyStat[];
  period: {
    start: string;
    end: string;
    months: number;
  };
}

class StatisticsService {
  async getCategoryStats(params?: {
    period?: 'month' | 'year' | 'last30days';
    type?: 'income' | 'expense';
  }): Promise<CategoryStatsResponse> {
    const response = await api.get<CategoryStatsResponse>('/statistics/categories', {
      params,
    });
    return response.data;
  }

  async getMonthlyStats(params?: { months?: number }): Promise<MonthlyStatsResponse> {
    const response = await api.get<MonthlyStatsResponse>('/statistics/monthly', {
      params,
    });
    return response.data;
  }
}

export const statisticsService = new StatisticsService(); 