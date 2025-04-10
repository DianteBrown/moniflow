import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Transaction } from "@/services/transactionService";
import { Category } from "@/services/categoryService";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface SpendingChartProps {
  transactions: Transaction[];
  categories: Category[];
}

type ChartType = 'pie' | 'bar';
type TimeRange = 'thisMonth' | 'lastMonth' | 'last3Months';

interface MonthData {
  name: string;
  [key: string]: string | number; // Allow dynamic category names as properties
}

interface CategoryChartInfo {
  name: string;
  color: string;
}

interface MonthlyChartData {
  data: MonthData[];
  categories: CategoryChartInfo[];
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

type ChartData = PieChartData[] | MonthlyChartData;

export default function SpendingChart({ transactions, categories }: SpendingChartProps) {
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [timeRange, setTimeRange] = useState<TimeRange>('thisMonth');

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'thisMonth':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'lastMonth':
        return {
          start: startOfMonth(subMonths(now, 1)),
          end: endOfMonth(subMonths(now, 1))
        };
      case 'last3Months':
        return {
          start: startOfMonth(subMonths(now, 2)),
          end: endOfMonth(now)
        };
    }
  };

  const filterTransactions = () => {
    const { start, end } = getDateRange();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end && t.type === 'expense';
    });
  };

  const getCategoryData = () => {
    const filteredTransactions = filterTransactions();
    const categoryTotals = new Map<string, number>();

    filteredTransactions.forEach(transaction => {
      const current = categoryTotals.get(transaction.category_id) || 0;
      categoryTotals.set(transaction.category_id, current + transaction.amount);
    });

    return Array.from(categoryTotals.entries()).map(([categoryId, total]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category?.name || 'Unknown',
        value: total,
        color: category?.color || '#6B7280'
      };
    }).sort((a, b) => b.value - a.value);
  };

  const getMonthlyData = () => {
    const now = new Date();
    const months = timeRange === 'last3Months' ? 3 : 
                  timeRange === 'lastMonth' ? 2 : 1;
    const monthlyData = [];

    for (let i = 0; i < months; i++) {
      const month = subMonths(now, i);
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end && t.type === 'expense';
      });

      // Group transactions by category
      const categoryTotals = new Map<string, number>();
      monthTransactions.forEach(transaction => {
        const current = categoryTotals.get(transaction.category_id) || 0;
        categoryTotals.set(transaction.category_id, current + transaction.amount);
      });

      const monthData: MonthData = {
        name: format(month, 'MMM yyyy'),
      };

      // Add each category's total to the month data
      categories.forEach(category => {
        const total = categoryTotals.get(category.id) || 0;
        monthData[category.name] = total;
      });

      monthlyData.unshift(monthData);
    }

    return {
      data: monthlyData,
      categories: categories.map(cat => ({
        name: cat.name,
        color: cat.color || '#6B7280'
      }))
    };
  };

  const chartData: ChartData = chartType === 'pie' ? getCategoryData() : getMonthlyData();

  return (
    <Card className="border dark:border-gray-800">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-3 sm:space-y-0">
        <div>
          <CardTitle>Spending Analysis</CardTitle>
          <CardDescription>
            Total expenses: ${filterTransactions().reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartType(prev => prev === 'pie' ? 'bar' : 'pie')}
          >
            {chartType === 'pie' ? 'Show Bar Chart' : 'Show Pie Chart'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {filterTransactions().length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-1">No transactions found</p>
                <p className="text-sm">Add some transactions to see your spending analysis</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData as PieChartData[]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {(chartData as PieChartData[]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                  />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={(chartData as MonthlyChartData).data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                  />
                  <Legend />
                  {(chartData as MonthlyChartData).categories.map((category) => (
                    <Bar 
                      key={category.name}
                      dataKey={category.name}
                      stackId="a"
                      fill={category.color}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 