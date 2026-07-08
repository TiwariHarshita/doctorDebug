import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  deleteUserAiProviderSetting,
  getUserAiProviderSettingStatus,
  saveUserAiProviderSetting,
  setActiveUserAiProvider
} from "../services/aiProviderSetting.service";

export const getAiProviderSettingsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const status = await getUserAiProviderSettingStatus(userId);

    return res.json({
      success: true,
      data: status
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch AI provider settings";

    return res.status(400).json({
      success: false,
      message
    });
  }
};

export const saveAiProviderSettingController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const savedSetting = await saveUserAiProviderSetting({
      userId,
      provider: req.body.provider,
      apiKey: req.body.apiKey,
      model: req.body.model,
      baseUrl: req.body.baseUrl
    });

    return res.json({
      success: true,
      message: "AI provider saved successfully",
      data: savedSetting
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to save AI provider";

    return res.status(400).json({
      success: false,
      message
    });
  }
};

export const setActiveAiProviderController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const activeSetting = await setActiveUserAiProvider({
      userId,
      provider: req.body.provider
    });

    return res.json({
      success: true,
      message: "Active AI provider updated",
      data: activeSetting
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to update active AI provider";

    return res.status(400).json({
      success: false,
      message
    });
  }
};

export const deleteAiProviderSettingController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    await deleteUserAiProviderSetting({
      userId,
      provider: req.params.provider
    });

    return res.json({
      success: true,
      message: "AI provider removed successfully"
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete AI provider";

    return res.status(400).json({
      success: false,
      message
    });
  }
};
