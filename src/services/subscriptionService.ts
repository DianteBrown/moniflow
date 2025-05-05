import api from './api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  stripe_price_id: string;
  features: {
    data_access_months: number | null;
    auto_categorization: boolean;
    advanced_charts: boolean;
    priority_support: boolean;
    budgeting_challenges: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'free';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: UserSubscription;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending';
  created_at: string;
  subscriptions: {
    name: string;
    price: number;
    billing_cycle: string;
  };
}

class SubscriptionService {
  /**
   * Get available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await api.get('/subscriptions/plans');
    return response.data.subscriptions;
  }

  /**
   * Create a subscription 
   */
  async createSubscription(priceId: string): Promise<{sessionId: string, url: string}> {
    const response = await api.post('/subscriptions/create', { priceId });
    return response.data;
  }

  /**
   * Get current subscription status
   */
  async getStatus(): Promise<SubscriptionStatus> {
    const response = await api.get('/subscriptions/status');
    return response.data;
  }

  /**
   * Cancel current subscription
   */
  async cancelSubscription(options?: { cancelImmediately: boolean }): Promise<{message: string, willEndAt: string}> {
    const response = await api.post('/subscriptions/cancel', options);
    return response.data;
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(): Promise<PaymentHistoryItem[]> {
    const response = await api.get('/subscriptions/history');
    return response.data.payments;
  }

  /**
   * Check if a specific feature is available in the current subscription
   */
  hasFeatureAccess(subscription: SubscriptionStatus | null, featureName: string): boolean {
    if (!subscription) return false;
    
    const features = subscription.subscription.plan.features;
    return features && features[featureName as keyof typeof features] === true;
  }

  /**
   * Get data access limit in months
   */
  getDataAccessLimit(subscription: SubscriptionStatus | null): number | null {
    if (!subscription) return 3; // Default to 3 months for non-subscribers
    
    const features = subscription.subscription.plan.features;
    return features.data_access_months;
  }

  /**
   * Check if the user has unlimited data access
   */
  hasUnlimitedDataAccess(subscription: SubscriptionStatus | null): boolean {
    if (!subscription) return false;
    
    const dataAccessMonths = subscription.subscription.plan.features.data_access_months;
    return dataAccessMonths === null; // null means unlimited
  }

  /**
   * Resume a subscription that was scheduled to be canceled at period end
   */
  async resumeSubscription(): Promise<{message: string}> {
    const response = await api.post('/subscriptions/resume');
    return response.data;
  }
}

export const subscriptionService = new SubscriptionService(); 