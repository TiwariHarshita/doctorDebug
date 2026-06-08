import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { getProjectStatsController } from "../controllers/stats.controller";

const router = Router();

router.get(
  "/projects/:projectId/stats",
  requireAuth,
  getProjectStatsController
);

export default router;