import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Lock } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format, subMonths, addMonths, subWeeks, addWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { useTransactions } from "@/hooks/queries/useTransactions";
import { useCategories } from "@/hooks/queries/useCategories";
import { useSubscription, useHasAdvancedCharts } from "@/hooks/queries/useSubscription";
import { toast } from "sonner";
import AIChatBot from "../chat/AIChatBot";
import { CategoryIconComponent } from "../icons/CategoryIcons";

interface CategorySpending {
  name: string;
  amount: number;
  color: string;
  percentage: number;
  icon?: string;
}

type OverviewType = 'expense' | 'income' | 'expense-flow' | 'income-flow';
type ViewPeriod = 'week' | 'month' | '3months' | '6months' | 'year';

// Add interface for flow data
interface FlowDataPoint {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export default function AnalysisSection() {
  const [expenseCategories, setExpenseCategories] = useState<CategorySpending[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategorySpending[]>([]);
  const [overviewType, setOverviewType] = useState<OverviewType>('expense');
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('month');
  const [flowData, setFlowData] = useState<FlowDataPoint[]>([]);

  // Query hooks
  const {
    data: transactions = [],
    isLoading: isTransactionsLoading
  } = useTransactions();

  const {
    data: categories = [],
    isLoading: isCategoriesLoading
  } = useCategories();

  const {
    isLoading: isSubscriptionLoading
  } = useSubscription();

  const hasAdvancedCharts = useHasAdvancedCharts();

  const loading = isTransactionsLoading || isCategoriesLoading || isSubscriptionLoading;

  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      processTransactions();
      processFlowData();
    }
  }, [selectedDate, viewPeriod, transactions, categories]);

  const getDateRange = () => {
    const now = selectedDate;
    switch (viewPeriod) {
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
          format: "'Week of' MMM d, yyyy"
        };
      case '3months':
        return {
          start: startOfMonth(subMonths(now, 2)),
          end: endOfMonth(now),
          format: "MMM - MMM yyyy"
        };
      case '6months':
        return {
          start: startOfMonth(subMonths(now, 5)),
          end: endOfMonth(now),
          format: "MMM - MMM yyyy"
        };
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now),
          format: "yyyy"
        };
      case 'month':
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
          format: "MMMM yyyy"
        };
    }
  };

  const processTransactions = () => {
    const { start, end } = getDateRange();

    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });

    let totalExp = 0;
    let totalInc = 0;

    // Calculate category statistics
    const expenseStatsMap = new Map<string, number>();
    const incomeStatsMap = new Map<string, number>();

    periodTransactions.forEach(t => {
      if (t.type === 'expense') {
        totalExp += t.amount;
        const current = expenseStatsMap.get(t.category_id) || 0;
        expenseStatsMap.set(t.category_id, current + t.amount);
      } else {
        totalInc += t.amount;
        const current = incomeStatsMap.get(t.category_id) || 0;
        incomeStatsMap.set(t.category_id, current + t.amount);
      }
    });

    setTotalExpense(totalExp);
    setTotalIncome(totalInc);
    setTotal(totalInc - totalExp);

    // Process expense categories
    const expenseData = categories.map(cat => {
      const amount = expenseStatsMap.get(cat.id) ?? 0;
      return {
        name: cat.name,
        amount,
        color: cat.color,
        percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0,
        icon: cat.icon
      };
    })
      .filter(category => category.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    // Process income categories
    const incomeData = categories.map(cat => {
      const amount = incomeStatsMap.get(cat.id) ?? 0;
      return {
        name: cat.name,
        amount,
        color: cat.color,
        percentage: totalInc > 0 ? (amount / totalInc) * 100 : 0,
        icon: cat.icon
      };
    })
      .filter(category => category.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    setExpenseCategories(expenseData);
    setIncomeCategories(incomeData);
  };

  const processFlowData = () => {
    const { start, end } = getDateRange();

    // Filter transactions in the selected period
    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });

    // Create a map for all days in the period with zero values
    const dataByDate = new Map<string, { date: string, income: number, expense: number }>();

    // Initialize all days in the period with zero values
    const currentDate = new Date(start);

    // Loop through each day in the range
    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      dataByDate.set(dateStr, { date: dateStr, income: 0, expense: 0 });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fill in actual transaction data
    periodTransactions.forEach(t => {
      const dateStr = format(new Date(t.date), 'yyyy-MM-dd');
      const entry = dataByDate.get(dateStr);

      // Skip if the date is not in our map (shouldn't happen, but just in case)
      if (!entry) return;

      if (t.type === 'income') {
        entry.income += t.amount;
      } else {
        entry.expense += t.amount;
      }
    });

    // Determine date format based on view period
    const getDateFormat = () => {
      switch (viewPeriod) {
        case 'week':
          return 'EEE dd'; // Mon 01
        case 'month':
          return 'dd'; // 01
        case '3months':
        case '6months':
          return 'MMM dd'; // Jan 01
        case 'year':
          return 'MMM'; // Jan
        default:
          return 'MMM dd';
      }
    };

    // For longer periods, we might want to aggregate data
    let finalData: FlowDataPoint[];

    if (viewPeriod === 'year') {
      // Aggregate by month for yearly view
      const monthlyData = new Map<string, { date: string, income: number, expense: number }>();

      Array.from(dataByDate.entries()).forEach(([dateStr, data]) => {
        const date = new Date(dateStr);
        const monthKey = format(date, 'yyyy-MM');
        const monthLabel = format(date, 'MMM');

        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { date: monthLabel, income: 0, expense: 0 });
        }

        const monthEntry = monthlyData.get(monthKey)!;
        monthEntry.income += data.income;
        monthEntry.expense += data.expense;
      });

      finalData = Array.from(monthlyData.values())
        .map(item => ({
          ...item,
          balance: item.income - item.expense
        }));
    } else {
      // Use daily data for other views
      finalData = Array.from(dataByDate.values())
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(item => ({
          ...item,
          date: format(new Date(item.date), getDateFormat()), // Format date based on period
          balance: item.income - item.expense
        }));
    }

    setFlowData(finalData);
  };

  const handlePreviousMonth = () => {
    setSelectedDate(prev => {
      switch (viewPeriod) {
        case 'week':
          return subWeeks(prev, 1);
        case '3months':
          return subMonths(prev, 3);
        case '6months':
          return subMonths(prev, 6);
        case 'year':
          return subMonths(prev, 12);
        case 'month':
        default:
          return subMonths(prev, 1);
      }
    });
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      switch (viewPeriod) {
        case 'week':
          return addWeeks(prev, 1);
        case '3months':
          return addMonths(prev, 3);
        case '6months':
          return addMonths(prev, 6);
        case 'year':
          return addMonths(prev, 12);
        case 'month':
        default:
          return addMonths(prev, 1);
      }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const { format: dateFormat } = getDateRange();
  const displayedCategories = overviewType === 'expense' ? expenseCategories : incomeCategories;

  // Determine if we're showing a flow chart
  const isFlowView = overviewType === 'income-flow' || overviewType === 'expense-flow';

  // Check if a view period is premium only
  const isPremiumPeriod = (period: ViewPeriod) => {
    return ['3months', '6months', 'year'].includes(period);
  };

  // Show premium upgrade prompt when premium features are accessed
  const showUpgradePrompt = () => {
    toast(
      <div className="flex flex-col gap-2">
        <span className="font-semibold">Upgrade to Premium</span>
        <span className="text-sm">Get access to advanced charts, extended history, and more!</span>
        <Button
          size="sm"
          variant="default"
          className="mt-1 bg-green-600 hover:bg-green-700"
          onClick={() => window.location.href = '/subscription/manage'}
        >
          Upgrade Now
        </Button>
      </div>,
      {
        duration: 5000,
      }
    );
  };

  // Handle period selection with premium check
  const handlePeriodSelect = (period: ViewPeriod) => {
    if (isPremiumPeriod(period) && !hasAdvancedCharts) {
      toast.error("Advanced charts require a premium subscription");
      showUpgradePrompt();
      return;
    }

    setViewPeriod(period);
  };

  // Check if a view type is premium only
  const isPremiumView = (viewType: OverviewType) => {
    return ['income-flow', 'expense-flow'].includes(viewType) && !hasAdvancedCharts;
  };

  // Handle view type selection with premium check
  const handleViewTypeSelect = (viewType: OverviewType) => {
    if (isPremiumView(viewType)) {
      toast.error("Flow charts require a premium subscription");
      showUpgradePrompt();
      return;
    }

    setOverviewType(viewType);
  };

  return (
    <Card className="border dark:border-gray-800">
      <CardContent className="p-6 space-y-8">
        {/* Premium Banner */}
        {!hasAdvancedCharts && (
          <div className="bg-gradient-to-r from-[#1B4332] to-[#2D5F4C] text-white p-4 rounded-lg mb-4 shadow-md border border-[#C9A870]/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Upgrade to Premium</h3>
                <p className="text-sm opacity-90">Get access to advanced charts, flow analysis, and extended history!</p>
              </div>
              <Button
                variant="default"
                size="sm"
                className="bg-[#C9A870] hover:bg-[#D4AF6A] border-none text-[#1B4332] font-semibold"
                onClick={() => window.location.href = '/subscription/manage'}
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Period Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-base font-medium">
              {format(selectedDate, dateFormat)}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              disabled={loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <Filter className="h-4 w-4" />
                  {viewPeriod === 'week' && 'Weekly'}
                  {viewPeriod === 'month' && 'Monthly'}
                  {viewPeriod === '3months' && '3 Months'}
                  {viewPeriod === '6months' && '6 Months'}
                  {viewPeriod === 'year' && 'Yearly'}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handlePeriodSelect('week')}>
                  Weekly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePeriodSelect('month')}>
                  Monthly
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePeriodSelect('3months')}
                  disabled={!hasAdvancedCharts}
                  className="relative"
                >
                  3 Months
                  {!hasAdvancedCharts && (
                    <Lock className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePeriodSelect('6months')}
                  disabled={!hasAdvancedCharts}
                  className="relative"
                >
                  6 Months
                  {!hasAdvancedCharts && (
                    <Lock className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePeriodSelect('year')}
                  disabled={!hasAdvancedCharts}
                  className="relative"
                >
                  Yearly
                  {!hasAdvancedCharts && (
                    <Lock className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 dark:border-gray-800">
            <div className="text-sm text-muted-foreground">Income</div>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <div className="text-xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
            )}
          </div>
          <div className="rounded-lg border p-4 dark:border-gray-800">
            <div className="text-sm text-muted-foreground">Expenses</div>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <div className="text-xl font-bold text-red-500">{formatCurrency(totalExpense)}</div>
            )}
          </div>
          <div className="rounded-lg border p-4 dark:border-gray-800">
            <div className="text-sm text-muted-foreground">Balance</div>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <div className={`text-xl font-bold ${total >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(total)}
              </div>
            )}
          </div>
        </div>
        <AIChatBot />


        {/* Toggle & Chart */}
        <div className="flex flex-col items-center">
          <div className="flex gap-2 mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  {overviewType === 'expense' && 'Expenses'}
                  {overviewType === 'income' && 'Income'}
                  {overviewType === 'expense-flow' && 'Expense Flow'}
                  {overviewType === 'income-flow' && 'Income Flow'}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleViewTypeSelect('expense')}>
                  Expenses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewTypeSelect('income')}>
                  Income
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewTypeSelect('expense-flow')}
                  disabled={!hasAdvancedCharts}
                  className="relative"
                >
                  Expense Flow
                  {!hasAdvancedCharts && (
                    <Lock className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewTypeSelect('income-flow')}
                  disabled={!hasAdvancedCharts}
                  className="relative"
                >
                  Income Flow
                  {!hasAdvancedCharts && (
                    <Lock className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {loading ? (
            <div className="w-full max-w-md h-80 flex items-center justify-center">
              <Skeleton className="h-60 w-60 rounded-full" />
            </div>
          ) : isFlowView ? (
            <div className="w-full h-80">
              <div className="text-center mb-2 font-semibold">
                {overviewType === 'income-flow' ? 'Income Flow' : 'Expense Flow'} - {format(selectedDate, dateFormat)}
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={flowData}
                  margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="incomeColorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="expenseColorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    interval={
                      viewPeriod === 'week' ? 0 :
                        viewPeriod === 'month' ? 2 :
                          viewPeriod === '3months'? 7 :
                           viewPeriod === '6months' ? 15 :
                            viewPeriod === 'year' ? 0 : 2
                    }
                    tickFormatter={(tick) => tick}
                    tickMargin={5}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={(tick) => {
                      if (tick >= 1000) {
                        return `$${(tick / 1000).toFixed(0)}K`;
                      }
                      return `$${tick}`;
                    }}
                    width={60}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 15 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      overviewType === 'income-flow' ? 'Income' : 'Expense'
                    ]}
                    labelFormatter={(label) => {
                      if (viewPeriod === 'year') {
                        return `${label}`;
                      } else if (viewPeriod === '3months' || viewPeriod === '6months') {
                        return label;
                      } else if (viewPeriod === 'week') {
                        return label;
                      } else {
                        return `Day ${label}`;
                      }
                    }}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: 'var(--heritage-green)',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                  />
                  {overviewType === 'income-flow' ? (
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      fill="url(#incomeColorGradient)"
                      name="Income"
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                    />
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      fill="url(#expenseColorGradient)"
                      name="Expense"
                      activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2, fill: '#fff' }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : displayedCategories.length === 0 ? (
            <div className="w-full max-w-md h-80 flex items-center justify-center text-muted-foreground">
              No {overviewType} data for this period
            </div>
          ) : (
            <div className="w-full max-w-md h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayedCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {displayedCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category List - only show for non-flow views */}
        {!isFlowView && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {overviewType === 'expense' ? 'Expense' : 'Income'} Categories
            </h3>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-4 dark:border-gray-800">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))
            ) : displayedCategories.length === 0 ? (
              <div className="text-muted-foreground">
                No {overviewType} categories for this period
              </div>
            ) : (
              displayedCategories.map((category) => (
                <div
                  key={category.name}
                  className="rounded-lg border p-4 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CategoryIconComponent
                          iconId={(category.icon && category.icon.trim() !== '') ? category.icon : "shopping-cart"}
                          size={20}
                          style={{ color: category.color }}
                          className="flex-shrink-0"
                        />
                        <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xl font-bold">
                    {formatCurrency(category.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 