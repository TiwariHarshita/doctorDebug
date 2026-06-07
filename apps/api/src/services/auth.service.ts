import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { signToken } from "../utils/jwt";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  organizationName: string;
};

export const registerUser = async (input: RegisterInput) => {
  const { name, email, password, organizationName } = input;

  if (!name || !email || !password || !organizationName) {
    throw new Error("Name, email, password, and organization name are required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    const organization = await tx.organization.create({
      data: {
        name: organizationName
      }
    });

    await tx.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: "OWNER"
      }
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      organization: {
        id: organization.id,
        name: organization.name
      },
      role: "OWNER"
    };
  });

  return result;
};


type LoginInput = {
  email: string;
  password: string;
};

export const loginUser = async (input: LoginInput) => {
  const { email, password } = input;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }

  const token = signToken({
    userId: user.id
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};


export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      memberships: {
        select: {
          role: true,
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};