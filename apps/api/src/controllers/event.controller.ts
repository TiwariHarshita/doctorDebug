import { Request, Response } from "express";
import { validateProjectApiKey } from "../services/apiKeyAuth.service";
import { createEvent } from "../services/event.service";

export const createEventController = async (req: Request, res: Response) => {
    console.log("event controller hit");

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

    const event = await createEvent({
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
        eventId: event.id,
        projectId: event.projectId,
        createdAt: event.createdAt
      }
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to capture event"
    });
  }
};