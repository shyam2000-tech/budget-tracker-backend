import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/overview", DashboardController.getOverview);
router.get("/daily", DashboardController.getDaySummary);
router.get("/monthly", DashboardController.getMonthSummary);

export default router;

