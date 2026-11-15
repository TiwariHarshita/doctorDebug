"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv === "production" && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in production");
}
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
exports.env = {
    nodeEnv,
    port: Number(process.env.PORT || 5050),
    jwtSecret: process.env.JWT_SECRET || "development-only-secret",
    corsOrigins,
    awsRegion: process.env.AWS_REGION || "ap-south-1",
    eventArchiveQueueUrl: process.env.EVENT_ARCHIVE_QUEUE_URL || "",
    eventArchiveBucket: process.env.EVENT_ARCHIVE_BUCKET || ""
};
