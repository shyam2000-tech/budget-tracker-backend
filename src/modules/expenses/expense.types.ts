import { Document, Types } from "mongoose";

export type TransactionType = "expense" | "income";

export interface IExpense extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  amountPaise: number;
  description: string;
  type: TransactionType;
  date: Date;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseDTO {
  amountPaise: number;
  categoryId: string;
  description?: string;
  type?: TransactionType;
  date?: string | Date;
  paymentMethod?: string;
}

export interface UpdateExpenseDTO {
  amountPaise?: number;
  categoryId?: string;
  description?: string;
  type?: TransactionType;
  date?: string | Date;
  paymentMethod?: string;
}

export interface ExpenseFilterQuery {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

