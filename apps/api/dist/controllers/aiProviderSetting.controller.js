"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAiProviderSettingController = exports.setActiveAiProviderController = exports.saveAiProviderSettingController = exports.getAiProviderSettingsController = void 0;
const aiProviderSetting_service_1 = require("../services/aiProviderSetting.service");
const getAiProviderSettingsController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const status = await (0, aiProviderSetting_service_1.getUserAiProviderSettingStatus)(userId);
        return res.json({
            success: true,
            data: status
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch AI provider settings";
        return res.status(400).json({
            success: false,
            message
        });
    }
};
exports.getAiProviderSettingsController = getAiProviderSettingsController;
const saveAiProviderSettingController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const savedSetting = await (0, aiProviderSetting_service_1.saveUserAiProviderSetting)({
            userId,
            provider: req.body.provider,
            apiKey: req.body.apiKey,
            model: req.body.model,
            baseUrl: req.body.baseUrl
        });
        return res.json({
            success: true,
            message: "AI provider saved successfully",
            data: savedSetting
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save AI provider";
        return res.status(400).json({
            success: false,
            message
        });
    }
};
exports.saveAiProviderSettingController = saveAiProviderSettingController;
const setActiveAiProviderController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const activeSetting = await (0, aiProviderSetting_service_1.setActiveUserAiProvider)({
            userId,
            provider: req.body.provider
        });
        return res.json({
            success: true,
            message: "Active AI provider updated",
            data: activeSetting
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update active AI provider";
        return res.status(400).json({
            success: false,
            message
        });
    }
};
exports.setActiveAiProviderController = setActiveAiProviderController;
const deleteAiProviderSettingController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        await (0, aiProviderSetting_service_1.deleteUserAiProviderSetting)({
            userId,
            provider: req.params.provider
        });
        return res.json({
            success: true,
            message: "AI provider removed successfully"
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete AI provider";
        return res.status(400).json({
            success: false,
            message
        });
    }
};
exports.deleteAiProviderSettingController = deleteAiProviderSettingController;
