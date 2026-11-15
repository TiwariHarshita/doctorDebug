"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKeyPreview = exports.decryptAiKey = exports.encryptAiKey = void 0;
const crypto_1 = __importDefault(require("crypto"));
const getEncryptionKey = () => {
    const secret = process.env.AI_KEY_ENCRYPTION_SECRET;
    if (!secret) {
        throw new Error("AI_KEY_ENCRYPTION_SECRET is missing");
    }
    return crypto_1.default.createHash("sha256").update(secret).digest();
};
const encryptAiKey = (apiKey) => {
    const iv = crypto_1.default.randomBytes(12);
    const key = getEncryptionKey();
    const cipher = crypto_1.default.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
        cipher.update(apiKey, "utf8"),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    return {
        encryptedKey: encrypted.toString("hex"),
        iv: iv.toString("hex"),
        authTag: authTag.toString("hex")
    };
};
exports.encryptAiKey = encryptAiKey;
const decryptAiKey = ({ encryptedKey, iv, authTag }) => {
    const key = getEncryptionKey();
    const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(authTag, "hex"));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedKey, "hex")),
        decipher.final()
    ]);
    return decrypted.toString("utf8");
};
exports.decryptAiKey = decryptAiKey;
const getKeyPreview = (apiKey) => {
    const trimmedKey = apiKey.trim();
    if (trimmedKey.length <= 12) {
        return "••••••••";
    }
    return `${trimmedKey.slice(0, 6)}...${trimmedKey.slice(-4)}`;
};
exports.getKeyPreview = getKeyPreview;
