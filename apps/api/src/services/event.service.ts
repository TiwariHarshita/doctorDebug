import { prisma } from "../config/prisma";
import { findOrCreateIncident } from "./incident.service";

type CreateEventInput = {
  projectId: string;
  level: string;
  message: string;
  stack?: string;
  service?: string;
  route?: string;
  environment?: string;
  metadata?: unknown;
};

export const createEvent = async (input: CreateEventInput) => {
  const {
    projectId,
    level,
    message,
    stack,
    service,
    route,
    environment,
    metadata
  } = input;

  if (!level || !message) {
    throw new Error("Event level and message are required");
  }

  const incident = await findOrCreateIncident({
    projectId,
    level,
    message,
    stack,
    service,
    route
  });

  const event = await prisma.apiEvent.create({
    data: {
      projectId,
      incidentId: incident.id,
      level,
      message,
      stack,
      service,
      route,
      environment,
      metadata: metadata as object
    }
  });

  return {
    event,
    incident
  };
};