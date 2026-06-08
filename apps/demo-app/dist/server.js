"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dist_1 = require("../../../packages/sdk/dist");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const debugPilot = new dist_1.DebugPilot({
    apiKey: process.env.DEBUGPILOT_API_KEY || "",
    endpoint: "http://localhost:5050",
    service: "checkout-service",
    environment: "development"
});
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "demo-app"
    });
});
app.post("/checkout/complete", async (req, res) => {
    try {
        const user = undefined;
        const email = user.userEmail;
        res.json({
            success: true,
            email
        });
    }
    catch (error) {
        await debugPilot.captureError(error, {
            route: "/checkout/complete",
            metadata: {
                orderId: req.body.orderId || "unknown"
            }
        });
        res.status(500).json({
            success: false,
            message: "Checkout failed"
        });
    }
});
const PORT = 6060;
app.listen(PORT, () => {
    console.log(`Demo app running on port ${PORT}`);
});
