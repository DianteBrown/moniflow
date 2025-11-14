import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, X, Building2, List, ChartPie } from "lucide-react";
import { Transaction, CreateTransactionData } from "@/services/transactionService";
import { Category } from "@/services/categoryService";
import { format, getMonth, getYear } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SpendingChart from "@/components/visualizations/SpendingChart";
import BankAccounts from "./BankAccounts";
import EditTransactionModal from "./EditTransactionModal";
import DeleteTransactionDialog from "./DeleteTransactionDialog";
import { Tag, TrendingUp } from "lucide-react";
import AddTransactionModal from "./AddTransactionModal";
import TransactionList from "./TransactionList";

interface TransactionDashboardProps {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  isRefreshing?: boolean;
  onRefreshTransactions?: () => void;
  onCreateTransaction?: (transactionData: CreateTransactionData) => void; // Add this
  onUpdateTransaction?: (transaction: Transaction) => void; // Add this
  onDeleteTransaction?: (transactionId: string) => void; // Add this
}


export default function TransactionDashboard({
  transactions,
  categories,
  loading,
  isRefreshing = false,
  onRefreshTransactions,
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}: TransactionDashboardProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'bank-accounts' | 'list' | 'chart'>('bank-accounts');
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBankFilterOpen, setIsBankFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
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
    let hasManualTransactions = false;

    transactions.forEach(transaction => {
      if (transaction.bank_info?.institution_name) {
        banks.add(transaction.bank_info.institution_name);
      } else if (transaction.is_manual_created) {
        hasManualTransactions = true;
      }
    });

    const bankList = Array.from(banks).sort();
    if (hasManualTransactions) {
      bankList.unshift('No Bank');
    }

    return bankList;
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
      filteredTransactions = filteredTransactions.filter(t => {
        if (selectedBanks.includes('No Bank')) {
          // Include manual transactions (no bank info)
          if (t.is_manual_created && !t.bank_info?.institution_name) {
            return true;
          }
        }
        // Include transactions from selected banks
        return t.bank_info?.institution_name && selectedBanks.includes(t.bank_info.institution_name);
      });
    }

    // Filter by selected types
    if (selectedTypes.length > 0) {
      filteredTransactions = filteredTransactions.filter(t =>
        selectedTypes.includes(t.type)
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
        const aCategory = categories.find(cat => cat.id === a.category_id)?.name || 'Unknown Category';
        const bCategory = categories.find(cat => cat.id === b.category_id)?.name || 'Unknown Category';
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

  // Update the clearAllFilters function:
  const clearAllFilters = () => {
    setSelectedBanks([]);
    setSelectedCategories([]);
    setSelectedTypes([]);
  };
  const onEditClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const onDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };
  const hasActiveFilters = selectedBanks.length > 0 || selectedCategories.length > 0 || selectedTypes.length > 0;
  return (
    <Card className="border dark:border-gray-800">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-3 sm:space-y-0">
        <div>
          <CardTitle>Financial Dashboard</CardTitle>
          <CardDescription>Track your spending, manage bank accounts, and analyze your financial patterns</CardDescription>
        </div>
        <div className="flex items-start sm:items-center gap-2 w-full sm:w-auto flex-wrap">


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
                  className="mb-4 p-6 border rounded-lg bg-muted/50 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg">Filter Transactions</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setShowFilters(false)}
                        className="text-white hover:text-gray-300 p-3"
                      >
                        <X className="h-8 w-8" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bank Filter - Dropdown Style */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        Bank Accounts
                      </h5>
                      <Popover open={isBankFilterOpen} onOpenChange={setIsBankFilterOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal"
                          >
                            {selectedBanks.length === 0
                              ? "All Banks"
                              : selectedBanks.length === 1
                                ? selectedBanks[0]
                                : `${selectedBanks.length} banks selected`
                            }
                            <Building2 className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Select Banks</h4>
                                {selectedBanks.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedBanks([])}
                                    className="text-xs text-white hover:text-gray-300"
                                  >
                                    Clear All
                                  </Button>
                                )}
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {availableBanks.length > 0 ? (
                                  availableBanks.map((bank) => (
                                    <div
                                      key={bank}
                                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedBanks.includes(bank)
                                        ? ''
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                      style={selectedBanks.includes(bank) ? {backgroundColor: 'var(--heritage-cream)', color: 'var(--heritage-green)'} : {}}
                                      onClick={() => toggleBankFilter(bank)}
                                    >
                                      <span className="text-sm font-medium">{bank}</span>
                                      <span className="text-xs text-white bg-gray-600 dark:bg-gray-700 px-2 py-1 rounded-full">
                                        {bank === 'No Bank'
                                          ? transactions.filter(t => t.is_manual_created && !t.bank_info?.institution_name).length
                                          : transactions.filter(t => t.bank_info?.institution_name === bank).length
                                        }
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No bank accounts found</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Category Filter - Dropdown Style */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <Tag className="h-4 w-4 mr-2" />
                        Categories
                      </h5>
                      <Popover open={isCategoryFilterOpen} onOpenChange={setIsCategoryFilterOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal"
                          >
                            {selectedCategories.length === 0
                              ? "All Categories"
                              : selectedCategories.length === 1
                                ? categories.find(c => c.id === selectedCategories[0])?.name || "Selected"
                                : `${selectedCategories.length} categories selected`
                            }
                            <Tag className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Select Categories</h4>
                                {selectedCategories.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCategories([])}
                                    className="text-xs text-white hover:text-gray-300"
                                  >
                                    Clear All
                                  </Button>
                                )}
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {availableCategories.length > 0 ? (
                                  availableCategories.map((category) => (
                                    <div
                                      key={category.id}
                                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedCategories.includes(category.id)
                                        ? ''
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                      style={selectedCategories.includes(category.id) ? {backgroundColor: 'var(--heritage-cream)', color: 'var(--heritage-green)'} : {}}
                                      onClick={() => toggleCategoryFilter(category.id)}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: category.color }}
                                        />
                                        <span className="text-sm font-medium">{category.name}</span>
                                      </div>
                                      <span className="text-xs text-white bg-gray-600 dark:bg-gray-700 px-2 py-1 rounded-full">
                                        {transactions.filter(t => t.category_id === category.id).length}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No categories found</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Transaction Type Filter - Dropdown Style */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Transaction Type
                      </h5>
                      <Popover open={isTypeFilterOpen} onOpenChange={setIsTypeFilterOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between text-left font-normal"
                          >
                            {selectedTypes.length === 0
                              ? "All Types"
                              : selectedTypes.length === 1
                                ? selectedTypes[0] === 'income' ? 'Income' : 'Expenses'
                                : `${selectedTypes.length} types selected`
                            }
                            <TrendingUp className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <div className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Select Types</h4>
                                {selectedTypes.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTypes([])}
                                    className="text-xs hover:opacity-80"
                                    style={{color: 'var(--heritage-green)'}}
                                  >
                                    Clear All
                                  </Button>
                                )}
                              </div>
                              <div className="space-y-2">
                                <div
                                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedTypes.includes('income')
                                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                  onClick={() => toggleTypeFilter('income')}
                                >
                                  <span className="text-sm font-medium">Income</span>
                                  <span className="text-xs text-white bg-gray-600 dark:bg-gray-700 px-2 py-1 rounded-full">
                                    {transactions.filter(t => t.type === 'income').length}
                                  </span>
                                </div>
                                <div
                                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedTypes.includes('expense')
                                    ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                  onClick={() => toggleTypeFilter('expense')}
                                >
                                  <span className="text-sm font-medium">Expenses</span>
                                  <span className="text-xs text-white bg-gray-600 dark:bg-gray-700 px-2 py-1 rounded-full">
                                    {transactions.filter(t => t.type === 'expense').length}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {hasActiveFilters && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {filteredAndSortedTransactions.length} of {transactions.length} transactions
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <TransactionList
              transactions={filteredAndSortedTransactions}
              categories={categories}
              loading={loading}
              isRefreshing={isRefreshing}
              onAddClick={() => setIsAddModalOpen(true)}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
            />
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            {loading ? (
              <div className="h-[400px]">
                <div className="h-full w-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
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
            <BankAccounts onRefresh={onRefreshTransactions} availablePeriods={availablePeriods} selectedPeriod={selectedPeriod} onPeriodChange={setSelectedPeriod} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        onAddTransaction={(transactionData) => {
          if (onCreateTransaction) {
            onCreateTransaction(transactionData);
          }
          setIsAddModalOpen(false);
        }}
        categories={categories}
      />
      {selectedTransaction && (
        <EditTransactionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
          }}
          onEditTransaction={(updatedTransaction) => {
            if (onUpdateTransaction) {
              onUpdateTransaction(updatedTransaction);
            }
            setIsEditModalOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          categories={categories}
        />
      )}

      {transactionToDelete && (
        <DeleteTransactionDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTransactionToDelete(null);
          }}
          onConfirm={() => {
            if (onDeleteTransaction && transactionToDelete) {
              onDeleteTransaction(transactionToDelete.id);
            }
            setIsDeleteModalOpen(false);
            setTransactionToDelete(null);
          }}
          transaction={transactionToDelete}
        />
      )}
    </Card>
  );
} 