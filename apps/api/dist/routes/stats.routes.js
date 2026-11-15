"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const stats_controller_1 = require("../controllers/stats.controller");
const router = (0, express_1.Router)();
router.get("/projects/:projectId/stats", auth_middleware_1.requireAuth, stats_controller_1.getProjectStatsController);
exports.default = router;
