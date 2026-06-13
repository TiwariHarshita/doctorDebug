import { Request, Response } from "express";
import { analyzeIncidentWithAI } from "../services/ai.service";

type AuthenticatedRequest = Request & {
  user?: {
    userId: string;
    email?: string;
  };
};

export const analyzeIncidentController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const incidentId = req.params.id as string;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const analysis = await analyzeIncidentWithAI({
      incidentId,
      userId
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to analyze incident";

    res.status(400).json({
      success: false,
      message
    });
  }
};