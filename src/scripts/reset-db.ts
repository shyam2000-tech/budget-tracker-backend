import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../modules/users/user.model";
import { Category } from "../modules/categories/category.model";
import { Expense } from "../modules/expenses/expense.model";
import { Budget } from "../modules/budgets/budget.model";

dotenv.config();

const resetDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined in .env");
    }

    console.log("[Database Reset] Connecting to database...");
    await mongoose.connect(mongoUri);

    console.log("[Database Reset] Clearing collections...");

    const [expensesDeleted, budgetsDeleted, categoriesDeleted, usersDeleted] =
      await Promise.all([
        Expense.deleteMany({}),
        Budget.deleteMany({}),
        Category.deleteMany({}),
        User.deleteMany({}),
      ]);

    console.log("-----------------------------------------");
    console.log("Database reset completed successfully:");
    console.log(`- Expenses deleted:   ${expensesDeleted.deletedCount}`);
    console.log(`- Budgets deleted:    ${budgetsDeleted.deletedCount}`);
    console.log(`- Categories deleted: ${categoriesDeleted.deletedCount}`);
    console.log(`- Users deleted:      ${usersDeleted.deletedCount}`);
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    console.log("[Database Reset] Disconnected cleanly.");
    process.exit(0);
  } catch (error) {
    console.error("[Database Reset] Error resetting database:", error);
    process.exit(1);
  }
};

resetDatabase();

