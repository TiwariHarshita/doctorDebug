"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
router.post("/incidents/:id/analyze", auth_middleware_1.requireAuth, ai_controller_1.analyzeIncidentController);
exports.default = router;
