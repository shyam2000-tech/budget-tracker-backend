import { Router } from "express";
import { BudgetController } from "./budgets.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetQuerySchema,
} from "./budget.validator";

const router = Router();

router.use(authenticate);

router.post("/", validate({ body: createBudgetSchema }), BudgetController.create);
router.get("/", validate({ query: budgetQuerySchema }), BudgetController.getAll);
router.put("/:id", validate({ body: updateBudgetSchema }), BudgetController.update);
router.delete("/:id", BudgetController.delete);

export default router;

