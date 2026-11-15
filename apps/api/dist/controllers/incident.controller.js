"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIncidentStatusController = exports.getIncidentByIdController = exports.getIncidentsController = void 0;
const incident_service_1 = require("../services/incident.service");
const getIncidentsController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const incidents = await (0, incident_service_1.getIncidentsForProject)(projectId, userId);
        return res.status(200).json({
            success: true,
            data: incidents
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch incidents"
        });
    }
};
exports.getIncidentsController = getIncidentsController;
const getIncidentByIdController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const incidentId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const incident = await (0, incident_service_1.getIncidentByIdForUser)(incidentId, userId);
        return res.status(200).json({
            success: true,
            data: incident
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch incident"
        });
    }
};
exports.getIncidentByIdController = getIncidentByIdController;
const updateIncidentStatusController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const incidentId = req.params.id;
        const status = req.body.status;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        if (!["OPEN", "RESOLVED", "IGNORED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid incident status"
            });
        }
        const incident = await (0, incident_service_1.updateIncidentStatus)({
            incidentId,
            userId,
            status
        });
        return res.status(200).json({
            success: true,
            message: "Incident status updated successfully",
            data: incident
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update incident status"
        });
    }
};
exports.updateIncidentStatusController = updateIncidentStatusController;
