import crypto from "crypto";

type FingerprintInput = {
  message: string;
  stack?: string;
  service?: string;
  route?: string;
};

const normalizeMessage = (message: string) => {
  return message
    .toLowerCase()
    .replace(/reading [a-zA-Z0-9_$]+/g, "reading <property>")
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/g, "<uuid>")
    .replace(/\d+/g, "<number>")
    .trim();
};

const getTopStackFrame = (stack?: string) => {
  if (!stack) return "";

  const lines = stack.split("\n").map((line) => line.trim());

  return lines[1] || lines[0] || "";
};

export const generateFingerprint = (input: FingerprintInput) => {
  const normalizedMessage = normalizeMessage(input.message);
  const topStackFrame = getTopStackFrame(input.stack);

  const rawFingerprint = [
    input.service || "",
    input.route || "",
    normalizedMessage,
    topStackFrame
  ].join("|");

  return crypto.createHash("sha256").update(rawFingerprint).digest("hex");
};

export const createIncidentTitle = (message: string) => {
  return message.length > 120 ? `${message.slice(0, 120)}...` : message;
};