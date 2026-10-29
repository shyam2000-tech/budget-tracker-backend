import { Schema, model } from "mongoose";
import { ICategory } from "./category.types";

const categorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    icon: {
      type: String,
      trim: true,
      default: "tag",
    },
    color: {
      type: String,
      trim: true,
      default: "#6366f1",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate category names for the same user
categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Category = model<ICategory>("Category", categorySchema);

