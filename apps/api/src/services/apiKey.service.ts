import { prisma } from "../config/prisma";
import { generateApiKey, getApiKeyPrefix, hashApiKey } from "../utils/apiKey";

type CreateApiKeyInput = {
  name: string;
  projectId: string;
  userId: string;
};

export const createApiKey = async (input: CreateApiKeyInput) => {
  const { name, projectId, userId } = input;

  if (!name || !projectId) {
    throw new Error("API key name and project ID are required");
  }

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

  const rawApiKey = generateApiKey();
  const keyHash = hashApiKey(rawApiKey);
  const keyPrefix = getApiKeyPrefix(rawApiKey);

  const apiKey = await prisma.apiKey.create({
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

export const getApiKeysForProject = async (projectId: string, userId: string) => {
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

  const apiKeys = await prisma.apiKey.findMany({
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

export const revokeApiKey = async (apiKeyId: string, userId: string) => {
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: apiKeyId },
    include: {
      project: true
    }
  });

  if (!apiKey) {
    throw new Error("API key not found");
  }

  const membership = await prisma.organizationMember.findUnique({
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

  const revokedApiKey = await prisma.apiKey.update({
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