"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeApiKeyController = exports.getApiKeysController = exports.createApiKeyController = void 0;
const apiKey_service_1 = require("../services/apiKey.service");
const createApiKeyController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const result = await (0, apiKey_service_1.createApiKey)({
            name: req.body.name,
            projectId,
            userId
        });
        return res.status(201).json({
            success: true,
            message: "API key created successfully. Copy it now, it will not be shown again.",
            data: result
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create API key"
        });
    }
};
exports.createApiKeyController = createApiKeyController;
const getApiKeysController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const projectId = req.params.projectId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const apiKeys = await (0, apiKey_service_1.getApiKeysForProject)(projectId, userId);
        return res.status(200).json({
            success: true,
            data: apiKeys
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch API keys"
        });
    }
};
exports.getApiKeysController = getApiKeysController;
const revokeApiKeyController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const apiKeyId = req.params.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const apiKey = await (0, apiKey_service_1.revokeApiKey)(apiKeyId, userId);
        return res.status(200).json({
            success: true,
            message: "API key revoked successfully",
            data: apiKey
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to revoke API key"
        });
    }
};
exports.revokeApiKeyController = revokeApiKeyController;
