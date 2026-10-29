import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  icon?: string;
  color?: string;
}

