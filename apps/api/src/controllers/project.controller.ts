import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createProject,
  getProjectByIdForUser,
  getProjectsForUser
} from "../services/project.service";

export const createProjectController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const project = await createProject({
      name: req.body.name,
      organizationId: req.body.organizationId,
      userId
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create project"
    });
  }
};

export const getProjectsController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const projects = await getProjectsForUser(userId);

    return res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch projects"
    });
  }
};

export const getProjectByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const projectId: string = req.params.id as string;

    const project = await getProjectByIdForUser(projectId, userId);

    return res.status(200).json({
      success: true,
      data: project
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch project"
    });
  }
};