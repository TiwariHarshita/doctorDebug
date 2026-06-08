import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import apiKeyRoutes from "./routes/apiKey.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use(apiKeyRoutes);
export default app;