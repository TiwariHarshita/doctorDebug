"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIncidentTitle = exports.generateFingerprint = void 0;
const crypto_1 = __importDefault(require("crypto"));
const normalizeMessage = (message) => {
    return message
        .toLowerCase()
        .replace(/\(reading ['"`]?[a-zA-Z0-9_$]+['"`]?\)/g, "(reading <property>)")
        .replace(/reading ['"`]?[a-zA-Z0-9_$]+['"`]?/g, "reading <property>")
        .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/g, "<uuid>")
        .replace(/\d+/g, "<number>")
        .trim();
};
const normalizeStackFrame = (stack) => {
    if (!stack)
        return "";
    const lines = stack.split("\n").map((line) => line.trim());
    const firstUsefulFrame = lines.find((line) => line.startsWith("at ")) || "";
    return firstUsefulFrame
        .replace(/:\d+:\d+/g, ":<line>:<column>")
        .replace(/\/Users\/[^/]+/g, "/Users/<user>")
        .replace(/\/doctorDebug\/apps\/demo-app/g, "/app")
        .trim();
};
const generateFingerprint = (input) => {
    const normalizedMessage = normalizeMessage(input.message);
    const normalizedStackFrame = normalizeStackFrame(input.stack);
    const rawFingerprint = [
        input.service || "",
        input.route || "",
        normalizedMessage,
        normalizedStackFrame
    ].join("|");
    return crypto_1.default.createHash("sha256").update(rawFingerprint).digest("hex");
};
exports.generateFingerprint = generateFingerprint;
const createIncidentTitle = (message) => {
    return message.length > 120 ? `${message.slice(0, 120)}...` : message;
};
exports.createIncidentTitle = createIncidentTitle;
