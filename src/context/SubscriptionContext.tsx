import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscriptionService, SubscriptionStatus } from '../services/subscriptionService';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  hasFeature: (featureName: string) => boolean;
  isDataAccessLimited: () => boolean;
  dataAccessMonths: number | null;
  isPremium: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [dataAccessMonths, setDataAccessMonths] = useState<number | null>(3); // Default to 3 months

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await subscriptionService.getStatus();
      setSubscriptionStatus(status);
      setIsPremium(status.hasActiveSubscription);
      
      // Set data access limit
      const accessLimit = subscriptionService.getDataAccessLimit(status);
      setDataAccessMonths(accessLimit);
    } catch (err: unknown) {
      console.error('Failed to fetch subscription status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription status');
      // Fallback to free user status
      setIsPremium(false);
      setDataAccessMonths(3);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if user is authenticated (token exists)
    const token = localStorage.getItem('token');
    if (token) {
      fetchSubscriptionStatus();
    } else {
      setLoading(false);
      setSubscriptionStatus(null);
      setIsPremium(false);
      setDataAccessMonths(3);
    }
    
    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue) {
          fetchSubscriptionStatus();
        } else {
          setSubscriptionStatus(null);
          setIsPremium(false);
          setDataAccessMonths(3);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshSubscription = async () => {
    await fetchSubscriptionStatus();
  };

  const hasFeature = (featureName: string): boolean => {
    return subscriptionService.hasFeatureAccess(subscriptionStatus, featureName);
  };

  const isDataAccessLimited = (): boolean => {
    return !subscriptionService.hasUnlimitedDataAccess(subscriptionStatus);
  };

  const value = {
    subscriptionStatus,
    loading,
    error,
    refreshSubscription,
    hasFeature,
    isDataAccessLimited,
    dataAccessMonths,
    isPremium
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use the subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 