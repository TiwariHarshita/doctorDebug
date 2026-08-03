import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { validateProjectApiKey } from "../services/apiKeyAuth.service";
import {
  createEvent,
  getEventsForProject
} from "../services/event.service";
import { getEventArchiveDownloadUrl } from "../services/eventArchive.service";

export const createEventController = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "API key is required"
      });
    }

    const rawApiKey = authHeader.replace("Bearer ", "").trim();
    const apiKeyData = await validateProjectApiKey(rawApiKey);

    const result = await createEvent({
      projectId: apiKeyData.projectId,
      level: req.body.level,
      message: req.body.message,
      stack: req.body.stack,
      service: req.body.service,
      route: req.body.route,
      environment: req.body.environment,
      metadata: req.body.metadata
    });

    return res.status(201).json({
      success: true,
      message: "Event captured successfully",
      data: {
        eventId: result.event.id,
        incidentId: result.incident.id,
        projectId: result.event.projectId,
        incidentEventCount: result.incident.eventCount,
        archiveQueued: result.archiveQueued,
        createdAt: result.event.createdAt
      }
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to capture event";

    return res.status(400).json({
      success: false,
      message
    });
  }
};

export const getProjectEventsController = async (
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

    const events = await getEventsForProject(projectId, userId);

    return res.status(200).json({
      success: true,
      data: events
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch events";

    return res.status(400).json({
      success: false,
      message
    });
  }
};

export const getEventArchiveUrlController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const eventId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const archive = await getEventArchiveDownloadUrl(eventId, userId);

    return res.status(200).json({
      success: true,
      data: archive
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to create archive download URL";

    const statusCode = message.includes("not ready") ? 409 : 400;

    return res.status(statusCode).json({
      success: false,
      message
    });
  }
};
