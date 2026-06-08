import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getProjectStats } from "../services/stats.service";

export const getProjectStatsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const projectId = req.params.projectId as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const stats = await getProjectStats(projectId, userId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch project stats"
    });
  }
};