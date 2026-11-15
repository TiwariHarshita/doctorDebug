"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeApiKey = exports.getApiKeysForProject = exports.createApiKey = void 0;
const prisma_1 = require("../config/prisma");
const apiKey_1 = require("../utils/apiKey");
const createApiKey = async (input) => {
    const { name, projectId, userId } = input;
    if (!name || !projectId) {
        throw new Error("API key name and project ID are required");
    }
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
    const rawApiKey = (0, apiKey_1.generateApiKey)();
    const keyHash = (0, apiKey_1.hashApiKey)(rawApiKey);
    const keyPrefix = (0, apiKey_1.getApiKeyPrefix)(rawApiKey);
    const apiKey = await prisma_1.prisma.apiKey.create({
        data: {
            name,
            keyHash,
            keyPrefix,
            projectId
        },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            projectId: true,
            createdAt: true
        }
    });
    return {
        apiKey,
        rawApiKey
    };
};
exports.createApiKey = createApiKey;
const getApiKeysForProject = async (projectId, userId) => {
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
    const apiKeys = await prisma_1.prisma.apiKey.findMany({
        where: {
            projectId,
            revokedAt: null
        },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            createdAt: true,
            lastUsedAt: true,
            revokedAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    return apiKeys;
};
exports.getApiKeysForProject = getApiKeysForProject;
const revokeApiKey = async (apiKeyId, userId) => {
    const apiKey = await prisma_1.prisma.apiKey.findUnique({
        where: { id: apiKeyId },
        include: {
            project: true
        }
    });
    if (!apiKey) {
        throw new Error("API key not found");
    }
    const membership = await prisma_1.prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId: apiKey.project.organizationId
            }
        }
    });
    if (!membership) {
        throw new Error("You do not have access to this API key");
    }
    const revokedApiKey = await prisma_1.prisma.apiKey.update({
        where: { id: apiKeyId },
        data: {
            revokedAt: new Date()
        },
        select: {
            id: true,
            name: true,
            keyPrefix: true,
            revokedAt: true
        }
    });
    return revokedApiKey;
};
exports.revokeApiKey = revokeApiKey;
