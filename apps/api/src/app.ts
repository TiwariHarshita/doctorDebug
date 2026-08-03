import cors from "cors";
import express from "express";
import aiProviderSettingRoutes from "./routes/aiProviderSetting.routes";
import aiRoutes from "./routes/ai.routes";
import apiKeyRoutes from "./routes/apiKey.routes";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import healthRoutes from "./routes/health.routes";
import incidentRoutes from "./routes/incident.routes";
import projectRoutes from "./routes/project.routes";
import statsRoutes from "./routes/stats.routes";
import { env } from "./config/env";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      // Requests such as curl, Postman, server-to-server SDK calls, and health
      // checks may not include an Origin header.
      if (!origin || env.corsOrigins.includes("*") || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "1mb" }));
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use(apiKeyRoutes);
app.use(eventRoutes);
app.use(incidentRoutes);
app.use(statsRoutes);
app.use(aiRoutes);
app.use(aiProviderSettingRoutes);

export default app;
