"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeIncidentController = void 0;
const ai_service_1 = require("../services/ai.service");
const analyzeIncidentController = async (req, res) => {
    try {
        const incidentId = req.params.id;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const analysis = await (0, ai_service_1.analyzeIncidentWithAI)({
            incidentId,
            userId
        });
        res.json({
            success: true,
            data: analysis
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to analyze incident";
        res.status(400).json({
            success: false,
            message
        });
    }
};
exports.analyzeIncidentController = analyzeIncidentController;
