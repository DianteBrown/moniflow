import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { transactionKeys } from '@/hooks/queries/useTransactions';
import { categoryKeys } from '@/hooks/queries/useCategories';
import { useBankAccounts, useDisconnectBank, useRemoveBank, bankAccountKeys } from '@/hooks/queries/useBankAccounts';

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { plaidService } from "@/services/plaidService";
import { AnimatePresence } from "framer-motion";
import { usePlaidLink } from "react-plaid-link";
import { useQueryClient } from "@tanstack/react-query";
import BankCard from "./BankCard";

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

export default function BankAccounts({ onRefresh, availablePeriods, selectedPeriod, onPeriodChange }: BankAccountsProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'connecting' | 'syncing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDisconnected, setShowDisconnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // React Query hooks
  const { data: banksData, isLoading: loading, error } = useBankAccounts();
  const disconnectBankMutation = useDisconnectBank();
  const removeBankMutation = useRemoveBank();
  const queryClient = useQueryClient();

  const banks = banksData?.banks || [];
  const handlePlaid = async (accessToken?: string) => {
    // Prevent multiple simultaneous connections
    if (syncStatus === 'connecting' || linkToken) {
      console.log('Plaid connection already in progress');
      return;
    }

    try {
      setSyncStatus('connecting');
      setErrorMessage(null);
      console.log('Creating link token...');
      const response = await plaidService.createLinkToken(accessToken);
      console.log('Link token received:', response);
      setLinkToken(response.link_token);
    } catch (error) {
      console.error('Error creating link token:', error);
      setSyncStatus('error');
      setErrorMessage('Failed to initialize Plaid connection');
      toast.error('Failed to initialize Plaid connection');
      setLinkToken(null); // Reset link token on error
    }
  };


  // Disconnect bank handler
  const handleDisconnectBank = async (bankId: string) => {
    console.log('Disconnecting bank with ID:', bankId);
    if (!bankId) {
      console.error('Invalid bank ID');
      return;
    }
    try {
      await disconnectBankMutation.mutateAsync(bankId);
      // ✅ Force component refresh
      setRefreshKey(prev => prev + 1);
      toast.success('Bank disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect bank');
    }
  };

  // Remove bank handler
  const handleRemoveBank = async (bankId: string) => {
    console.log('Removing bank with ID:', bankId);
    if (!bankId) {
      throw new Error('Invalid bank ID');
    }
    
    try {
      await removeBankMutation.mutateAsync(bankId);
      // ✅ Force component refresh
      setRefreshKey(prev => prev + 1);
      toast.success('Bank and all associated data permanently deleted');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove bank');
      throw error; // Re-throw so BankCard knows it failed
    }
  };

  const handleReconnectBank = async (bankId: string) => {
    console.log('Reconnecting bank with ID:', bankId);
    if (!bankId) {
      toast.error('Invalid bank ID');
      return;
    }
    try {
      // Find the bank to get its access token
      const bank = banks.find(b => b.id === bankId);
      if (!bank) {
        toast.error('Bank not found');
        return;
      }

      // For removed banks, don't pass access_token (it's cleared)
      // For disconnected banks, use existing access_token for update mode
      const accessToken = bank.status === 'removed' ? undefined : bank.access_token;
      
      if (bank.status === 'disconnected' && !accessToken) {
        toast.error('Bank access token not found. Please remove and re-add this bank.');
        return;
      }

      // Pass the access token (or undefined for removed banks)
      const response = await plaidService.createLinkToken(accessToken);
      setLinkToken(response.link_token);
      setSyncStatus('connecting');
    } catch (error) {
      console.error('Reconnect error:', error);
      toast.error('Failed to reconnect bank');
    }
  };

  const config = {
    token: linkToken,
    onSuccess: async (publicToken: string, metadata: any) => {
      try {
        console.log('Plaid Link Success:', { publicToken, metadata });

        // Exchange public token for access token
        const response = await plaidService.exchangePublicToken(publicToken, metadata.institution.institution_id);
        console.log('Exchange response:', response);

        setSyncStatus('syncing');
        setLinkToken(null);

        // Sync transactions from all connected banks
        const syncResult = await plaidService.syncAllBanks();
        console.log('Sync result:', syncResult);

        // ✅ Invalidate and refetch ALL relevant data
        await Promise.all([
          // Refresh transactions
          queryClient.invalidateQueries({
            queryKey: transactionKeys.all
          }),
          // Refresh categories
          queryClient.invalidateQueries({
            queryKey: categoryKeys.all
          }),
          // ✅ Refresh bank accounts (this will update the status)
          queryClient.invalidateQueries({
            queryKey: bankAccountKeys.all
          })
        ]);

        // ✅ Force refetch bank accounts to ensure UI updates
        await queryClient.refetchQueries({
          queryKey: bankAccountKeys.all
        });

        // Notify parent component to refresh
        onRefresh?.();

        // ✅ Force component refresh
        setRefreshKey(prev => prev + 1);

        setSyncStatus('success');
        toast.success('Bank connected • Transactions synced');

        // Close modal after success
        setTimeout(() => {
          setSyncStatus('idle');
          setErrorMessage(null);
        }, 500);

      } catch (error: any) {
        console.error('Error exchanging public token:', error);

        // Handle specific error cases
        let errorMsg = 'Failed to connect bank account. Please try again.';
        if (error.response?.status === 400 && error.response?.data?.message) {
          const errorMessage = error.response.data.message;
          const responseData = error.response.data;

          if (responseData.alreadyLinked || errorMessage === 'This bank is already connected') {
            errorMsg = 'This bank is already linked to your account.';
          } else if (responseData.wasRemoved) {
            errorMsg = 'This bank was previously removed. Please add it as a new connection.';
          } else {
            errorMsg = `Failed to connect bank account: ${errorMessage}`;
          }
        }

        setSyncStatus('error');
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setLinkToken(null); // Reset link token on error
      }
    },
    onExit: (error: any, metadata: any) => {
      console.log('Plaid Link Exit:', { error, metadata });
      console.log('Exit reason:', error?.error_code || 'No error code');
      console.log('Metadata:', metadata);

      if (error) {
        console.error('Plaid Link error:', error);
        // Provide more specific error messages
        let errorMsg = `Bank connection failed: ${error.error_message || 'Unknown error'}. Please try again.`;
        if (error.error_code === 'USER_EXIT') {
          errorMsg = 'Bank connection was cancelled. Please try again if you want to connect your bank.';
        } else if (error.error_code === 'INSTITUTION_ERROR') {
          errorMsg = 'There was an issue with your bank. Please try again or contact support.';
        } else if (error.error_code === 'INVALID_REQUEST') {
          errorMsg = 'Invalid request. Please refresh the page and try again.';
        }

        setSyncStatus('error');
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      } else {
        // User closed without error - might be accidental
        setSyncStatus('idle');
        toast.info('Bank connection was closed. Click "Connect Bank" to try again.');
      }
      setLinkToken(null);
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

  // Cleanup function to reset state when component unmounts
  useEffect(() => {
    return () => {
      if (linkToken) {
        setLinkToken(null);
        setSyncStatus('idle');
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
          Failed to load connected banks
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Enhanced modal for bank connection and sync */}
      {(syncStatus === 'connecting' || syncStatus === 'syncing' || syncStatus === 'error') && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {syncStatus === 'syncing' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : syncStatus === 'error' ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              )}
              <h3 id="modal-title" className="text-lg font-semibold">
                {syncStatus === 'connecting' && 'Connecting to Bank'}
                {syncStatus === 'syncing' && 'Syncing Transactions'}
                {syncStatus === 'error' && 'Connection Error'}
              </h3>
            </div>

            {syncStatus === 'connecting' && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Please complete the bank connection process. Do not close this window or click outside the connection dialog.
                </p>
                <div className="text-xs text-muted-foreground mb-4">
                  If the connection dialog doesn't appear, please refresh the page and try again.
                </div>
              </>
            )}

            {syncStatus === 'syncing' && (
              <p className="text-sm text-muted-foreground mb-4">
                Syncing transactions from your bank account. This may take a few moments...
              </p>
            )}

            {syncStatus === 'error' && (
              <div className="mb-4">
                <p className="text-sm text-red-600 mb-2">
                  {errorMessage || 'An error occurred during bank connection.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  You can try again or cancel to close this dialog.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLinkToken(null);
                  setSyncStatus('idle');
                  setErrorMessage(null);
                }}
                className="flex-1"
                autoFocus={false}
              >
                Cancel
              </Button>
              {syncStatus === 'error' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLinkToken(null);
                    setSyncStatus('idle');
                    setErrorMessage(null);
                    setTimeout(() => handlePlaid(), 500);
                  }}
                  className="flex-1"
                  autoFocus={false}
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Bank Account Management</h3>
          <p className="text-sm text-muted-foreground">
            Connect and manage your bank accounts for automatic transaction import
          </p>
          {banks.some(bank => bank.status !== 'active') && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisconnected(!showDisconnected)}
                className="text-xs"
              >
                {showDisconnected ? 'Hide' : 'Show'} disconnected banks
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Select
            value={selectedPeriod}
            onValueChange={onPeriodChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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
            className="items-center gap-2 w-full sm:w-auto"
            onClick={() => handlePlaid()}
            disabled={syncStatus === 'connecting' || syncStatus === 'syncing'}
          >
            <CreditCard className="h-4 w-4" />
            {syncStatus === 'connecting' ? 'Connecting...' : syncStatus === 'syncing' ? 'Syncing...' : 'Connect Bank'}
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
          <AnimatePresence mode="wait">
            {banks
              .filter(bank => showDisconnected || bank.status === 'active')
              .map((bank) => (
                <BankCard
                  key={`${bank.id}-${bank.status}-${refreshKey}`}
                  bank={bank}
                  onDisconnect={handleDisconnectBank}
                  onRemove={handleRemoveBank}
                  onReconnect={handleReconnectBank}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
