import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { User } from "../modules/users/user.model";

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  timezone: string;
  currency: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError("Authentication required. Please log in.", 401);
    }

    const secret = process.env.JWT_SECRET || "supersecret_daily_budget_jwt_key_2026_dev";
    const decoded = jwt.verify(token, secret) as { id: string };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new AppError("User belonging to this token no longer exists.", 401);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      timezone: user.timezone || "Asia/Kolkata",
      currency: user.currency || "INR",
    };

    next();
  } catch (error) {
    next(error);
  }
};

