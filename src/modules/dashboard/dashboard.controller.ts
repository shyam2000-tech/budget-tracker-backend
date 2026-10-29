import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";

export class DashboardController {
  static getOverview = asyncHandler(async (req: Request, res: Response) => {
    const tzOffset = req.headers["x-timezone-offset"]
      ? parseInt(req.headers["x-timezone-offset"] as string, 10)
      : 0;

    const data = await DashboardService.getOverview(req.user!.id, tzOffset);
    return sendSuccess(res, data, "Dashboard overview retrieved successfully");
  });

  static getDaySummary = asyncHandler(async (req: Request, res: Response) => {
    const tzOffset = req.headers["x-timezone-offset"]
      ? parseInt(req.headers["x-timezone-offset"] as string, 10)
      : 0;

    const date = req.query.date as string | undefined;
    const data = await DashboardService.getDaySummary(req.user!.id, date, tzOffset);
    return sendSuccess(res, data, "Daily spending summary retrieved successfully");
  });

  static getMonthSummary = asyncHandler(async (req: Request, res: Response) => {
    const tzOffset = req.headers["x-timezone-offset"]
      ? parseInt(req.headers["x-timezone-offset"] as string, 10)
      : 0;

    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
    const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;

    const data = await DashboardService.getMonthSummary(
      req.user!.id,
      year,
      month,
      tzOffset
    );
    return sendSuccess(res, data, "Monthly spending summary retrieved successfully");
  });
}

