import { Router } from "express";
import { ExpenseController } from "./expenses.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} from "./expense.validator";

const router = Router();

router.use(authenticate);

router.post("/", validate({ body: createExpenseSchema }), ExpenseController.create);
router.get("/", validate({ query: expenseQuerySchema }), ExpenseController.getAll);
router.get("/:id", ExpenseController.getById);
router.put("/:id", validate({ body: updateExpenseSchema }), ExpenseController.update);
router.delete("/:id", ExpenseController.delete);

export default router;

