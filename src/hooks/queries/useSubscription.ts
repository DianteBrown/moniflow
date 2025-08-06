import { useQuery } from '@tanstack/react-query';
import { subscriptionService, SubscriptionStatus } from '@/services/subscriptionService';

// Query keys
export const subscriptionKeys = {
  all: ['subscription'] as const,
  status: () => [...subscriptionKeys.all, 'status'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  history: () => [...subscriptionKeys.all, 'history'] as const,
}

// Hook for subscription status
export function useSubscription() {
  return useQuery({
    queryKey: subscriptionKeys.status(),
    queryFn: () => subscriptionService.getStatus(),
    // Cache configuration
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 3,
    refetchOnWindowFocus: false,
  });
}

// Helper functions to check feature access
export function useHasFeatureAccess(featureName: keyof SubscriptionStatus['subscription']['plan']['features']) {
  const { data: subscriptionStatus } = useSubscription();
  
  if (!subscriptionStatus) return false;
  
  return subscriptionService.hasFeatureAccess(subscriptionStatus, featureName);
}

// Helper to get data access limit
export function useDataAccessLimit() {
  const { data: subscriptionStatus } = useSubscription();
  
  return subscriptionService.getDataAccessLimit(subscriptionStatus || null);
}

// Specialized hook for advanced charts feature
export function useHasAdvancedCharts() {
  return useHasFeatureAccess('advanced_charts');
} 