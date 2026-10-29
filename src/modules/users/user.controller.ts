import { Request, Response } from "express";
import { User } from "./user.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export class UserController {
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!.id).select("-password");
    if (!user) throw new AppError("User not found", 404);
    return sendSuccess(res, user, "User profile retrieved");
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const { name, currency, timezone } = req.body;
    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError("User not found", 404);

    if (name) user.name = name;
    if (currency) user.currency = currency;
    if (timezone) user.timezone = timezone;

    await user.save();
    return sendSuccess(res, {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency,
      timezone: user.timezone,
    }, "Profile updated successfully");
  });
}

