import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { analyzeIncidentController } from "../controllers/ai.controller";

const router = Router();

router.post(
  "/incidents/:id/analyze",
  requireAuth,
  analyzeIncidentController
);

export default router;