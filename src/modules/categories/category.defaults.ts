import { Types } from "mongoose";
import { Category } from "./category.model";

export const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", icon: "utensils", color: "#f97316" },
  { name: "Groceries", icon: "shopping-cart", color: "#10b981" },
  { name: "Transportation", icon: "car", color: "#3b82f6" },
  { name: "Utilities & Bills", icon: "zap", color: "#8b5cf6" },
  { name: "Entertainment", icon: "film", color: "#ec4899" },
  { name: "Shopping", icon: "shopping-bag", color: "#f43f5e" },
  { name: "Health & Medical", icon: "activity", color: "#06b6d4" },
  { name: "Housing & Rent", icon: "home", color: "#64748b" },
  { name: "Miscellaneous", icon: "help-circle", color: "#6b7280" },
  { name: "Income", icon: "arrow-down-left", color: "#22c55e" },
];

export const seedDefaultCategories = async (userId: Types.ObjectId): Promise<void> => {
  const categoriesToInsert = DEFAULT_CATEGORIES.map((cat) => ({
    userId,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    isDefault: true,
  }));

  await Category.insertMany(categoriesToInsert, { ordered: false }).catch((err) => {
    // If duplicates occur for any reason, ignore
    console.warn(`[Category Seed] Warning during seeding for user ${userId}:`, err?.message);
  });
};

