"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meController = exports.loginController = exports.registerController = void 0;
const auth_service_1 = require("../services/auth.service");
const registerController = async (req, res) => {
    try {
        const result = await (0, auth_service_1.registerUser)(req.body);
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
};
exports.registerController = registerController;
const loginController = async (req, res) => {
    try {
        const result = await (0, auth_service_1.loginUser)(req.body);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Login failed"
        });
    }
};
exports.loginController = loginController;
const meController = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const user = await (0, auth_service_1.getCurrentUser)(userId);
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch user"
        });
    }
};
exports.meController = meController;
