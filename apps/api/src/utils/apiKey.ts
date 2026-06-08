import crypto from "crypto";

export const generateApiKey = () => {
  const randomPart = crypto.randomBytes(32).toString("hex");
  return `dp_live_${randomPart}`;
};

export const hashApiKey = (apiKey: string) => {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
};

export const getApiKeyPrefix = (apiKey: string) => {
  return apiKey.slice(0, 16);
};