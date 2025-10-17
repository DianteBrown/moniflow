import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { transactionKeys } from '@/hooks/queries/useTransactions';
import { categoryKeys } from '@/hooks/queries/useCategories';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Simple inline Badge component
const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
);
import {
  Building2,
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { plaidService, ConnectedBank, PlaidAccountInfo } from "@/services/plaidService";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaidLink } from "react-plaid-link";
import { useQueryClient } from "@tanstack/react-query";

interface BankAccountsProps {
  onRefresh?: () => void;
  availablePeriods: { value: string; label: string }[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const BankAccountSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 p-4 border rounded-lg">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

const AccountCard = ({ account }: { account: PlaidAccountInfo }) => {
  const formatBalance = (balance: number | null) => {
    if (balance === null) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(balance);
  };

  const getAccountIcon = (type: string, subtype: string) => {
    if (type === 'credit' || subtype === 'credit card') {
      return <CreditCard className="h-5 w-5 text-blue-600" />;
    }
    return <DollarSign className="h-5 w-5 text-green-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getAccountIcon(account.type, account.subtype)}
          <div>
            <h4 className="font-medium">{account.name}</h4>
            <p className="text-sm text-muted-foreground">
              {account.official_name || account.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {account.type} • {account.subtype} • ****{account.mask}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {formatBalance(account.balance_current)}
          </p>
          {account.balance_available !== null && account.balance_available !== account.balance_current && (
            <p className="text-sm text-muted-foreground">
              Available: {formatBalance(account.balance_available)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const BankCard = ({ bank }: {
  bank: ConnectedBank;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{bank.institution_name}</h3>
            <p className="text-sm text-muted-foreground">
              Connected {new Date(bank.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(bank.status)}>
            {getStatusIcon(bank.status)}
            <span className="ml-1 capitalize">{bank.status}</span>
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {bank.error_message && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  {bank.error_message}
                </AlertDescription>
              </Alert>
            )}

            {bank.plaid_accounts && bank.plaid_accounts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Accounts</h4>
                <div className="space-y-2">
                  {bank.plaid_accounts.map((account) => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </div>
            )}

            {bank.last_successful_update && (
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(bank.last_successful_update).toLocaleString()}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function BankAccounts({ onRefresh, availablePeriods, selectedPeriod, onPeriodChange }: BankAccountsProps) {
  const [banks, setBanks] = useState<ConnectedBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const fetchBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await plaidService.getConnectedBanks();
      setBanks(response.banks);
    } catch (err) {
      console.error('Error fetching banks:', err);
      setError('Failed to load connected banks');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaid = async () => {
    // Prevent multiple simultaneous connections
    if (isLoading || linkToken) {
      console.log('Plaid connection already in progress');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating link token...');
      const response = await plaidService.createLinkToken();
      console.log('Link token received:', response);
      setLinkToken(response.link_token);
    } catch (error) {
      console.error('Error creating link token:', error);
      toast.error('Failed to initialize Plaid connection');
      setIsLoading(false);
      setLinkToken(null); // Reset link token on error
    }
  };

  const onPlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      console.log('Plaid Link Success:', { publicToken, metadata });

      // Exchange public token for access token
      const response = await plaidService.exchangePublicToken(publicToken, metadata.institution.institution_id);
      console.log('Exchange response:', response);

      toast.success('Bank account connected successfully!');

      setLinkToken(null);
      setIsLoading(false);

      // Start syncing transactions
      await syncPlaidTransactions();

    } catch (error: any) {
      console.error('Error exchanging public token:', error);

      // Handle specific error cases
      if (error.response?.status === 400 && error.response?.data?.message) {
        const errorMessage = error.response.data.message;

        if (errorMessage === 'This account is already connected') {
          toast.error('This account is already connected. Please try connecting a different account.');
        } else {
          console.log(`Failed to connect bank account: ${errorMessage}`);
        }
      } else {
        console.log('Failed to connect bank account. Please try again.');
      }

      setIsLoading(false);
      setLinkToken(null); // Reset link token on error
    }
  };

  const syncPlaidTransactions = async () => {
    try {
      setIsSyncing(true);
      toast.loading('Syncing transactions from your bank...', { id: 'sync-transactions' });

      // Sync transactions from all connected banks
      const syncResult = await plaidService.syncAllBanks();
      console.log('Sync result:', syncResult);

      // Count the number of transactions synced
      const totalSynced = syncResult.results?.reduce((total: number, result: any) => total + (result.added || 0), 0) || 0;
      console.log('Total synced:', totalSynced, 'Results:', syncResult.results);

      // Invalidate and refetch transactions to show the new ones
      await queryClient.invalidateQueries({
        queryKey: transactionKeys.all
      });

      // Also invalidate categories cache to show new categories created during sync
      await queryClient.invalidateQueries({
        queryKey: categoryKeys.all
      });

      // Also refresh the bank accounts list
      await fetchBanks();

      // Notify parent component to refresh
      onRefresh?.();

      // if (totalSynced > 0) {
      //   toast.success(`Successfully synced ${totalSynced} transactions!`, {
      //     id: 'sync-transactions'
      //   });
      // } else {
      //   toast.success('Bank account connected! No new transactions to sync.', {
      //     id: 'sync-transactions'
      //   });
      // }
      toast.success('Successfully synced transactions!');

    } catch (error) {
      toast.error('Failed to sync transactions from bank', {
        id: 'sync-transactions'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const onPlaidExit = (error: any, metadata: any) => {
    console.log('Plaid Link Exit:', { error, metadata });
    console.log('Exit reason:', error?.error_code || 'No error code');
    console.log('Metadata:', metadata);

    if (error) {
      console.error('Plaid Link error:', error);
      // Provide more specific error messages
      if (error.error_code === 'USER_EXIT') {
        toast.error('Bank connection was cancelled. Please try again if you want to connect your bank.');
      } else if (error.error_code === 'INSTITUTION_ERROR') {
        toast.error('There was an issue with your bank. Please try again or contact support.');
      } else if (error.error_code === 'INVALID_REQUEST') {
        toast.error('Invalid request. Please refresh the page and try again.');
      } else {
        toast.error(`Bank connection failed: ${error.error_message || 'Unknown error'}. Please try again.`);
      }
    } else {
      // User closed without error - might be accidental
      toast.info('Bank connection was closed. Click "Connect Bank" to try again.');
    }
    setLinkToken(null);
    setIsLoading(false);
  };
  const config = {
    token: linkToken,
    onSuccess: async (publicToken: string, metadata: any) => {
      // Handle successful connection
      console.log('Bank connected successfully:', metadata);
      // Call your backend to exchange the public token
      const response = await plaidService.exchangePublicToken(publicToken, metadata.institution?.institution_id);
      console.log('Exchange response:', response);
    },
    onExit: (err: any) => {
      // Handle user exit or errors
      if (err) {
        console.error('Plaid Link error:', err);
      }
    },
    // Add this for OAuth support
    receivedRedirectUri: window.location.href.includes('/oauth/plaid/callback')
      ? window.location.href
      : undefined,
  };
  const { open, ready } = usePlaidLink({
    ...config
  });
  useEffect(() => {
    if (linkToken && ready) {
      console.log('Opening Plaid Link...');
      // Add a small delay to ensure the modal opens properly
      setTimeout(() => {
        open();
      }, 100);
    }
  }, [linkToken, ready, open]);
  useEffect(() => {
    fetchBanks();
  }, []);

  // Cleanup function to reset state when component unmounts
  useEffect(() => {
    return () => {
      if (linkToken) {
        setLinkToken(null);
        setIsLoading(false);
      }
    };
  }, [linkToken]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <BankAccountSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-red-800 dark:text-red-300">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Loading overlay when Plaid is connecting */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <h3 className="text-lg font-semibold">Connecting to Bank</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please complete the bank connection process. Do not close this window or click outside the connection dialog.
            </p>
            <div className="text-xs text-muted-foreground mb-4">
              If the connection dialog doesn't appear, please refresh the page and try again.
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLinkToken(null);
                  setIsLoading(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLinkToken(null);
                  setIsLoading(false);
                  setTimeout(() => handlePlaid(), 500);
                }}
                className="flex-1"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bank Account Management</h3>
          <p className="text-sm text-muted-foreground">
            Connect and manage your bank accounts for automatic transaction import
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedPeriod}
            onValueChange={onPeriodChange}
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
          <Button
            className="items-center gap-2"
            onClick={handlePlaid}
            disabled={isLoading || isSyncing}
          >
            <CreditCard className="h-4 w-4" />
            {isLoading ? 'Connecting...' : isSyncing ? 'Syncing...' : 'Connect Bank'}
          </Button>
        </div>
      </div>

      {banks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">No Bank Accounts Connected</CardTitle>
            <CardDescription className="text-center mb-4">
              Get started by connecting your bank accounts to automatically import and categorize your transactions.
            </CardDescription>

          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {banks.map((bank) => (
              <BankCard
                key={bank.id}
                bank={bank}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
