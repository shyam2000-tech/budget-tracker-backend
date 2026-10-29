import jwt from "jsonwebtoken";
import { User } from "../users/user.model";
import { seedDefaultCategories } from "../categories/category.defaults";
import { AppError } from "../../utils/AppError";
import { RegisterDTO, LoginDTO, AuthResponseData } from "./auth.types";

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "supersecret_daily_budget_jwt_key_2026_dev";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions);
};

export class AuthService {
  static async register(dto: RegisterDTO): Promise<AuthResponseData> {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }

    const user = await User.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: dto.password,
      currency: dto.currency || "INR",
      timezone: dto.timezone || "Asia/Kolkata",
    });

    // Seed initial default categories for the new user
    await seedDefaultCategories(user._id);

    const token = generateToken(user._id.toString());

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
      },
      token,
    };
  }

  static async login(dto: LoginDTO): Promise<AuthResponseData> {
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user._id.toString());

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
      },
      token,
    };
  }

  static async getMe(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency,
      timezone: user.timezone,
      createdAt: user.createdAt,
    };
  }
}

