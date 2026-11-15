"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventArchiveUrlController = exports.getProjectEventsController = exports.createEventController = void 0;
const apiKeyAuth_service_1 = require("../services/apiKeyAuth.service");
const event_service_1 = require("../services/event.service");
const eventArchive_service_1 = require("../services/eventArchive.service");
const createEventController = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "API key is required"
            });
        }
        const rawApiKey = authHeader.replace("Bearer ", "").trim();
        const apiKeyData = await (0, apiKeyAuth_service_1.validateProjectApiKey)(rawApiKey);
        const result = await (0, event_service_1.createEvent)({
            projectId: apiKeyData.projectId,
            level: req.body.level,
            message: req.body.message,
            stack: req.body.stack,
            service: req.body.service,
            route: req.body.route,
            environment: req.body.environment,
            metadata: req.body.metadata
        });
        return res.status(201).json({
            success: true,
            message: "Event captured successfully",
            data: {
                eventId: result.event.id,
                incidentId: result.incident.id,
                projectId: result.event.projectId,
                incidentEventCount: result.incident.eventCount,
                archiveQueued: result.archiveQueued,
                createdAt: result.event.createdAt
            }
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to capture event";
        return res.status(400).json({
            success: false,
            message
        });
    }
};
exports.createEventController = createEventController;
const getProjectEventsController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const events = await (0, event_service_1.getEventsForProject)(projectId, userId);
        return res.status(200).json({
            success: true,
            data: events
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch events";
        return res.status(400).json({
            success: false,
            message
        });
    }
};
exports.getProjectEventsController = getProjectEventsController;
const getEventArchiveUrlController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const eventId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const archive = await (0, eventArchive_service_1.getEventArchiveDownloadUrl)(eventId, userId);
        return res.status(200).json({
            success: true,
            data: archive
        });
    }
    catch (error) {
        const message = error instanceof Error
            ? error.message
            : "Failed to create archive download URL";
        const statusCode = message.includes("not ready") ? 409 : 400;
        return res.status(statusCode).json({
            success: false,
            message
        });
    }
};
exports.getEventArchiveUrlController = getEventArchiveUrlController;
