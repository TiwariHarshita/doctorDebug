"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProjectApiKey = void 0;
const prisma_1 = require("../config/prisma");
const apiKey_1 = require("../utils/apiKey");
const validateProjectApiKey = async (rawApiKey) => {
    const keyHash = (0, apiKey_1.hashApiKey)(rawApiKey);
    const apiKey = await prisma_1.prisma.apiKey.findUnique({
        where: {
            keyHash
        },
        include: {
            project: true
        }
    });
    if (!apiKey) {
        throw new Error("Invalid API key");
    }
    if (apiKey.revokedAt) {
        throw new Error("API key has been revoked");
    }
    await prisma_1.prisma.apiKey.update({
        where: {
            id: apiKey.id
        },
        data: {
            lastUsedAt: new Date()
        }
    });
    return {
        apiKeyId: apiKey.id,
        projectId: apiKey.projectId,
        project: apiKey.project
    };
};
exports.validateProjectApiKey = validateProjectApiKey;
