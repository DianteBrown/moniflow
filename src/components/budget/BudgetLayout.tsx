import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, Receipt, BarChart3 } from "lucide-react";
import BudgetGoalSection from "./BudgetGoalSection";
import TransactionsSection from "./TransactionsSection";
import AnalysisSection from "./AnalysisSection";
import { useQueryClient } from "@tanstack/react-query";
import { transactionKeys } from "@/hooks/queries/useTransactions";
import { categoryKeys } from "@/hooks/queries/useCategories";
import { format } from "date-fns";
import { budgetGoalKeys } from "@/hooks/queries/useBudgetGoals";
import { subscriptionKeys } from "@/hooks/queries/useSubscription";
import { subscriptionService } from "@/services/subscriptionService";

export default function BudgetLayout() {
  const [activeTab, setActiveTab] = useState("transactions");
  const queryClient = useQueryClient();

  // Prefetch data for all tabs when the component mounts
  useEffect(() => {
    // Prefetch subscription status
    queryClient.prefetchQuery({
      queryKey: subscriptionKeys.status(),
      queryFn: () => subscriptionService.getStatus(),
      staleTime: 60 * 60 * 1000, // 1 hour
    });
    
    // Prefetch transactions data
    queryClient.prefetchQuery({
      queryKey: transactionKeys.list(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
    
    // Prefetch transaction summary
    queryClient.prefetchQuery({
      queryKey: transactionKeys.summary('all_time'),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
    
    // Prefetch categories
    queryClient.prefetchQuery({
      queryKey: categoryKeys.list(),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Prefetch current month budget goals
    const currentMonth = format(new Date(), 'yyyy-MM');
    queryClient.prefetchQuery({
      queryKey: budgetGoalKeys.month(currentMonth),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [queryClient]);

  return (
    <Tabs
      defaultValue="transactions"
      className="w-full space-y-6"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-3 h-14">
        <TabsTrigger value="transactions" className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          <span className="hidden sm:inline">Transactions</span>
        </TabsTrigger>
        <TabsTrigger value="budget-goals" className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          <span className="hidden sm:inline">Budget Goals</span>
        </TabsTrigger>
        <TabsTrigger value="analysis" className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <span className="hidden sm:inline">Analysis</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="transactions" className="space-y-4">
        <TransactionsSection />
      </TabsContent>

      <TabsContent value="budget-goals" className="space-y-4">
        <BudgetGoalSection />
      </TabsContent>

      <TabsContent value="analysis" className="space-y-4">
        <AnalysisSection />
      </TabsContent>
    </Tabs>
  );
} 