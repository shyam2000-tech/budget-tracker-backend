import { Router } from "express";
import { CategoryController } from "./categories.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategoryQuerySchema,
} from "./category.validator";

const router = Router();

router.use(authenticate);

router.get("/", CategoryController.getAll);
router.post("/", validate({ body: createCategorySchema }), CategoryController.create);
router.put("/:id", validate({ body: updateCategorySchema }), CategoryController.update);
router.delete("/:id", validate({ query: deleteCategoryQuerySchema }), CategoryController.delete);

export default router;

