import { Document, Types } from "mongoose";

export type BudgetPeriod = "daily" | "monthly";

export interface IBudget extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  categoryId?: Types.ObjectId | null;
  period: BudgetPeriod;
  limitPaise: number;
  applicablePeriod: string; // "YYYY-MM-DD" for daily, "YYYY-MM" for monthly
  alertThreshold: number; // e.g. 80 for 80%
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBudgetDTO {
  categoryId?: string | null;
  period: BudgetPeriod;
  limitPaise: number;
  applicablePeriod: string; // "YYYY-MM-DD" for daily or "YYYY-MM" for monthly
  alertThreshold?: number;
}

export interface UpdateBudgetDTO {
  limitPaise?: number;
  alertThreshold?: number;
}

export interface BudgetStatusResponse {
  id: string;
  category?: {
    id: string;
    name: string;
    color?: string;
    icon?: string;
  } | null;
  period: BudgetPeriod;
  limitPaise: number;
  applicablePeriod: string;
  alertThreshold: number;
  spentPaise: number;
  remainingPaise: number;
  percentageConsumed: number;
  isWarning: boolean;
  isExceeded: boolean;
}

