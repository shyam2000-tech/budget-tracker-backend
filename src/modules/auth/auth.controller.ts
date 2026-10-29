import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    setAuthCookie(res, result.token);
    return sendSuccess(res, result, "User registered successfully", 201);
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);
    setAuthCookie(res, result.token);
    return sendSuccess(res, result, "Logged in successfully", 200);
  });

  static logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("token");
    return sendSuccess(res, null, "Logged out successfully", 200);
  });

  static getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError("Unauthorized", 401);
    }
    const user = await AuthService.getMe(req.user.id);
    return sendSuccess(res, user, "Current user profile fetched successfully", 200);
  });
}

