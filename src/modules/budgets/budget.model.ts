import { Schema, model } from "mongoose";
import { IBudget } from "./budget.types";

const budgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    period: {
      type: String,
      enum: ["daily", "monthly"],
      required: [true, "Period must be 'daily' or 'monthly'"],
    },
    limitPaise: {
      type: Number,
      required: [true, "Budget limit in paise is required"],
      min: [1, "Limit must be at least 1 paise"],
      validate: {
        validator: Number.isInteger,
        message: "Budget limit must be an integer in paise",
      },
    },
    applicablePeriod: {
      type: String,
      required: [true, "Applicable period is required (YYYY-MM-DD or YYYY-MM)"],
      trim: true,
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: [1, "Alert threshold must be at least 1%"],
      max: [100, "Alert threshold cannot exceed 100%"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budget for same user, period, applicable period, and category
budgetSchema.index(
  { userId: 1, period: 1, applicablePeriod: 1, categoryId: 1 },
  { unique: true }
);

export const Budget = model<IBudget>("Budget", budgetSchema);

