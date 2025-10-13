import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, X, Building2, List, ChartPie } from "lucide-react";
import { Transaction } from "@/services/transactionService";
import { Category } from "@/services/categoryService";
import { format, getMonth, getYear } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SpendingChart from "@/components/visualizations/SpendingChart";
import BankAccounts from "./BankAccounts";

interface TransactionDashboardProps {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  isRefreshing?: boolean;
  onRefreshTransactions?: () => void;
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
  onRefreshTransactions
}: TransactionDashboardProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'bank-accounts' | 'list' | 'chart'>('bank-accounts');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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

  // Get available banks from transactions
  const availableBanks = useMemo(() => {
    const banks = new Set<string>();
    transactions.forEach(transaction => {
      if (transaction.bank_info?.institution_name) {
        banks.add(transaction.bank_info.institution_name);
      }
    });
    return Array.from(banks).sort();
  }, [transactions]);

  // Get available categories
  const availableCategories = useMemo(() => {
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const getFilteredTransactions = () => {
    let filteredTransactions = [...transactions];

    // Filter by selected month-year (if not 'all')
    if (selectedPeriod !== 'all') {
      const [selectedMonth, selectedYear] = selectedPeriod.split('-').map(Number);

      filteredTransactions = filteredTransactions.filter(t => {
        const date = new Date(t.date);
        return getMonth(date) === selectedMonth && getYear(date) === selectedYear;
      });
    }

    // Filter by selected banks
    if (selectedBanks.length > 0) {
      filteredTransactions = filteredTransactions.filter(t => 
        t.bank_info?.institution_name && selectedBanks.includes(t.bank_info.institution_name)
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filteredTransactions = filteredTransactions.filter(t => 
        selectedCategories.includes(t.category_id)
      );
    }

    return filteredTransactions.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount;
      } else if (sortBy === 'description') {
        return sortOrder === 'desc'
          ? b.description.localeCompare(a.description)
          : a.description.localeCompare(b.description);
      } else if (sortBy === 'category') {
        const aCategory = getCategoryName(a.category_id);
        const bCategory = getCategoryName(b.category_id);
        return sortOrder === 'desc'
          ? bCategory.localeCompare(aCategory)
          : aCategory.localeCompare(bCategory);
      }
      return 0;
    });
  };

  const filteredAndSortedTransactions = getFilteredTransactions();


  const toggleBankFilter = (bank: string) => {
    setSelectedBanks(prev => 
      prev.includes(bank) 
        ? prev.filter(b => b !== bank)
        : [...prev, bank]
    );
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAllFilters = () => {
    setSelectedBanks([]);
    setSelectedCategories([]);
  };

  const hasActiveFilters = selectedBanks.length > 0 || selectedCategories.length > 0;

  return (
    <Card className="border dark:border-gray-800">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-3 sm:space-y-0">
        <div>
          <CardTitle>Transactions & Analysis</CardTitle>
          <CardDescription>Manage and analyze your financial activities</CardDescription>
        </div>
        <div className="flex items-start sm:items-center gap-2 w-full sm:w-auto flex-wrap">
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
                onClick={() => setShowFilters(!showFilters)}
                className={`${hasActiveFilters ? 'bg-muted' : ''} flex-1 sm:flex-none`}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {selectedBanks.length + selectedCategories.length}
                  </Badge>
                )}
              </Button>
              
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as 'date' | 'amount' | 'description' | 'category')}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex-1 sm:flex-none"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'bank-accounts' | 'list' | 'chart')}>
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger value="bank-accounts" className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <span className="hidden sm:inline">Bank Accounts</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-5 w-5" />
              <span className="hidden sm:inline">Transaction List</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <ChartPie className="h-5 w-5" />
              <span className="hidden sm:inline">Spending Analysis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 p-4 border rounded-lg bg-muted/50 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filter Transactions</h4>
                    <div className="flex items-center gap-2">
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank Filters */}
                    {availableBanks.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Filter by Bank</h5>
                        <div className="flex flex-wrap gap-2">
                          {availableBanks.map((bank) => (
                            <Button
                              key={bank}
                              variant={selectedBanks.includes(bank) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleBankFilter(bank)}
                              className="text-xs"
                            >
                              {bank}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Filters */}
                    {availableCategories.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Filter by Category</h5>
                        <div className="flex flex-wrap gap-2">
                          {availableCategories.map((category) => (
                            <Button
                              key={category.id}
                              variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleCategoryFilter(category.id)}
                              className="text-xs flex items-center gap-1"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <TransactionSkeleton key={i} />
                ))}
              </div>
            ) : filteredAndSortedTransactions.length === 0 ? (
              <div className="text-center py-4">
                {hasActiveFilters ? (
                  <div>
                    <p>No transactions match your current filters.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : selectedPeriod === 'all' ? (
                  "No transactions found"
                ) : (
                  `No transactions found for ${availablePeriods.find(p => p.value === selectedPeriod)?.label}`
                )}
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
                            {transaction.bank_info && (
                              <>
                                <span className="text-blue-600 font-medium">  
                                  {transaction.bank_info.institution_name} - {transaction.bank_info.account_name}
                                </span>
                                <span>:</span>
                              </>
                            )}
                            <span>{getCategoryName(transaction.category_id)}</span>
                            <span>•</span>
                            <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>

                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <motion.p
                          className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                            }`}
                          animate={{ opacity: isRefreshing ? 0.5 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </motion.p>
                        {/* <div className="flex gap-1">
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
                        </div> */}
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

          <TabsContent value="bank-accounts" className="mt-4">
            <BankAccounts onRefresh={onRefreshTransactions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 