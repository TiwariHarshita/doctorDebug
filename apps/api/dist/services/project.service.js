"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectByIdForUser = exports.getProjectsForUser = exports.createProject = void 0;
const prisma_1 = require("../config/prisma");
const slug_1 = require("../utils/slug");
const createProject = async (input) => {
    const { name, organizationId, userId } = input;
    if (!name || !organizationId) {
        throw new Error("Project name and organization ID are required");
    }
    const membership = await prisma_1.prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId
            }
        }
    });
    if (!membership) {
        throw new Error("You do not belong to this organization");
    }
    const slug = (0, slug_1.createSlug)(name);
    const existingProject = await prisma_1.prisma.project.findUnique({
        where: {
            organizationId_slug: {
                organizationId,
                slug
            }
        }
    });
    if (existingProject) {
        throw new Error("Project with this name already exists in this organization");
    }
    const project = await prisma_1.prisma.project.create({
        data: {
            name,
            slug,
            organizationId
        }
    });
    return project;
};
exports.createProject = createProject;
const getProjectsForUser = async (userId) => {
    const memberships = await prisma_1.prisma.organizationMember.findMany({
        where: { userId },
        select: {
            organizationId: true
        }
    });
    const organizationIds = memberships.map((membership) => membership.organizationId);
    const projects = await prisma_1.prisma.project.findMany({
        where: {
            organizationId: {
                in: organizationIds
            }
        },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    return projects;
};
exports.getProjectsForUser = getProjectsForUser;
const getProjectByIdForUser = async (projectId, userId) => {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        include: {
            organization: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
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
    return project;
};
exports.getProjectByIdForUser = getProjectByIdForUser;
