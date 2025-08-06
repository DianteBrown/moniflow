import { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { subscriptionService, SubscriptionPlan } from '../../services/subscriptionService';
import { useSubscription } from '../../context/SubscriptionContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const PricingPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const { subscriptionStatus, refreshSubscription } = useSubscription();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const plansData = await subscriptionService.getPlans();
        setPlans(plansData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      setProcessingPlanId(plan.id);
      
      // Check if user is already subscribed to this plan
      if (subscriptionStatus?.hasActiveSubscription && 
          subscriptionStatus.subscription.plan.id === plan.id) {
        // Already subscribed
        return;
      }
      
      const { url } = await subscriptionService.createSubscription(plan.stripe_price_id);
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (err) {
      console.error('Failed to create subscription:', err);
      setError('Failed to process subscription. Please try again later.');
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await subscriptionService.cancelSubscription();
      await refreshSubscription();
      setShowCancelDialog(false);
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError('Failed to cancel subscription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to filter plans by billing period
  const getFilteredPlans = (period: 'monthly' | 'yearly') => {
    return plans.filter(plan => 
      plan.billing_cycle === period || plan.name === 'Free' // Always include free plan
    ).sort((a, b) => a.price - b.price); // Sort by price
  };

  // Feature list for display
  const renderFeatures = (plan: SubscriptionPlan) => {
    const features = [
      {
        name: 'Data history',
        value: plan.features.data_access_months === null ? 'Unlimited' : `${plan.features.data_access_months} months`,
        included: true
      },
      {
        name: 'Income/expense tracking',
        value: 'Basic',
        included: true
      },
      {
        name: 'Core charts',
        value: '',
        included: true
      },
      {
        name: 'Auto-categorization',
        value: '',
        included: plan.features.auto_categorization
      },
      {
        name: 'Advanced chart filtering',
        value: '',
        included: plan.features.advanced_charts
      },
      {
        name: 'Priority support',
        value: '',
        included: plan.features.priority_support
      },
      {
        name: 'Budgeting challenges',
        value: '',
        included: plan.features.budgeting_challenges
      }
    ];
    
    return (
      <ul className="space-y-4 mt-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            {feature.included ? (
              <CheckCircle className="h-5 w-5 mr-3 text-green-500 shrink-0" />
            ) : (
              <X className="h-5 w-5 mr-3 text-gray-300 shrink-0" />
            )}
            <div>
              <p className={cn(
                "font-medium",
                !feature.included && "text-muted-foreground"
              )}>
                {feature.name}
              </p>
              {feature.value && (
                <p className="text-sm text-muted-foreground">
                  {feature.value}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Price comparison for display
  const monthlyPlans = getFilteredPlans('monthly');
  const yearlyPlans = getFilteredPlans('yearly');
  const yearlyPrices = yearlyPlans.find(p => p.name === 'Premium')?.price || 0;
  const monthlyPrices = monthlyPlans.find(p => p.name === 'Premium')?.price || 0;
  const savingsPercent = monthlyPrices > 0 ? Math.round(100 - ((yearlyPrices / 12) * 100) / monthlyPrices) : 0;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the plan that works best for your needs
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6" role="alert">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Current subscription status */}
      {subscriptionStatus?.hasActiveSubscription && (
        <Card className="mb-8 bg-secondary/30">
          <CardHeader>
            <CardTitle className="text-xl">Your Subscription</CardTitle>
            <CardDescription>
              {subscriptionStatus.subscription.cancelAtPeriodEnd
                ? `Your subscription will end on ${new Date(subscriptionStatus.subscription.currentPeriodEnd || '').toLocaleDateString()}`
                : `Your subscription will renew on ${new Date(subscriptionStatus.subscription.currentPeriodEnd || '').toLocaleDateString()}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`rounded-full px-2 py-0.5 text-xs font-semibold ${'bg-gradient-to-r from-amber-400 to-amber-600 text-black'}`}>
                Premium
              </div>
              <p className="text-sm text-muted-foreground">
                ${subscriptionStatus.subscription.plan.price}/{subscriptionStatus.subscription.plan.billing_cycle}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/subscription/manage">
                  Manage Subscription
                </Link>
              </Button>
              {!subscriptionStatus.subscription.cancelAtPeriodEnd && (
                <Button variant="outline" className="text-destructive" onClick={() => setShowCancelDialog(true)}>
                    Cancel Subscription
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}

      <Tabs defaultValue="monthly" className="mb-8">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              {savingsPercent > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                  Save {savingsPercent}%
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {monthlyPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative overflow-hidden transition-all",
                  subscriptionStatus?.subscription?.plan?.id === plan.id && "border-2 border-primary"
                )}
              >
                {subscriptionStatus?.subscription?.plan?.id === plan.id && (
                  <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6">
                    <div className="bg-primary text-primary-foreground py-1 px-8 rotate-45 transform origin-bottom-right text-xs font-medium">
                      Current
                    </div>
                  </div>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.name === 'Free' ? 'For casual users' : 'Premium experience'}
                  </CardDescription>
                  {plan.price > 0 ? (
                    <div className="mt-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.billing_cycle}</span>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$0</span>
                      <span className="text-muted-foreground">/forever</span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  {renderFeatures(plan)}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full"
                    variant={plan.price > 0 ? "default" : "outline"}
                    disabled={processingPlanId === plan.id || 
                            (subscriptionStatus?.hasActiveSubscription && 
                             subscriptionStatus.subscription.plan.id === plan.id)}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {processingPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : subscriptionStatus?.hasActiveSubscription && subscriptionStatus.subscription.plan.id === plan.id ? (
                      'Current Plan'
                    ) : plan.price === 0 ? (
                      'Free Plan'
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="yearly">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {yearlyPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative overflow-hidden transition-all",
                  subscriptionStatus?.subscription?.plan?.id === plan.id && "border-2 border-primary"
                )}
              >
                {subscriptionStatus?.subscription?.plan?.id === plan.id && (
                  <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6">
                    <div className="bg-primary text-primary-foreground py-1 px-8 rotate-45 transform origin-bottom-right text-xs font-medium">
                      Current
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    {plan.name === 'Free' ? 'For casual users' : 'Premium experience'}
                  </CardDescription>
                  {plan.price > 0 ? (
                    <div className="mt-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.billing_cycle}</span>
                      {savingsPercent > 0 && plan.billing_cycle === 'yearly' && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Save {savingsPercent}% compared to monthly
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <span className="text-3xl font-bold">$0</span>
                      <span className="text-muted-foreground">/forever</span>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  {renderFeatures(plan)}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full"
                    variant={plan.price > 0 ? "default" : "outline"}
                    disabled={processingPlanId === plan.id || 
                             (subscriptionStatus?.hasActiveSubscription && 
                              subscriptionStatus.subscription.plan.id === plan.id)}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {processingPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : subscriptionStatus?.hasActiveSubscription && subscriptionStatus.subscription.plan.id === plan.id ? (
                      'Current Plan'
                    ) : plan.price === 0 ? (
                      'Free Plan'
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscribe
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period on {new Date(subscriptionStatus?.subscription.currentPeriodEnd || '').toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingPage; 