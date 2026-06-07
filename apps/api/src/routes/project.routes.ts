import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  createProjectController,
  getProjectByIdController,
  getProjectsController
} from "../controllers/project.controller";

const router = Router();

router.use(requireAuth);

router.post("/", createProjectController);
router.get("/", getProjectsController);
router.get("/:id", getProjectByIdController);

export default router;