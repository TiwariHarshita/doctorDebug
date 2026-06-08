import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  createApiKeyController,
  getApiKeysController,
  revokeApiKeyController
} from "../controllers/apiKey.controller";

const router = Router();

router.use(requireAuth);

router.post("/projects/:projectId/api-keys", createApiKeyController);
router.get("/projects/:projectId/api-keys", getApiKeysController);
router.delete("/api-keys/:id", revokeApiKeyController);

export default router;