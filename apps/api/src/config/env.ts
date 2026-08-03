import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

if (nodeEnv === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  nodeEnv,
  port: Number(process.env.PORT || 5050),
  jwtSecret: process.env.JWT_SECRET || "development-only-secret",
  corsOrigins,
  awsRegion: process.env.AWS_REGION || "ap-south-1",
  eventArchiveQueueUrl: process.env.EVENT_ARCHIVE_QUEUE_URL || "",
  eventArchiveBucket: process.env.EVENT_ARCHIVE_BUCKET || ""
};
