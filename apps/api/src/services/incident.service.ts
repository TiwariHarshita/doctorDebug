import { prisma } from "../config/prisma";
import {
  createIncidentTitle,
  generateFingerprint
} from "../utils/fingerprint";

type FindOrCreateIncidentInput = {
  projectId: string;
  level: string;
  message: string;
  stack?: string;
  service?: string;
  route?: string;
};

export const findOrCreateIncident = async (
  input: FindOrCreateIncidentInput
) => {
  const fingerprint = generateFingerprint({
    message: input.message,
    stack: input.stack,
    service: input.service,
    route: input.route
  });

  const existingIncident = await prisma.incident.findUnique({
    where: {
      projectId_fingerprint: {
        projectId: input.projectId,
        fingerprint
      }
    }
  });

  if (existingIncident) {
  const updatedIncident = await prisma.incident.update({
    where: {
      id: existingIncident.id
    },
    data: {
      eventCount: {
        increment: 1
      },
      lastSeenAt: new Date(),
      status:
        existingIncident.status === "RESOLVED"
          ? "OPEN"
          : existingIncident.status
    }
  });

  return updatedIncident;

  }

  const severity = input.level === "error" ? "HIGH" : "MEDIUM";

  const newIncident = await prisma.incident.create({
    data: {
      title: createIncidentTitle(input.message),
      fingerprint,
      severity,
      projectId: input.projectId,
      eventCount: 1,
      firstSeenAt: new Date(),
      lastSeenAt: new Date()
    }
  });

  return newIncident;
};

export const getIncidentsForProject = async (
  projectId: string,
  userId: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: project.organizationId
      }
    }
  });

  if (!membership) {
    throw new Error("You do not have access to this project");
  }

  const incidents = await prisma.incident.findMany({
    where: { projectId },
    orderBy: {
      lastSeenAt: "desc"
    }
  });

  return incidents;
};

export const getIncidentByIdForUser = async (
  incidentId: string,
  userId: string
) => {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      project: true,
      events: {
        orderBy: {
          createdAt: "desc"
        },
        take: 10
      }
    }
  });

  if (!incident) {
    throw new Error("Incident not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: incident.project.organizationId
      }
    }
  });

  if (!membership) {
    throw new Error("You do not have access to this incident");
  }

  return incident;
};

type UpdateIncidentStatusInput = {
  incidentId: string;
  userId: string;
  status: "OPEN" | "RESOLVED" | "IGNORED";
};

export const updateIncidentStatus = async (
  input: UpdateIncidentStatusInput
) => {
  const { incidentId, userId, status } = input;

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      project: true
    }
  });

  if (!incident) {
    throw new Error("Incident not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: incident.project.organizationId
      }
    }
  });

  if (!membership) {
    throw new Error("You do not have access to this incident");
  }

  const updatedIncident = await prisma.incident.update({
    where: {
      id: incidentId
    },
    data: {
      status
    }
  });

  return updatedIncident;
};