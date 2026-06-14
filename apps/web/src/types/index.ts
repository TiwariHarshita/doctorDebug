export type Project = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

export type ProjectStats = {
  totalEvents: number;
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  ignoredIncidents: number;
  topServices: {
    service: string;
    count: number;
  }[];
  topRoutes: {
    route: string;
    count: number;
  }[];
};

export type IncidentStatus = "OPEN" | "RESOLVED" | "IGNORED";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Incident = {
  id: string;
  title: string;
  fingerprint: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  eventCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  projectId: string;
};

export type IncidentEvent = {
  id: string;
  level: string;
  message: string;
  stack?: string;
  service?: string;
  route?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type IncidentDetail = Incident & {
  events: IncidentEvent[];
};

export type AiAnalysis = {
  rootCause: string;
  suggestedFix: string;
  debugChecklist: string[];
  severityReason: string;
  preventionTip: string;
  providerError?: string;
};