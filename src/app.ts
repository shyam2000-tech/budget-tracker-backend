import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import categoryRoutes from "./modules/categories/category.routes";
import expenseRoutes from "./modules/expenses/expense.routes";
import budgetRoutes from "./modules/budgets/budget.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import calendarRoutes from "./modules/calendar/calendar.routes";

import { errorHandler } from "./middleware/errorHandler";
import { AppError } from "./utils/AppError";

dotenv.config();

export const app: Application = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "daily-budget-tracker-backend",
  });
});

// Feature Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/calendar", calendarRoutes);

// Unhandled Route Handler
app.use((req: Request, _res: Response, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);
