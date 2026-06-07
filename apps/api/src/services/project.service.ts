import { prisma } from "../config/prisma";
import { createSlug } from "../utils/slug";

type CreateProjectInput = {
  name: string;
  organizationId: string;
  userId: string;
};

export const createProject = async (input: CreateProjectInput) => {
  const { name, organizationId, userId } = input;

  if (!name || !organizationId) {
    throw new Error("Project name and organization ID are required");
  }

  const membership = await prisma.organizationMember.findUnique({
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

  const slug = createSlug(name);

  const existingProject = await prisma.project.findUnique({
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

  const project = await prisma.project.create({
    data: {
      name,
      slug,
      organizationId
    }
  });

  return project;
};

export const getProjectsForUser = async (userId: string) => {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    select: {
      organizationId: true
    }
  });

const organizationIds = memberships.map(
  (membership: { organizationId: string }) => membership.organizationId
);
  const projects = await prisma.project.findMany({
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

export const getProjectByIdForUser = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
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

  return project;
};