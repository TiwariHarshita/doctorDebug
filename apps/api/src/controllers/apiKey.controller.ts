import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createApiKey,
  getApiKeysForProject,
  revokeApiKey
} from "../services/apiKey.service";

export const createApiKeyController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const projectId = req.params.projectId as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const result = await createApiKey({
      name: req.body.name,
      projectId,
      userId
    });

    return res.status(201).json({
      success: true,
      message: "API key created successfully. Copy it now, it will not be shown again.",
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create API key"
    });
  }
};

export const getApiKeysController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const projectId = req.params.projectId as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const apiKeys = await getApiKeysForProject(projectId, userId);

    return res.status(200).json({
      success: true,
      data: apiKeys
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch API keys"
    });
  }
};

export const revokeApiKeyController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const apiKeyId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const apiKey = await revokeApiKey(apiKeyId, userId);

    return res.status(200).json({
      success: true,
      message: "API key revoked successfully",
      data: apiKey
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to revoke API key"
    });
  }
};