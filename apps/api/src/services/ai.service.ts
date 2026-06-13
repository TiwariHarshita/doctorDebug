import { GoogleGenAI } from "@google/genai";
import { prisma } from "../config/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

type AnalyzeIncidentInput = {
  incidentId: string;
  userId: string;
};

const extractJsonFromText = (text: string) => {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};

export const analyzeIncidentWithAI = async ({
  incidentId,
  userId
}: AnalyzeIncidentInput) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: {
      project: true,
      events: {
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      }
    }
  });

  if (!incident) {
    throw new Error("Incident not found");
  }

  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: incident.project.organizationId
      }
    }
  });

  if (!membership) {
    throw new Error("You do not have access to this incident");
  }

  const latestEvent = incident.events[0];

  if (!latestEvent) {
    throw new Error("No events found for this incident");
  }

  const promptData = {
    incident: {
      title: incident.title,
      status: incident.status,
      severity: incident.severity,
      eventCount: incident.eventCount,
      firstSeenAt: incident.firstSeenAt,
      lastSeenAt: incident.lastSeenAt
    },
    latestEvent: {
      level: latestEvent.level,
      message: latestEvent.message,
      stack: latestEvent.stack,
      service: latestEvent.service,
      route: latestEvent.route,
      environment: latestEvent.environment,
      metadata: latestEvent.metadata
    },
    recentEvents: incident.events.map((event) => ({
      message: event.message,
      stack: event.stack,
      service: event.service,
      route: event.route,
      metadata: event.metadata,
      createdAt: event.createdAt
    }))
  };

  const prompt = `
You are an expert backend debugging assistant.

Analyze this Node.js/Express backend incident.

Return JSON only.
Do not wrap it in markdown.
Do not add explanation outside JSON.
Do not invent facts.
If something is uncertain, mention what the developer should check.

Required JSON shape:
{
  "rootCause": "short explanation",
  "suggestedFix": "practical fix",
  "debugChecklist": ["step 1", "step 2", "step 3"],
  "severityReason": "why this severity makes sense",
  "preventionTip": "how to prevent this class of bug"
}

Incident data:
${JSON.stringify(promptData, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    const outputText = response.text || "";

    try {
      return extractJsonFromText(outputText);
    } catch {
      return {
        rootCause: "Gemini returned a non-JSON response.",
        suggestedFix: outputText,
        debugChecklist: [],
        severityReason: "Unable to parse structured severity reason.",
        preventionTip: "Try analyzing again."
      };
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gemini analysis failed";

    return {
      rootCause:
        "AI provider could not be reached or rejected the request. The incident itself appears to be caused by accessing a property on an undefined object.",
      suggestedFix:
        "Check where the user object is created before reading user.userEmail. Add validation before accessing the property, and return a controlled 400 or 401 response when user data is missing.",
      debugChecklist: [
        "Open the stack trace and identify the exact file and line where user.userEmail is accessed.",
        "Check whether authentication or request parsing middleware is supposed to attach the user object.",
        "Add a guard such as if (!user) before reading user.userEmail.",
        "Trigger the failing route again and confirm the incident stops repeating."
      ],
      severityReason:
        "This is high severity because the route crashes with a 500 error and affects the checkout completion flow.",
      preventionTip:
        "Use TypeScript strict typing, request validation, and centralized error handling so missing request data becomes a controlled error instead of a runtime crash.",
      providerError: message
    };
  }
};