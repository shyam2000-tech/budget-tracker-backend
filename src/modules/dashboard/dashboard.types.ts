export interface CategorySpending {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  totalPaise: number;
  percentage: number;
}

export interface DaySpendingSummary {
  date: string;
  totalExpensePaise: number;
  totalIncomePaise: number;
  transactionCount: number;
  categoryBreakdown: CategorySpending[];
}

export interface MonthSpendingSummary {
  year: number;
  month: number;
  totalExpensePaise: number;
  totalIncomePaise: number;
  netSavingsPaise: number;
  dailyAveragePaise: number;
  categoryBreakdown: CategorySpending[];
  dailyTrend: { date: string; totalPaise: number }[];
}

export interface DashboardOverview {
  todayExpensePaise: number;
  monthExpensePaise: number;
  monthIncomePaise: number;
  netSavingsPaise: number;
  recentTransactions: any[];
  topCategories: CategorySpending[];
  budgetSummary: {
    totalBudgetPaise: number;
    totalSpentPaise: number;
    percentageConsumed: number;
  } | null;
}

