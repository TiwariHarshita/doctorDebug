"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeIncidentWithAI = void 0;
const prisma_1 = require("../config/prisma");
const aiProviderSetting_service_1 = require("./aiProviderSetting.service");
const aiProviderRunner_service_1 = require("./aiProviderRunner.service");
const extractJsonFromText = (text) => {
    const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("AI response did not contain JSON");
    }
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
};
const buildFallbackAnalysis = (outputText, providerName) => ({
    rootCause: "The AI provider returned a response that could not be parsed as JSON.",
    suggestedFix: outputText || "Try again with a model that follows JSON output instructions more reliably.",
    debugChecklist: [
        "Check the latest event message and stack trace manually.",
        "Confirm the route, service, and metadata attached to the incident.",
        "Run the failing request locally with the same payload."
    ],
    severityReason: "Structured severity reasoning could not be parsed from the AI response.",
    preventionTip: "Use a model that supports JSON output well, or lower temperature for stricter responses.",
    providerError: `${providerName} returned non-JSON output.`
});
const analyzeIncidentWithAI = async ({ incidentId, userId }) => {
    const incident = await prisma_1.prisma.incident.findUnique({
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
    const membership = await prisma_1.prisma.organizationMember.findUnique({
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
    const userAiSettings = await (0, aiProviderSetting_service_1.getDecryptedActiveAiProviderSetting)(userId);
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
Analyze this backend incident from DoctorDebug.

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
        const outputText = await (0, aiProviderRunner_service_1.runAiProvider)({
            settings: userAiSettings,
            prompt
        });
        try {
            return extractJsonFromText(outputText);
        }
        catch {
            return buildFallbackAnalysis(outputText, userAiSettings.provider);
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "AI analysis failed";
        throw new Error(message);
    }
};
exports.analyzeIncidentWithAI = analyzeIncidentWithAI;
