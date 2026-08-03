import { Router } from "express";
import {
  createEventController,
  getEventArchiveUrlController,
  getProjectEventsController
} from "../controllers/event.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/api/v1/events", createEventController);

router.get(
  "/projects/:projectId/events",
  requireAuth,
  getProjectEventsController
);

router.get(
  "/events/:id/archive-url",
  requireAuth,
  getEventArchiveUrlController
);

export default router;
