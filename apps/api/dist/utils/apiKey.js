"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiKeyPrefix = exports.hashApiKey = exports.generateApiKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateApiKey = () => {
    const randomPart = crypto_1.default.randomBytes(32).toString("hex");
    return `dp_live_${randomPart}`;
};
exports.generateApiKey = generateApiKey;
const hashApiKey = (apiKey) => {
    return crypto_1.default.createHash("sha256").update(apiKey).digest("hex");
};
exports.hashApiKey = hashApiKey;
const getApiKeyPrefix = (apiKey) => {
    return apiKey.slice(0, 16);
};
exports.getApiKeyPrefix = getApiKeyPrefix;
