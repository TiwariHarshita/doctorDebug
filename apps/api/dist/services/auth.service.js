"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const jwt_1 = require("../utils/jwt");
const registerUser = async (input) => {
    const { name, email, password, organizationName } = input;
    if (!name || !email || !password || !organizationName) {
        throw new Error("Name, email, password, and organization name are required");
    }
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw new Error("User with this email already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const result = await prisma_1.prisma.$transaction(async (tx) => {
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
        const project = await tx.project.create({
            data: {
                name: "Default Project",
                slug: "default-project",
                organizationId: organization.id
            }
        });
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            organization: {
                id: organization.id,
                name: organization.name,
            },
            project: {
                id: project.id,
                name: project.name,
                slug: project.slug,
                organizationId: project.organizationId
            },
            role: "OWNER"
        };
    });
    return result;
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const { email, password } = input;
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new Error("Invalid email or password");
    }
    const token = (0, jwt_1.signToken)({
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
exports.loginUser = loginUser;
const getCurrentUser = async (userId) => {
    const user = await prisma_1.prisma.user.findUnique({
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
exports.getCurrentUser = getCurrentUser;
