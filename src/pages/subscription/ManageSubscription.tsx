import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import { subscriptionService, PaymentHistoryItem, SubscriptionPlan } from '../../services/subscriptionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const ManageSubscription = () => {
  const { subscriptionStatus, refreshSubscription, isPremium } = useSubscription();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  // Dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [cancelType, setCancelType] = useState<'immediate' | 'period-end'>('period-end');
  const [resultMessage, setResultMessage] = useState('');
  const [resultSuccess, setResultSuccess] = useState(true);

  useEffect(() => {
    if (isPremium) {
      fetchPaymentHistory();
    }
    fetchPlans();
  }, [isPremium]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const history = await subscriptionService.getPaymentHistory();
      setPaymentHistory(history);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const availablePlans = await subscriptionService.getPlans();
      // Sort plans by price
      setPlans(availablePlans.sort((a, b) => a.price - b.price));
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  const openCancelDialog = () => {
    setShowCancelDialog(true);
  };

  const handleCancelTypeSelect = () => {
    setShowCancelDialog(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmCancel = async () => {
    setShowConfirmDialog(false);
    setCancelLoading(true);
    
    try {
      const cancelImmediately = cancelType === 'immediate';
      await subscriptionService.cancelSubscription({ cancelImmediately });
      await refreshSubscription();
      
      setResultSuccess(true);
      setResultMessage(
        cancelImmediately 
          ? 'Your subscription has been canceled successfully. Your premium access has ended.'
          : 'Your subscription will be canceled at the end of your billing period. You can continue using premium features until then.'
      );
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      setResultSuccess(false);
      setResultMessage('Failed to cancel subscription. Please try again later.');
    } finally {
      setCancelLoading(false);
      setShowResultDialog(true);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setResumeLoading(true);
      await subscriptionService.resumeSubscription();
      await refreshSubscription();
      setResultSuccess(true);
      setResultMessage('Your subscription has been resumed successfully. You will continue to be billed after the current period.');
      setShowResultDialog(true);
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      setResultSuccess(false);
      setResultMessage('Failed to resume subscription. Please try again later or contact support.');
      setShowResultDialog(true);
    } finally {
      setResumeLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleStartCheckout = async (priceId: string) => {
    try {
      setPlansLoading(true);
      const { url } = await subscriptionService.createSubscription(priceId);
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start checkout:', error);
      window.alert('Failed to start checkout. Please try again later.');
    } finally {
      setPlansLoading(false);
    }
  };

  const getFreeFeatures = () => [
    { name: 'Access to 3 months of data', included: true },
    { name: 'Basic income/expense tracking', included: true },
    { name: 'Core charts', included: true },
    { name: 'Manual entry only', included: true },
    { name: 'Invite-only access', included: true },
    { name: 'Full historical data access', included: false },
    { name: 'Date picker for any time range', included: false },
    { name: 'Auto-categorization', included: false },
    { name: 'Advanced chart filtering', included: false },
    { name: 'Priority support', included: false },
    { name: 'Budgeting challenges', included: false },
  ];

  const getPremiumFeatures = () => [
    { name: 'Access to 3 months of data', included: true },
    { name: 'Basic income/expense tracking', included: true },
    { name: 'Core charts', included: true },
    { name: 'Manual entry only', included: true },
    { name: 'Invite-only access', included: true },
    { name: 'Full historical data access', included: true },
    { name: 'Date picker for any time range', included: true },
    { name: 'Auto-categorization', included: true },
    { name: 'Advanced chart filtering', included: true },
    { name: 'Priority support', included: true },
    { name: 'Budgeting challenges', included: true },
  ];

  const renderPlansSection = () => {
    const monthlyPlan = plans.find(p => p.billing_cycle === 'monthly' && p.name !== 'Free');
    const yearlyPlan = plans.find(p => p.billing_cycle === 'yearly');
    const freePlan = plans.find(p => p.name === 'Free');
    
    if (!freePlan || (!monthlyPlan && !yearlyPlan)) {
      if (plansLoading) {
        return (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Loading plans...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          </div>
        );
      }
      return <p>No plans available at this time.</p>;
    }

    return (
      <div className="my-8">
        <h2 className="text-3xl font-bold text-center mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground text-center mb-8">
          Select the plan that works best for your needs
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan Card */}
          <Card className={cn(
            "border-2",
            "border-muted",
            isPremium ? "opacity-75" : ""
          )}>
            <CardHeader>
              <CardTitle className="text-xl">Free Tier</CardTitle>
              <CardDescription>For casual users</CardDescription>
              <div className="mt-2">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {getFreeFeatures().map((feature, i) => (
                  <li key={i} className="flex items-start">
                    {feature.included ? (
                      <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 mr-2 mt-0.5 text-gray-300 shrink-0" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground"}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isPremium ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Premium Plans */}
          <div>
            <Card className={cn(
              "border-2",
              "border-primary",
              isPremium ? "" : ""
            )}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Moniflow+</CardTitle>
                    <CardDescription>Premium experience</CardDescription>
                  </div>
                  {isPremium && (
                    <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      Current Plan
                    </div>
                  )}
                </div>
                
                <Tabs 
                  defaultValue={billingPeriod} 
                  className="mt-4" 
                  onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'yearly')}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">
                      Yearly
                      <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                        Save 33%
                      </span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="monthly" className="mt-2">
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${monthlyPlan?.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="yearly" className="mt-2">
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${yearlyPlan?.price}</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {getPremiumFeatures().map((feature, i) => (
                    <li key={i} className="flex items-start">
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 mr-2 mt-0.5 text-green-500 shrink-0" />
                      ) : (
                        <X className="h-5 w-5 mr-2 mt-0.5 text-red-500 shrink-0" />
                      )}
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                {isPremium ? (
                  subscriptionStatus?.subscription.status === 'active' && 
                  !subscriptionStatus?.subscription.cancelAtPeriodEnd ? (
                    <Button 
                      className="w-full" 
                      variant="destructive" 
                      disabled={cancelLoading}
                      onClick={openCancelDialog}
                    >
                      {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      disabled={resumeLoading}
                      onClick={handleResumeSubscription}
                    >
                      {resumeLoading ? 'Resuming...' : 'Resume Subscription'}
                    </Button>
                  )
                ) : (
                  <Button 
                    className="w-full" 
                    disabled={plansLoading}
                    onClick={() => {
                      const plan = billingPeriod === 'monthly' ? monthlyPlan : yearlyPlan;
                      if (plan) {
                        handleStartCheckout(plan.stripe_price_id);
                      }
                    }}
                  >
                    {plansLoading ? 'Processing...' : 'Upgrade Now'}
                  </Button>
                )}
              </CardFooter>
            </Card>
            
            {isPremium && subscriptionStatus?.subscription.cancelAtPeriodEnd && (
              <p className="text-sm text-muted-foreground mt-3 text-center">
                Your subscription is scheduled to end on {formatDate(subscriptionStatus?.subscription.currentPeriodEnd)}.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/dashboard" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Manage Subscription</h1>
      </div>

      <div className="grid gap-6">
        {/* Plan Comparison Section */}
        {renderPlansSection()}

        {/* Current Plan Details Card - Only show if premium */}
        {isPremium && (
          <Card>
            <CardHeader>
              <CardTitle>Current Plan Details</CardTitle>
              <CardDescription>Your subscription details</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionStatus ? (
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Billing Period</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(subscriptionStatus.subscription.currentPeriodStart)} - {formatDate(subscriptionStatus.subscription.currentPeriodEnd)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm">
                        {subscriptionStatus.subscription.status === 'active' ? (
                          subscriptionStatus.subscription.cancelAtPeriodEnd ? (
                            <span className="text-amber-500 font-medium">
                              Active (Cancels on {formatDate(subscriptionStatus.subscription.currentPeriodEnd)})
                            </span>
                          ) : (
                            <span className="text-green-500 font-medium">Active</span>
                          )
                        ) : subscriptionStatus.subscription.status === 'canceled' ? (
                          <span className="text-amber-500 font-medium">
                            Canceled (Ended on {formatDate(subscriptionStatus.subscription.currentPeriodEnd)})
                          </span>
                        ) : (
                          <span className="text-red-500 font-medium">
                            {subscriptionStatus.subscription.status.charAt(0).toUpperCase() + 
                            subscriptionStatus.subscription.status.slice(1)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Loading subscription data...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {isPremium && (
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent payments</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Loading payment history...</p>
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="divide-y">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{payment.subscriptions.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${payment.amount.toFixed(2)}</p>
                          <p className={`text-sm ${
                            payment.status === 'succeeded' 
                              ? 'text-green-500' 
                              : payment.status === 'pending' 
                                ? 'text-amber-500' 
                                : 'text-red-500'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-6 text-gray-500 dark:text-gray-400">No payment history found.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Please select how you would like to cancel your subscription:
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Please select how you would like to cancel your subscription:
            </p>
            <Select value={cancelType} onValueChange={(value) => setCancelType(value as 'immediate' | 'period-end')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select cancellation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="period-end">Cancel at end of billing period</SelectItem>
                <SelectItem value="immediate">Cancel immediately</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-4 p-4 rounded-md bg-muted">
              {cancelType === 'period-end' ? (
                <div>
                  <h4 className="font-medium mb-1">Cancel at end of billing period</h4>
                  <p className="text-sm text-muted-foreground">
                    Your subscription will remain active until the end of your current billing period 
                    on {formatDate(subscriptionStatus?.subscription.currentPeriodEnd)}.
                    You'll retain access to all premium features until then.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-1">Cancel immediately</h4>
                  <p className="text-sm text-muted-foreground">
                    Your subscription will be canceled immediately and you'll lose access to premium features right away.
                    This action cannot be undone.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Back
            </Button>
            <Button onClick={handleCancelTypeSelect}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Cancellation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              {cancelType === 'immediate' 
                ? 'Are you sure you want to cancel your subscription immediately? Your access to premium features will end now.'
                : 'Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.'}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              No, keep subscription
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={cancelLoading}>
              {cancelLoading ? 'Canceling...' : 'Yes, cancel subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resultSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {resultSuccess ? 'Subscription Updated' : 'Error'}
            </DialogTitle>
            <DialogDescription>
              {resultMessage}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSubscription; 