"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectByIdController = exports.getProjectsController = exports.createProjectController = void 0;
const project_service_1 = require("../services/project.service");
const createProjectController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const project = await (0, project_service_1.createProject)({
            name: req.body.name,
            organizationId: req.body.organizationId,
            userId
        });
        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create project"
        });
    }
};
exports.createProjectController = createProjectController;
const getProjectsController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const projects = await (0, project_service_1.getProjectsForUser)(userId);
        return res.status(200).json({
            success: true,
            data: projects
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch projects"
        });
    }
};
exports.getProjectsController = getProjectsController;
const getProjectByIdController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const projectId = req.params.id;
        const project = await (0, project_service_1.getProjectByIdForUser)(projectId, userId);
        return res.status(200).json({
            success: true,
            data: project
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch project"
        });
    }
};
exports.getProjectByIdController = getProjectByIdController;
