import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  getIncidentByIdController,
  getIncidentsController,
  updateIncidentStatusController
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

router.patch(
  "/incidents/:id/status",
  requireAuth,
  updateIncidentStatusController
);
export default router;