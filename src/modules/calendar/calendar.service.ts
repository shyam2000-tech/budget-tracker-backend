import { Types } from "mongoose";
import { Expense } from "../expenses/expense.model";
import { getMonthBoundaries, getDayBoundaries } from "../../utils/date";
import { CalendarMonthResponse } from "./calendar.types";

export class CalendarService {
  static async getMonthCalendar(
    userId: string,
    yearInput?: number,
    monthInput?: number,
    tzOffsetMinutes = 0
  ): Promise<CalendarMonthResponse> {
    const { start, end, year, month } = getMonthBoundaries(
      yearInput,
      monthInput,
      tzOffsetMinutes
    );

    const userObjectId = new Types.ObjectId(userId);

    const aggregation = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          type: "expense", // Exclude income from calendar spending badges
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
          totalSpendingPaise: { $sum: "$amountPaise" },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const days: Record<string, { date: string; totalSpendingPaise: number; transactionCount: number }> = {};
    let monthlyTotalPaise = 0;

    for (const item of aggregation) {
      days[item._id] = {
        date: item._id,
        totalSpendingPaise: item.totalSpendingPaise,
        transactionCount: item.transactionCount,
      };
      monthlyTotalPaise += item.totalSpendingPaise;
    }

    return {
      year,
      month,
      days,
      monthlyTotalPaise,
    };
  }

  static async getDayTransactions(
    userId: string,
    dateStr: string,
    tzOffsetMinutes = 0
  ) {
    const { start, end } = getDayBoundaries(dateStr, tzOffsetMinutes);
    const userObjectId = new Types.ObjectId(userId);

    const transactions = await Expense.find({
      userId: userObjectId,
      date: { $gte: start, $lte: end },
    })
      .sort({ date: -1, createdAt: -1 })
      .populate("categoryId", "name icon color")
      .lean();

    const totalExpensePaise = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amountPaise, 0);

    const totalIncomePaise = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amountPaise, 0);

    return {
      date: dateStr,
      totalExpensePaise,
      totalIncomePaise,
      transactions,
    };
  }
}

