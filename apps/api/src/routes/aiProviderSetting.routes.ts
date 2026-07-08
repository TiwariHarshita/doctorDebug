import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  deleteAiProviderSettingController,
  getAiProviderSettingsController,
  saveAiProviderSettingController,
  setActiveAiProviderController
} from "../controllers/aiProviderSetting.controller";

const router = Router();

router.get("/ai/settings", requireAuth, getAiProviderSettingsController);
router.put("/ai/settings", requireAuth, saveAiProviderSettingController);
router.patch("/ai/settings/active", requireAuth, setActiveAiProviderController);
router.delete("/ai/settings/:provider", requireAuth, deleteAiProviderSettingController);

export default router;
