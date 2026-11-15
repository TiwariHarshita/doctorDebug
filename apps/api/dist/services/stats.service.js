"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStats = void 0;
const prisma_1 = require("../config/prisma");
const getProjectStats = async (projectId, userId) => {
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
    const [totalEvents, totalIncidents, openIncidents, resolvedIncidents, ignoredIncidents, recentEvents] = await Promise.all([
        prisma_1.prisma.apiEvent.count({
            where: { projectId }
        }),
        prisma_1.prisma.incident.count({
            where: { projectId }
        }),
        prisma_1.prisma.incident.count({
            where: {
                projectId,
                status: "OPEN"
            }
        }),
        prisma_1.prisma.incident.count({
            where: {
                projectId,
                status: "RESOLVED"
            }
        }),
        prisma_1.prisma.incident.count({
            where: {
                projectId,
                status: "IGNORED"
            }
        }),
        prisma_1.prisma.apiEvent.findMany({
            where: { projectId },
            select: {
                service: true,
                route: true
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 200
        })
    ]);
    const serviceCounts = new Map();
    const routeCounts = new Map();
    for (const event of recentEvents) {
        if (event.service) {
            serviceCounts.set(event.service, (serviceCounts.get(event.service) || 0) + 1);
        }
        if (event.route) {
            routeCounts.set(event.route, (routeCounts.get(event.route) || 0) + 1);
        }
    }
    const topServices = Array.from(serviceCounts.entries())
        .map(([service, count]) => ({ service, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    const topRoutes = Array.from(routeCounts.entries())
        .map(([route, count]) => ({ route, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    return {
        totalEvents,
        totalIncidents,
        openIncidents,
        resolvedIncidents,
        ignoredIncidents,
        topServices,
        topRoutes
    };
};
exports.getProjectStats = getProjectStats;
