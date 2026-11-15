"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIncidentStatus = exports.getIncidentByIdForUser = exports.getIncidentsForProject = exports.findOrCreateIncident = void 0;
const prisma_1 = require("../config/prisma");
const fingerprint_1 = require("../utils/fingerprint");
const findOrCreateIncident = async (input) => {
    const fingerprint = (0, fingerprint_1.generateFingerprint)({
        message: input.message,
        stack: input.stack,
        service: input.service,
        route: input.route
    });
    const existingIncident = await prisma_1.prisma.incident.findUnique({
        where: {
            projectId_fingerprint: {
                projectId: input.projectId,
                fingerprint
            }
        }
    });
    if (existingIncident) {
        const updatedIncident = await prisma_1.prisma.incident.update({
            where: {
                id: existingIncident.id
            },
            data: {
                eventCount: {
                    increment: 1
                },
                lastSeenAt: new Date(),
                status: existingIncident.status === "RESOLVED"
                    ? "OPEN"
                    : existingIncident.status
            }
        });
        return updatedIncident;
    }
    const severity = input.level === "error" ? "HIGH" : "MEDIUM";
    const newIncident = await prisma_1.prisma.incident.create({
        data: {
            title: (0, fingerprint_1.createIncidentTitle)(input.message),
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
exports.findOrCreateIncident = findOrCreateIncident;
const getIncidentsForProject = async (projectId, userId) => {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId }
    });
    if (!project) {
        throw new Error("Project not found");
    }
    const membership = await prisma_1.prisma.organizationMember.findUnique({
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
    const incidents = await prisma_1.prisma.incident.findMany({
        where: { projectId },
        orderBy: {
            lastSeenAt: "desc"
        }
    });
    return incidents;
};
exports.getIncidentsForProject = getIncidentsForProject;
const getIncidentByIdForUser = async (incidentId, userId) => {
    const incident = await prisma_1.prisma.incident.findUnique({
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
    const membership = await prisma_1.prisma.organizationMember.findUnique({
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
exports.getIncidentByIdForUser = getIncidentByIdForUser;
const updateIncidentStatus = async (input) => {
    const { incidentId, userId, status } = input;
    const incident = await prisma_1.prisma.incident.findUnique({
        where: { id: incidentId },
        include: {
            project: true
        }
    });
    if (!incident) {
        throw new Error("Incident not found");
    }
    const membership = await prisma_1.prisma.organizationMember.findUnique({
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
    const updatedIncident = await prisma_1.prisma.incident.update({
        where: {
            id: incidentId
        },
        data: {
            status
        }
    });
    return updatedIncident;
};
exports.updateIncidentStatus = updateIncidentStatus;
