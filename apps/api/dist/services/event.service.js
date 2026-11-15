"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventsForProject = exports.createEvent = void 0;
const prisma_1 = require("../config/prisma");
const incident_service_1 = require("./incident.service");
const eventArchiveQueue_service_1 = require("./eventArchiveQueue.service");
const createEvent = async (input) => {
    const { projectId, level, message, stack, service, route, environment, metadata } = input;
    if (!level || !message) {
        throw new Error("Event level and message are required");
    }
    const incident = await (0, incident_service_1.findOrCreateIncident)({
        projectId,
        level,
        message,
        stack,
        service,
        route
    });
    const event = await prisma_1.prisma.apiEvent.create({
        data: {
            projectId,
            incidentId: incident.id,
            level,
            message,
            stack,
            service,
            route,
            environment,
            metadata: metadata
        }
    });
    let archiveQueued = false;
    try {
        archiveQueued = await (0, eventArchiveQueue_service_1.enqueueEventArchive)({
            schemaVersion: 1,
            eventId: event.id,
            projectId: event.projectId,
            incidentId: event.incidentId,
            level: event.level,
            message: event.message,
            stack: event.stack,
            service: event.service,
            route: event.route,
            environment: event.environment,
            metadata: event.metadata,
            createdAt: event.createdAt.toISOString()
        });
    }
    catch (error) {
        // Archival is secondary. The main monitoring request should not fail after
        // the event has already been stored in PostgreSQL.
        console.error("Failed to enqueue event archive", {
            eventId: event.id,
            error
        });
    }
    return {
        event,
        incident,
        archiveQueued
    };
};
exports.createEvent = createEvent;
const getEventsForProject = async (projectId, userId) => {
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
    return prisma_1.prisma.apiEvent.findMany({
        where: {
            projectId
        },
        include: {
            incident: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    severity: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        },
        take: 50
    });
};
exports.getEventsForProject = getEventsForProject;
