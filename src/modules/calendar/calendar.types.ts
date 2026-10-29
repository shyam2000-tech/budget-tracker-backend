export interface CalendarDaySummary {
  date: string; // YYYY-MM-DD
  totalSpendingPaise: number;
  transactionCount: number;
}

export interface CalendarMonthResponse {
  year: number;
  month: number;
  days: Record<string, CalendarDaySummary>;
  monthlyTotalPaise: number;
}

