import { Schema, model } from "mongoose";
import { IExpense } from "./expense.types";

const expenseSchema = new Schema<IExpense>(
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
      required: [true, "Category ID is required"],
      index: true,
    },
    amountPaise: {
      type: Number,
      required: [true, "Amount in paise is required"],
      min: [1, "Amount must be at least 1 paise"],
      validate: {
        validator: Number.isInteger,
        message: "Amount must be an integer in paise",
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [255, "Description cannot exceed 255 characters"],
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      default: "upi",
    },
  },
  {
    timestamps: true,
  }
);

// Performance compound indexes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, categoryId: 1, date: -1 });
expenseSchema.index({ userId: 1, type: 1, date: -1 });

export const Expense = model<IExpense>("Expense", expenseSchema);

