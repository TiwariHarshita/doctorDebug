import crypto from "crypto";

const getEncryptionKey = () => {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET;

  if (!secret) {
    throw new Error("AI_KEY_ENCRYPTION_SECRET is missing");
  }

  return crypto.createHash("sha256").update(secret).digest();
};

export const encryptAiKey = (apiKey: string) => {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

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

export const decryptAiKey = ({
  encryptedKey,
  iv,
  authTag
}: {
  encryptedKey: string;
  iv: string;
  authTag: string;
}) => {
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedKey, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
};

export const getKeyPreview = (apiKey: string) => {
  const trimmedKey = apiKey.trim();

  if (trimmedKey.length <= 12) {
    return "••••••••";
  }

  return `${trimmedKey.slice(0, 6)}...${trimmedKey.slice(-4)}`;
};
