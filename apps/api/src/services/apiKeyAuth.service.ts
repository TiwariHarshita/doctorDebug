import { prisma } from "../config/prisma";
import { hashApiKey } from "../utils/apiKey";

export const validateProjectApiKey = async (rawApiKey: string) => {
  const keyHash = hashApiKey(rawApiKey);

  const apiKey = await prisma.apiKey.findUnique({
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

  await prisma.apiKey.update({
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