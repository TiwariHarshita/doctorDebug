import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  getIncidentByIdForUser,
  getIncidentsForProject
} from "../services/incident.service";

export const getIncidentsController = async (
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

    const incidents = await getIncidentsForProject(projectId, userId);

    return res.status(200).json({
      success: true,
      data: incidents
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch incidents"
    });
  }
};

export const getIncidentByIdController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const incidentId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const incident = await getIncidentByIdForUser(incidentId, userId);

    return res.status(200).json({
      success: true,
      data: incident
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch incident"
    });
  }
};