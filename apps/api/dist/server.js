"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const prisma_1 = require("./config/prisma");
const server = app_1.default.listen(env_1.env.port, () => {
    console.log(`API running on port ${env_1.env.port}`);
});
const shutdown = async (signal) => {
    console.log(`${signal} received; shutting down`);
    server.close(async () => {
        await prisma_1.prisma.$disconnect();
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
