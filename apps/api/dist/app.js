"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const aiProviderSetting_routes_1 = __importDefault(require("./routes/aiProviderSetting.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const apiKey_routes_1 = __importDefault(require("./routes/apiKey.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const incident_routes_1 = __importDefault(require("./routes/incident.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((0, cors_1.default)({
    origin(origin, callback) {
        // Requests such as curl, Postman, server-to-server SDK calls, and health
        // checks may not include an Origin header.
        if (!origin || env_1.env.corsOrigins.includes("*") || env_1.env.corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use("/health", health_routes_1.default);
app.use("/auth", auth_routes_1.default);
app.use("/projects", project_routes_1.default);
app.use(apiKey_routes_1.default);
app.use(event_routes_1.default);
app.use(incident_routes_1.default);
app.use(stats_routes_1.default);
app.use(ai_routes_1.default);
app.use(aiProviderSetting_routes_1.default);
exports.default = app;
