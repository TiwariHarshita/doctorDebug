import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  createApiKeyController,
  getApiKeysController,
  revokeApiKeyController
} from "../controllers/apiKey.controller";

const router = Router();

router.post(
  "/projects/:projectId/api-keys",
  requireAuth,
  createApiKeyController
);

router.get(
  "/projects/:projectId/api-keys",
  requireAuth,
  getApiKeysController
);

router.delete(
  "/api-keys/:id",
  requireAuth,
  revokeApiKeyController
);

export default router;