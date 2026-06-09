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
    .replace(/\(reading ['"`]?[a-zA-Z0-9_$]+['"`]?\)/g, "(reading <property>)")
    .replace(/reading ['"`]?[a-zA-Z0-9_$]+['"`]?/g, "reading <property>")
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/g, "<uuid>")
    .replace(/\d+/g, "<number>")
    .trim();
};

const normalizeStackFrame = (stack?: string) => {
  if (!stack) return "";

  const lines = stack.split("\n").map((line) => line.trim());

  const firstUsefulFrame =
    lines.find((line) => line.startsWith("at ")) || "";

  return firstUsefulFrame
    .replace(/:\d+:\d+/g, ":<line>:<column>")
    .replace(/\/Users\/[^/]+/g, "/Users/<user>")
    .replace(/\/doctorDebug\/apps\/demo-app/g, "/app")
    .trim();
};

export const generateFingerprint = (input: FingerprintInput) => {
  const normalizedMessage = normalizeMessage(input.message);
  const normalizedStackFrame = normalizeStackFrame(input.stack);

  const rawFingerprint = [
    input.service || "",
    input.route || "",
    normalizedMessage,
    normalizedStackFrame
  ].join("|");

  return crypto.createHash("sha256").update(rawFingerprint).digest("hex");
};

export const createIncidentTitle = (message: string) => {
  return message.length > 120 ? `${message.slice(0, 120)}...` : message;
};