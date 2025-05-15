import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit2, Trash2 } from "lucide-react";
import { Transaction } from "@/services/transactionService";
import { Category } from "@/services/categoryService";
import { format, getMonth, getYear } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpendingChart from "@/components/visualizations/SpendingChart";

interface TransactionDashboardProps {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  isRefreshing?: boolean;
  onAddClick: () => void;
  onEditClick: (transaction: Transaction) => void;
  onDeleteClick: (transaction: Transaction) => void;
}

const TransactionSkeleton = () => (
  <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800">
    <div className="flex items-start gap-3">
      <Skeleton className="w-3 h-3 rounded-full mt-1.5" />
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <Skeleton className="h-5 w-20" />
      <div className="flex gap-1">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </div>
);

export default function TransactionDashboard({
  transactions,
  categories,
  loading,
  isRefreshing = false,
  onAddClick,
  onEditClick,
  onDeleteClick
}: TransactionDashboardProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'chart' | 'list'>('list');

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  // Get available periods
  const availablePeriods = useMemo(() => {
    const periods = new Set<string>();
    
    // Add each month-year combination from transactions
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = getMonth(date);
      const year = getYear(date);
      periods.add(`${month}-${year}`);
    });
    
    // Convert to array and sort chronologically
    const periodsList = Array.from(periods)
      .map(period => {
        const [month, year] = period.split('-').map(Number);
        return {
          value: period,
          label: format(new Date(year, month, 1), 'MMMM yyyy'),
          timestamp: new Date(year, month, 1).getTime()
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    return [
      { value: 'all', label: 'All Time' },
      ...periodsList
    ];
  }, [transactions]);

  const getFilteredTransactions = () => {
    let filteredTransactions = [...transactions];
    
    // Filter by selected month-year (if not 'all')
    if (selectedPeriod !== 'all') {
      const [selectedMonth, selectedYear] = selectedPeriod.split('-').map(Number);
      
      filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return getMonth(date) === selectedMonth && getYear(date) === selectedYear;
      });
    }

    return filteredTransactions.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return sortOrder === 'desc' 
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
    });
  };

  const filteredAndSortedTransactions = getFilteredTransactions();

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <Card className="border dark:border-gray-800">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-3 sm:space-y-0">
        <div>
          <CardTitle>Transactions & Analysis</CardTitle>
          <CardDescription>Manage and analyze your financial activities</CardDescription>
        </div>
        <div className="flex items-start sm:items-center gap-2 w-full sm:w-auto">
          <Select
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {availablePeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeTab === 'list' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('date')}
                className={`${sortBy === 'date' ? 'bg-muted' : ''} flex-1 sm:flex-none`}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort('amount')}
                className={`${sortBy === 'amount' ? 'bg-muted' : ''} flex-1 sm:flex-none`}
              >
                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </>
          )}
          <Button 
            onClick={onAddClick} 
            size="sm"
            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 h-9 rounded-lg transition-all flex-1 sm:flex-none"
          >
            <div className="flex items-center justify-center">
              <div className="p-1 rounded-full bg-green-500/20 dark:bg-green-500/30">
                <PlusCircle className="h-3.5 w-3.5" />
              </div>
              <span className="ml-1.5 font-medium">Add</span>
            </div>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'chart' | 'list')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex-1">Transaction List</TabsTrigger>
            <TabsTrigger value="chart" className="flex-1">Spending Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <TransactionSkeleton key={i} />
                ))}
              </div>
            ) : filteredAndSortedTransactions.length === 0 ? (
              <div className="text-center py-4">
                {selectedPeriod === 'all' 
                  ? "No transactions found"
                  : `No transactions found for ${availablePeriods.find(p => p.value === selectedPeriod)?.label}`
                }
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="sync" initial={false}>
                  {filteredAndSortedTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800 hover:bg-muted/50 transition-colors group"
                      style={{ overflow: "hidden" }}
                    >
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-3 h-3 rounded-full mt-1.5" 
                          style={{ backgroundColor: getCategoryColor(transaction.category_id) }} 
                        />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{getCategoryName(transaction.category_id)}</span>
                            <span>•</span>
                            <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <motion.p 
                          className={`font-medium ${
                            transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                          }`}
                          animate={{ opacity: isRefreshing ? 0.5 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </motion.p>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => onEditClick(transaction)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onDeleteClick(transaction)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            {loading ? (
              <div className="h-[400px]">
                <Skeleton className="h-full w-full rounded-lg" />
              </div>
            ) : (
              <SpendingChart 
                transactions={transactions}
                categories={categories}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                availablePeriods={availablePeriods}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 