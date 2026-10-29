import { Types } from "mongoose";
import { Category } from "./category.model";
import { Expense } from "../expenses/expense.model";
import { Budget } from "../budgets/budget.model";
import { AppError } from "../../utils/AppError";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./category.types";

export class CategoryService {
  static async getCategories(userId: string) {
    return Category.find({ userId: new Types.ObjectId(userId) }).sort({ name: 1 });
  }

  static async createCategory(userId: string, dto: CreateCategoryDTO) {
    const existing = await Category.findOne({
      userId: new Types.ObjectId(userId),
      name: { $regex: new RegExp(`^${dto.name.trim()}$`, "i") },
    });

    if (existing) {
      throw new AppError(`Category '${dto.name}' already exists`, 409);
    }

    return Category.create({
      userId: new Types.ObjectId(userId),
      name: dto.name.trim(),
      icon: dto.icon || "tag",
      color: dto.color || "#6366f1",
      isDefault: false,
    });
  }

  static async updateCategory(userId: string, categoryId: string, dto: UpdateCategoryDTO) {
    const category = await Category.findOne({
      _id: new Types.ObjectId(categoryId),
      userId: new Types.ObjectId(userId),
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (dto.name && dto.name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        userId: new Types.ObjectId(userId),
        name: { $regex: new RegExp(`^${dto.name.trim()}$`, "i") },
      });
      if (duplicate) {
        throw new AppError(`Category '${dto.name}' already exists`, 409);
      }
      category.name = dto.name.trim();
    }

    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.color !== undefined) category.color = dto.color;

    await category.save();
    return category;
  }

  static async deleteCategory(userId: string, categoryId: string, reassignToId?: string) {
    const category = await Category.findOne({
      _id: new Types.ObjectId(categoryId),
      userId: new Types.ObjectId(userId),
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const linkedExpensesCount = await Expense.countDocuments({
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(categoryId),
    });

    const linkedBudgetsCount = await Budget.countDocuments({
      userId: new Types.ObjectId(userId),
      categoryId: new Types.ObjectId(categoryId),
    });

    if (linkedExpensesCount > 0 || linkedBudgetsCount > 0) {
      if (!reassignToId) {
        throw new AppError(
          `Cannot delete category: linked to ${linkedExpensesCount} expense(s) and ${linkedBudgetsCount} budget(s). Specify a 'reassignTo' category ID to reassign them safely.`,
          400,
          { linkedExpensesCount, linkedBudgetsCount }
        );
      }

      if (reassignToId === categoryId) {
        throw new AppError("Cannot reassign expenses to the category being deleted", 400);
      }

      const targetCategory = await Category.findOne({
        _id: new Types.ObjectId(reassignToId),
        userId: new Types.ObjectId(userId),
      });

      if (!targetCategory) {
        throw new AppError("Target category for reassignment not found", 404);
      }

      // Reassign expenses
      await Expense.updateMany(
        { userId: new Types.ObjectId(userId), categoryId: new Types.ObjectId(categoryId) },
        { $set: { categoryId: new Types.ObjectId(reassignToId) } }
      );

      // Delete or reassign budgets referencing this category
      await Budget.deleteMany({
        userId: new Types.ObjectId(userId),
        categoryId: new Types.ObjectId(categoryId),
      });
    }

    await Category.deleteOne({ _id: category._id });

    return {
      deletedCategoryId: categoryId,
      reassignedTo: reassignToId || null,
      reassignedExpenses: linkedExpensesCount,
    };
  }
}

