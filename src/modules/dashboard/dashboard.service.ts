import { Types } from "mongoose";
import { Expense } from "../expenses/expense.model";
import { Budget } from "../budgets/budget.model";
import { getDayBoundaries, getMonthBoundaries } from "../../utils/date";
import {
  DaySpendingSummary,
  MonthSpendingSummary,
  DashboardOverview,
  CategorySpending,
} from "./dashboard.types";

export class DashboardService {
  static async getDaySummary(
    userId: string,
    dateInput?: string,
    tzOffsetMinutes = 0
  ): Promise<DaySpendingSummary> {
    const { start, end, dateStr } = getDayBoundaries(dateInput, tzOffsetMinutes);

    const userObjectId = new Types.ObjectId(userId);

    // Aggregate category-wise expenses for the day
    const [expensesAgg, incomeAgg, transactionCount] = await Promise.all([
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "expense",
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            totalPaise: { $sum: "$amountPaise" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $sort: { totalPaise: -1 } },
      ]),

      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "income",
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$amountPaise" },
          },
        },
      ]),

      Expense.countDocuments({
        userId: userObjectId,
        date: { $gte: start, $lte: end },
      }),
    ]);

    const totalExpensePaise = expensesAgg.reduce(
      (sum, item) => sum + item.totalPaise,
      0
    );
    const totalIncomePaise = incomeAgg[0]?.totalIncome || 0;

    const categoryBreakdown: CategorySpending[] = expensesAgg.map((item) => ({
      categoryId: item._id.toString(),
      name: item.category.name,
      color: item.category.color,
      icon: item.category.icon,
      totalPaise: item.totalPaise,
      percentage:
        totalExpensePaise > 0
          ? Number(((item.totalPaise / totalExpensePaise) * 100).toFixed(1))
          : 0,
    }));

    return {
      date: dateStr,
      totalExpensePaise,
      totalIncomePaise,
      transactionCount,
      categoryBreakdown,
    };
  }

  static async getMonthSummary(
    userId: string,
    yearInput?: number,
    monthInput?: number,
    tzOffsetMinutes = 0
  ): Promise<MonthSpendingSummary> {
    const { start, end, year, month } = getMonthBoundaries(
      yearInput,
      monthInput,
      tzOffsetMinutes
    );

    const userObjectId = new Types.ObjectId(userId);

    const [expensesAgg, incomeAgg, dailyAgg] = await Promise.all([
      // Category breakdown for expenses
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "expense",
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            totalPaise: { $sum: "$amountPaise" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $sort: { totalPaise: -1 } },
      ]),

      // Income sum for the month
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "income",
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$amountPaise" },
          },
        },
      ]),

      // Daily trend of spending across the month
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "expense",
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
                timezone: "UTC",
              },
            },
            totalPaise: { $sum: "$amountPaise" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalExpensePaise = expensesAgg.reduce(
      (sum, item) => sum + item.totalPaise,
      0
    );
    const totalIncomePaise = incomeAgg[0]?.totalIncome || 0;
    const netSavingsPaise = totalIncomePaise - totalExpensePaise;

    // Number of days in the requested month
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyAveragePaise = Math.round(totalExpensePaise / daysInMonth);

    const categoryBreakdown: CategorySpending[] = expensesAgg.map((item) => ({
      categoryId: item._id.toString(),
      name: item.category.name,
      color: item.category.color,
      icon: item.category.icon,
      totalPaise: item.totalPaise,
      percentage:
        totalExpensePaise > 0
          ? Number(((item.totalPaise / totalExpensePaise) * 100).toFixed(1))
          : 0,
    }));

    const dailyTrend = dailyAgg.map((item) => ({
      date: item._id,
      totalPaise: item.totalPaise,
    }));

    return {
      year,
      month,
      totalExpensePaise,
      totalIncomePaise,
      netSavingsPaise,
      dailyAveragePaise,
      categoryBreakdown,
      dailyTrend,
    };
  }

  static async getOverview(
    userId: string,
    tzOffsetMinutes = 0
  ): Promise<DashboardOverview> {
    const userObjectId = new Types.ObjectId(userId);
    const { start: todayStart, end: todayEnd } = getDayBoundaries(
      undefined,
      tzOffsetMinutes
    );
    const { start: monthStart, end: monthEnd, year, month } = getMonthBoundaries(
      undefined,
      undefined,
      tzOffsetMinutes
    );

    const monthStr = `${year}-${String(month).padStart(2, "0")}`;

    const [
      todayExpenseAgg,
      monthExpenseAgg,
      monthIncomeAgg,
      recentTransactions,
      topCategoriesAgg,
      monthlyBudget,
    ] = await Promise.all([
      // Today total expense
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "expense",
            date: { $gte: todayStart, $lte: todayEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amountPaise" } } },
      ]),

      // Month total expense
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "expense",
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amountPaise" } } },
      ]),

      // Month total income
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "income",
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amountPaise" } } },
      ]),

      // Recent 5 transactions
      Expense.find({ userId: userObjectId })
        .sort({ date: -1, createdAt: -1 })
        .limit(5)
        .populate("categoryId", "name icon color")
        .lean(),

      // Top 5 categories this month
      Expense.aggregate([
        {
          $match: {
            userId: userObjectId,
            type: "expense",
            date: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            totalPaise: { $sum: "$amountPaise" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        { $sort: { totalPaise: -1 } },
        { $limit: 5 },
      ]),

      // Overall monthly budget if set
      Budget.findOne({
        userId: userObjectId,
        period: "monthly",
        applicablePeriod: monthStr,
        categoryId: null,
      }).lean(),
    ]);

    const todayExpensePaise = todayExpenseAgg[0]?.total || 0;
    const monthExpensePaise = monthExpenseAgg[0]?.total || 0;
    const monthIncomePaise = monthIncomeAgg[0]?.total || 0;
    const netSavingsPaise = monthIncomePaise - monthExpensePaise;

    const topCategories: CategorySpending[] = topCategoriesAgg.map((item) => ({
      categoryId: item._id.toString(),
      name: item.category.name,
      color: item.category.color,
      icon: item.category.icon,
      totalPaise: item.totalPaise,
      percentage:
        monthExpensePaise > 0
          ? Number(((item.totalPaise / monthExpensePaise) * 100).toFixed(1))
          : 0,
    }));

    let budgetSummary = null;
    if (monthlyBudget) {
      budgetSummary = {
        totalBudgetPaise: monthlyBudget.limitPaise,
        totalSpentPaise: monthExpensePaise,
        percentageConsumed:
          monthlyBudget.limitPaise > 0
            ? Number(((monthExpensePaise / monthlyBudget.limitPaise) * 100).toFixed(1))
            : 0,
      };
    }

    return {
      todayExpensePaise,
      monthExpensePaise,
      monthIncomePaise,
      netSavingsPaise,
      recentTransactions,
      topCategories,
      budgetSummary,
    };
  }
}

