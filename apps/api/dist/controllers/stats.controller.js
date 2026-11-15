"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStatsController = void 0;
const stats_service_1 = require("../services/stats.service");
const getProjectStatsController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const stats = await (0, stats_service_1.getProjectStats)(projectId, userId);
        return res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch project stats"
        });
    }
};
exports.getProjectStatsController = getProjectStatsController;
