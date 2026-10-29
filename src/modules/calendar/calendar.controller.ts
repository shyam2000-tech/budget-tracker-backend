import { Request, Response } from "express";
import { CalendarService } from "./calendar.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export class CalendarController {
  static getMonthCalendar = asyncHandler(async (req: Request, res: Response) => {
    const tzOffset = req.headers["x-timezone-offset"]
      ? parseInt(req.headers["x-timezone-offset"] as string, 10)
      : 0;

    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;

    const calendar = await CalendarService.getMonthCalendar(
      req.user!.id,
      year,
      month,
      tzOffset
    );

    return sendSuccess(res, calendar, "Calendar monthly data retrieved successfully");
  });

  static getDayTransactions = asyncHandler(async (req: Request, res: Response) => {
    const tzOffset = req.headers["x-timezone-offset"]
      ? parseInt(req.headers["x-timezone-offset"] as string, 10)
      : 0;

    const dateStr = req.query.date as string;
    if (!dateStr) {
      throw new AppError("Date query parameter 'date' (YYYY-MM-DD) is required", 400);
    }

    const dayData = await CalendarService.getDayTransactions(
      req.user!.id,
      dateStr,
      tzOffset
    );

    return sendSuccess(res, dayData, "Day transactions retrieved successfully");
  });
}

