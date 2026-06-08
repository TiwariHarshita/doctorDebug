import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  getIncidentByIdController,
  getIncidentsController
} from "../controllers/incident.controller";

const router = Router();

router.get(
  "/projects/:projectId/incidents",
  requireAuth,
  getIncidentsController
);

router.get(
  "/incidents/:id",
  requireAuth,
  getIncidentByIdController
);

export default router;