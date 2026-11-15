"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDecryptedActiveAiProviderSetting = exports.deleteUserAiProviderSetting = exports.setActiveUserAiProvider = exports.getUserAiProviderSettingStatus = exports.saveUserAiProviderSetting = void 0;
const prisma_1 = require("../config/prisma");
const aiKeyCrypto_1 = require("../utils/aiKeyCrypto");
const allowedProviders = [
    "OPENAI",
    "GEMINI",
    "ANTHROPIC",
    "OPENROUTER",
    "CUSTOM_OPENAI_COMPATIBLE"
];
const defaultModels = {
    OPENAI: "gpt-4o-mini",
    GEMINI: "gemini-1.5-flash",
    ANTHROPIC: "claude-3-5-haiku-latest",
    OPENROUTER: "openai/gpt-4o-mini",
    CUSTOM_OPENAI_COMPATIBLE: ""
};
const defaultBaseUrls = {
    OPENAI: "https://api.openai.com/v1",
    OPENROUTER: "https://openrouter.ai/api/v1"
};
const normalizeProvider = (provider) => {
    if (typeof provider !== "string") {
        throw new Error("AI provider is required");
    }
    const normalized = provider.trim().toUpperCase();
    if (!allowedProviders.includes(normalized)) {
        throw new Error("Unsupported AI provider");
    }
    return normalized;
};
const normalizeBaseUrl = ({ provider, baseUrl }) => {
    if (provider === "OPENAI" || provider === "OPENROUTER") {
        return defaultBaseUrls[provider] || null;
    }
    if (provider === "CUSTOM_OPENAI_COMPATIBLE") {
        if (!baseUrl || !baseUrl.trim()) {
            throw new Error("Base URL is required for a custom OpenAI-compatible provider");
        }
        return baseUrl.trim().replace(/\/$/, "");
    }
    return baseUrl?.trim() || null;
};
const saveUserAiProviderSetting = async ({ userId, provider, apiKey, model, baseUrl }) => {
    const normalizedProvider = normalizeProvider(provider);
    if (typeof apiKey !== "string" || apiKey.trim().length < 10) {
        throw new Error("Valid AI API key is required");
    }
    const normalizedModel = typeof model === "string" && model.trim()
        ? model.trim()
        : defaultModels[normalizedProvider];
    if (!normalizedModel) {
        throw new Error("Model name is required");
    }
    const normalizedBaseUrl = normalizeBaseUrl({
        provider: normalizedProvider,
        baseUrl: typeof baseUrl === "string" ? baseUrl : null
    });
    const encrypted = (0, aiKeyCrypto_1.encryptAiKey)(apiKey.trim());
    const savedSetting = await prisma_1.prisma.userAiProviderSetting.upsert({
        where: {
            userId_provider: {
                userId,
                provider: normalizedProvider
            }
        },
        update: {
            ...encrypted,
            model: normalizedModel,
            baseUrl: normalizedBaseUrl,
            keyPreview: (0, aiKeyCrypto_1.getKeyPreview)(apiKey),
            isActive: true
        },
        create: {
            userId,
            provider: normalizedProvider,
            model: normalizedModel,
            baseUrl: normalizedBaseUrl,
            ...encrypted,
            keyPreview: (0, aiKeyCrypto_1.getKeyPreview)(apiKey),
            isActive: true
        },
        select: {
            id: true,
            provider: true,
            model: true,
            baseUrl: true,
            keyPreview: true,
            isActive: true,
            updatedAt: true
        }
    });
    await prisma_1.prisma.userAiProviderSetting.updateMany({
        where: {
            userId,
            provider: {
                not: normalizedProvider
            }
        },
        data: {
            isActive: false
        }
    });
    return savedSetting;
};
exports.saveUserAiProviderSetting = saveUserAiProviderSetting;
const getUserAiProviderSettingStatus = async (userId) => {
    const settings = await prisma_1.prisma.userAiProviderSetting.findMany({
        where: { userId },
        orderBy: [
            { isActive: "desc" },
            { updatedAt: "desc" }
        ],
        select: {
            id: true,
            provider: true,
            model: true,
            baseUrl: true,
            keyPreview: true,
            isActive: true,
            updatedAt: true
        }
    });
    return {
        hasActiveProvider: settings.some((setting) => setting.isActive),
        settings
    };
};
exports.getUserAiProviderSettingStatus = getUserAiProviderSettingStatus;
const setActiveUserAiProvider = async ({ userId, provider }) => {
    const normalizedProvider = normalizeProvider(provider);
    const existingSetting = await prisma_1.prisma.userAiProviderSetting.findUnique({
        where: {
            userId_provider: {
                userId,
                provider: normalizedProvider
            }
        }
    });
    if (!existingSetting) {
        throw new Error("Save this provider key before making it active");
    }
    await prisma_1.prisma.userAiProviderSetting.updateMany({
        where: { userId },
        data: { isActive: false }
    });
    const activeSetting = await prisma_1.prisma.userAiProviderSetting.update({
        where: {
            userId_provider: {
                userId,
                provider: normalizedProvider
            }
        },
        data: { isActive: true },
        select: {
            id: true,
            provider: true,
            model: true,
            baseUrl: true,
            keyPreview: true,
            isActive: true,
            updatedAt: true
        }
    });
    return activeSetting;
};
exports.setActiveUserAiProvider = setActiveUserAiProvider;
const deleteUserAiProviderSetting = async ({ userId, provider }) => {
    const normalizedProvider = normalizeProvider(provider);
    const deletedSetting = await prisma_1.prisma.userAiProviderSetting.findUnique({
        where: {
            userId_provider: {
                userId,
                provider: normalizedProvider
            }
        },
        select: {
            isActive: true
        }
    });
    await prisma_1.prisma.userAiProviderSetting.deleteMany({
        where: {
            userId,
            provider: normalizedProvider
        }
    });
    if (deletedSetting?.isActive) {
        const nextSetting = await prisma_1.prisma.userAiProviderSetting.findFirst({
            where: { userId },
            orderBy: { updatedAt: "desc" }
        });
        if (nextSetting) {
            await prisma_1.prisma.userAiProviderSetting.update({
                where: { id: nextSetting.id },
                data: { isActive: true }
            });
        }
    }
    return true;
};
exports.deleteUserAiProviderSetting = deleteUserAiProviderSetting;
const getDecryptedActiveAiProviderSetting = async (userId) => {
    const setting = await prisma_1.prisma.userAiProviderSetting.findFirst({
        where: {
            userId,
            isActive: true
        },
        orderBy: {
            updatedAt: "desc"
        }
    });
    if (!setting) {
        throw new Error("Please add an AI provider key in Settings before using AI analysis.");
    }
    const provider = normalizeProvider(setting.provider);
    return {
        provider,
        apiKey: (0, aiKeyCrypto_1.decryptAiKey)({
            encryptedKey: setting.encryptedKey,
            iv: setting.iv,
            authTag: setting.authTag
        }),
        model: setting.model,
        baseUrl: setting.baseUrl
    };
};
exports.getDecryptedActiveAiProviderSetting = getDecryptedActiveAiProviderSetting;
