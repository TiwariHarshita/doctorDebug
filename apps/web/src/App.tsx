import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import LoginPage from "./LoginPage";
import ApiKeysPage from "./ApiKeysPage";
import EventsPage from "./EventsPage";
import RegisterPage from "./RegisterPage";
import {
  Bell,
  Bug,
  ChartNoAxesColumn,
  ChevronDown,
  Clock,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import { api } from "./lib/api";

//const FALLBACK_PROJECT_ID = "b7f922dc-9d2d-4fe4-8a91-82e6f40876cd";

type Project = {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectStats = {
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
type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

type Incident = {
  id: string;
  title: string;
  fingerprint: string;
  status: "OPEN" | "RESOLVED" | "IGNORED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  eventCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  projectId: string;
};

type IncidentEvent = {
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

type IncidentDetail = Incident & {
  events: IncidentEvent[];
};

type AiAnalysis = {
  rootCause: string;
  suggestedFix: string;
  debugChecklist: string[];
  severityReason: string;
  preventionTip: string;
  providerError?: string;
};

const activity = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 4 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 7 },
  { day: "Fri", count: 5 },
  { day: "Sat", count: 6 },
  { day: "Sun", count: 4 }
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/dashboard" },
  { icon: Bug, label: "Events", path: "/events" },
  { icon: ChartNoAxesColumn, label: "Analytics", path: "/dashboard" },
  { icon: KeyRound, label: "API Keys", path: "/api-keys" },
  { icon: Settings, label: "Settings", path: "/dashboard" }
] as const;

function getSeverityClass(severity: string) {
  if (severity === "CRITICAL") {
    return "bg-[#FFE1E1] text-[#DC2626]";
  }

  if (severity === "HIGH") {
    return "bg-[#FFF0D6] text-[#D97706]";
  }

  if (severity === "MEDIUM") {
    return "bg-[#E8ECFF] text-[#4F46E5]";
  }

  return "bg-gray-100 text-gray-600";
}

function getStatusClass(status: string) {
  if (status === "OPEN") {
    return "bg-[#FFE1E1] text-[#DC2626]";
  }

  if (status === "RESOLVED") {
    return "bg-[#DDF8E7] text-[#16A34A]";
  }

  return "bg-gray-100 text-gray-600";
}

function formatLastSeen(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${diffDays} day ago`;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("debugpilot_token"));
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] =
    useState("");

  const [toastMessage, setToastMessage] = useState("");

  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedIncident, setSelectedIncident] =
    useState<IncidentDetail | null>(null);
  const [isIncidentDrawerOpen, setIsIncidentDrawerOpen] = useState(false);
  const [isIncidentLoading, setIsIncidentLoading] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const maxActivity = Math.max(...activity.map((item) => item.count));

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) || null;

  const topService = stats?.topServices[0];
  const topRoute = stats?.topRoutes[0];

  const mostUrgentIncident = useMemo(() => {
    const severityRank = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };

    return [...incidents]
      .filter((incident) => incident.status === "OPEN")
      .sort(
        (a, b) =>
          severityRank[b.severity] - severityRank[a.severity] ||
          b.eventCount - a.eventCount
      )[0];
  }, [incidents]);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  const fetchProjects = async () => {
  try {
    setIsLoading(true);
    setErrorMessage("");

    const response = await api.get("/projects");
    const data = response.data.data;

    const projectList: Project[] = Array.isArray(data)
      ? data
      : data.projects || [];

    setProjects(projectList);

    if (projectList.length > 0) {
      setSelectedProjectId((currentProjectId) => {
        const stillExists = projectList.some(
          (project) => project.id === currentProjectId
        );

        return stillExists ? currentProjectId : projectList[0].id;
      });
    } else {
      setSelectedProjectId("");
      setStats(null);
      setIncidents([]);
      setIsLoading(false);
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      setErrorMessage(
        error.response?.data?.message || "Failed to load projects"
      );
    } else {
      setErrorMessage("Failed to load projects");
    }

    setIsLoading(false);
  }
};
    const fetchCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");

    const user =
      response.data.data?.user ||
      response.data.user ||
      response.data.data;

    setCurrentUser(user);
  } catch {
    setCurrentUser(null);
  }
};

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [statsResponse, incidentsResponse] = await Promise.all([
        api.get(`/projects/${selectedProjectId}/stats`),
        api.get(`/projects/${selectedProjectId}/incidents`)
      ]);

      setStats(statsResponse.data.data);
      setIncidents(incidentsResponse.data.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Failed to load dashboard data"
        );
      } else {
        setErrorMessage("Failed to load dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleIncidentClick = async (incidentId: string) => {
    try {
      setIsIncidentDrawerOpen(true);
      setIsIncidentLoading(true);
      setSelectedIncident(null);
      setAiAnalysis(null);

      const response = await api.get(`/incidents/${incidentId}`);

      setSelectedIncident(response.data.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Failed to load incident"
        );
      } else {
        setErrorMessage("Failed to load incident");
      }

      setIsIncidentDrawerOpen(false);
    } finally {
      setIsIncidentLoading(false);
    }
  };

  const handleUpdateIncidentStatus = async (
    incidentId: string,
    status: "OPEN" | "RESOLVED" | "IGNORED"
  ) => {
    try {
      const response = await api.patch(`/incidents/${incidentId}/status`, {
        status
      });

      const updatedIncident = response.data.data;

      setSelectedIncident((currentIncident) => {
        if (!currentIncident) {
          return currentIncident;
        }

        return {
          ...currentIncident,
          status: updatedIncident.status
        };
      });

      setIncidents((currentIncidents) =>
        currentIncidents.map((incident) =>
          incident.id === incidentId
            ? {
                ...incident,
                status: updatedIncident.status
              }
            : incident
        )
      );

      const statsResponse = await api.get(
        `/projects/${selectedProjectId}/stats`
      );
      setStats(statsResponse.data.data);

      if (status === "RESOLVED") {
        showToast("Incident marked as resolved");
      } else if (status === "IGNORED") {
        showToast("Incident ignored");
      } else {
        showToast("Incident reopened");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Failed to update incident status"
        );
      } else {
        setErrorMessage("Failed to update incident status");
      }
    }
  };

  const handleAnalyzeIncident = async () => {
    if (!selectedIncident) {
      return;
    }

    try {
      setIsAiLoading(true);
      setAiAnalysis(null);

      const response = await api.post(
        `/incidents/${selectedIncident.id}/analyze`
      );

      setAiAnalysis(response.data.data);
      showToast("AI analysis generated");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message || "Failed to analyze incident"
        );
      } else {
        setErrorMessage("Failed to analyze incident");
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
  if (!isAuthenticated) {
    return;
  }

  fetchCurrentUser();
  fetchProjects();
}, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated)
        {
      return;
    }
    if(!selectedProjectId){
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, selectedProjectId]);

  if (!isAuthenticated) {
  return (
    <Routes>
      <Route
        path="/register"
        element={
          <RegisterPage
            onRegisterSuccess={() => {
              setIsAuthenticated(true);
              navigate("/dashboard");
            }}
            onGoToLogin={() => navigate("/login")}
          />
        }
      />

      <Route
        path="/login"
        element={
          <LoginPage
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              navigate("/dashboard");
            }}
            onGoToRegister={() => navigate("/register")}
          />
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <div className="rounded-[28px] bg-white px-8 py-6 text-lg font-extrabold shadow-sm ring-1 ring-black/5">
          Loading DebugPilot dashboard...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
        <div className="max-w-md rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl font-extrabold">Could not load dashboard</h1>
          <p className="mt-3 text-sm font-medium text-[#6B7280]">
            {errorMessage}
          </p>
          <p className="mt-5 rounded-2xl bg-[#FFF3CC] p-4 text-sm font-bold text-[#92400E]">
            Make sure your API server is running and your JWT is stored in
            localStorage as debugpilot_token.
          </p>
        </div>
      </div>
    );
  }

  const DashboardPage = (
    <main className="flex-1 px-10 py-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-[#111111]">
            Overview
          </h1>
          <p className="mt-1 text-[15px] font-medium text-[#6B7280]">
            DebugPilot monitoring dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#111111] shadow-sm ring-1 ring-black/5">
            <Search size={20} />
          </button>

          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#111111] shadow-sm ring-1 ring-black/5">
            <Bell size={19} />
          </button>

          <div className="flex h-12 items-center gap-3 rounded-full bg-white px-3 pr-5 shadow-sm ring-1 ring-black/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DDEEFF] text-sm font-bold text-[#2563EB]">
  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
</div>
<span className="text-sm font-bold text-[#111111]">
  {currentUser?.name || "User"}
</span>
          </div>
        </div>
      </header>

      <section className="mb-9">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedProjectId}
                  onChange={(event) => {
                    setSelectedProjectId(event.target.value);
                    setSelectedIncident(null);
                    setIsIncidentDrawerOpen(false);
                    setAiAnalysis(null);
                  }}
                  className="appearance-none rounded-full bg-white py-2 pl-4 pr-11 text-[22px] font-extrabold tracking-[-0.035em] text-[#111111] shadow-sm outline-none ring-1 ring-black/5"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>

              <span className="flex items-center gap-2 rounded-full bg-[#E7F9EE] px-3 py-2 text-xs font-extrabold text-[#16A34A]">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                Live
              </span>
            </div>

            <p className="mt-3 text-sm font-medium text-[#6B7280]">
              {selectedProject
                ? `Project health and recent backend errors for ${selectedProject.name}`
                : "Project health and recent backend errors"}
            </p>
          </div>

          <button className="rounded-full bg-[#111111] px-5 py-3 text-sm font-bold text-white shadow-sm">
            View Project
          </button>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <div className="rounded-[28px] bg-[#DDEEFF] p-6">
            <p className="text-sm font-semibold text-[#4B5563]">
              Total Events
            </p>
            <h3 className="mt-4 text-[38px] font-extrabold tracking-[-0.04em]">
              {stats?.totalEvents ?? 0}
            </h3>
            <p className="mt-3 text-sm font-medium text-[#6B7280]">
              Captured from SDK
            </p>
          </div>

          <div className="rounded-[28px] bg-[#EEE5FF] p-6">
            <p className="text-sm font-semibold text-[#4B5563]">
              Open Incidents
            </p>
            <h3 className="mt-4 text-[38px] font-extrabold tracking-[-0.04em]">
              {stats?.openIncidents ?? 0}
            </h3>
            <p className="mt-3 text-sm font-bold text-[#EF4444]">
              Needs attention
            </p>
          </div>

          <div className="rounded-[28px] bg-[#DDF5E5] p-6">
            <p className="text-sm font-semibold text-[#4B5563]">Resolved</p>
            <h3 className="mt-4 text-[38px] font-extrabold tracking-[-0.04em]">
              {stats?.resolvedIncidents ?? 0}
            </h3>
            <p className="mt-3 text-sm font-bold text-[#16A34A]">
              Fixed incidents
            </p>
          </div>

          <div className="rounded-[28px] bg-[#FFF3CC] p-6">
            <p className="text-sm font-semibold text-[#4B5563]">
              Top Service
            </p>
            <h3 className="mt-5 text-[24px] font-extrabold tracking-[-0.04em]">
              {topService?.service ?? "No service"}
            </h3>
            <p className="mt-5 text-sm font-medium text-[#6B7280]">
              {topService?.count ?? 0} captured errors
            </p>
          </div>
        </div>
      </section>

      <section className="mb-7 grid grid-cols-[1.2fr_0.8fr] gap-7">
        <div className="rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-black/5">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <h2 className="text-[22px] font-extrabold tracking-[-0.035em]">
                Error Activity
              </h2>
              <p className="mt-1 text-sm font-medium text-[#6B7280]">
                Errors captured over the last 7 days
              </p>
            </div>

            <span className="rounded-full bg-[#F3F4F6] px-4 py-2 text-sm font-bold text-[#4B5563]">
              Last 7 days
            </span>
          </div>

          <div className="flex h-[180px] items-end gap-5">
            {activity.map((item) => {
              const height = (item.count / maxActivity) * 130 + 25;

              return (
                <div
                  key={item.day}
                  className="flex flex-1 flex-col items-center gap-3"
                >
                  <div className="flex h-[155px] w-full items-end justify-center rounded-2xl bg-[#F7F8FB] px-3">
                    <div
                      className="w-full max-w-[42px] rounded-t-2xl bg-[#111111]"
                      style={{ height }}
                    />
                  </div>

                  <span className="text-xs font-extrabold text-[#9CA3AF]">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-black/5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3CC]">
              <Clock size={20} />
            </div>

            <div>
              <h2 className="text-[22px] font-extrabold tracking-[-0.035em]">
                Response Focus
              </h2>
              <p className="text-sm font-medium text-[#6B7280]">
                Most urgent issue
              </p>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#FFF7E8] p-5">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${getSeverityClass(
                mostUrgentIncident?.severity || "LOW"
              )}`}
            >
              {mostUrgentIncident?.severity || "LOW"}
            </span>

            <h3 className="mt-4 text-xl font-extrabold leading-tight tracking-[-0.035em]">
              {mostUrgentIncident?.title || "No urgent incidents"}
            </h3>

            <p className="mt-3 text-sm font-medium leading-6 text-[#6B7280]">
              {mostUrgentIncident
                ? `${mostUrgentIncident.eventCount} events detected. Review this incident before lower severity issues.`
                : "Everything looks stable right now."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[1.55fr_1fr] gap-7">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[22px] font-extrabold tracking-[-0.035em]">
              Recent Incidents
            </h2>

            <button className="rounded-full bg-white px-5 py-3 text-sm font-bold shadow-sm ring-1 ring-black/5">
              View all
            </button>
          </div>

          <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FAFAFB] text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  <th className="px-6 py-5">Issue</th>
                  <th className="px-6 py-5">Severity</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Events</th>
                  <th className="px-6 py-5">Last Seen</th>
                </tr>
              </thead>

              <tbody>
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => handleIncidentClick(incident.id)}
                    className="cursor-pointer border-b border-gray-100 transition hover:bg-[#FAFAFB] last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <p className="max-w-[320px] text-sm font-extrabold leading-5 text-[#111827]">
                        {incident.title}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#6B7280]">
                        Incident ID: {incident.id.slice(0, 8)}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${getSeverityClass(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${getStatusClass(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-extrabold">
                      {incident.eventCount}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-[#6B7280]">
                      {formatLastSeen(incident.lastSeenAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] bg-[#101010] p-8 text-white shadow-sm">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={24} />
            </div>

            <p className="text-center text-sm font-semibold text-white/55">
              SDK Setup
            </p>

            <h3 className="mt-4 text-center text-[26px] font-extrabold leading-tight tracking-[-0.04em]">
              Capture errors automatically
            </h3>

            <p className="mx-auto mt-4 max-w-sm text-center text-sm font-medium leading-6 text-white/55">
              Add DebugPilot middleware once and monitor your backend in real
              time.
            </p>

            <div className="mt-7 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#111111]">
                  1
                </span>
                <p className="text-sm font-bold text-white/80">Install SDK</p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#111111]">
                  2
                </span>
                <p className="text-sm font-bold text-white/80">
                  Add project API key
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#111111]">
                  3
                </span>
                <p className="text-sm font-bold text-white/80">
                  Attach Express middleware
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 px-5 py-4 text-center font-mono text-[13px] font-semibold text-white/80">
              app.use(debugPilot.expressErrorHandler())
            </div>

            <div className="mt-6 flex justify-center">
              <button className="rounded-full bg-[#DDEEFF] px-6 py-3 text-sm font-extrabold text-[#111111]">
                View Docs
              </button>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-sm font-semibold text-[#6B7280]">Top Route</p>

            <h3 className="mt-5 text-[25px] font-extrabold tracking-[-0.04em]">
              {topRoute?.route ?? "No route"}
            </h3>

            <p className="mx-auto mt-4 max-w-xs text-sm font-medium leading-6 text-[#6B7280]">
              {topRoute
                ? `${topRoute.count} captured errors from this route.`
                : "No route activity yet."}
            </p>
          </div>
        </aside>
      </section>
    </main>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F8FB]">
      <aside className="group flex w-[92px] flex-col items-center bg-[#101010] px-4 py-6 text-white transition-all duration-300 hover:w-[220px]">
        <div className="mb-14 flex w-full items-center gap-3 overflow-hidden">
          <div className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-[#FFF4C7] text-[#111111]">
            <Zap size={23} strokeWidth={2.4} />
          </div>

          <div className="hidden group-hover:block">
            <p className="text-sm font-extrabold">DebugPilot</p>
            <p className="text-xs font-medium text-white/45">Monitor API</p>
          </div>
        </div>

        <nav className="flex w-full flex-1 flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex h-12 w-full items-center gap-3 rounded-2xl px-3 transition ${
                  location.pathname === item.path
                    ? "bg-white text-[#111111]"
                    : "text-white/45 hover:bg-white/10 hover:text-white"
                }`}
                title={item.label}
              >
                <Icon size={20} strokeWidth={2.2} />

                <span className="hidden whitespace-nowrap text-sm font-bold group-hover:block">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("debugpilot_token");
            setIsAuthenticated(false);
            navigate("/dashboard");
          }}
          className="flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-white/45 transition hover:bg-white/10 hover:text-white"
          title="Logout"
        >
          <LogOut size={20} />

          <span className="hidden whitespace-nowrap text-sm font-bold group-hover:block">
            Logout
          </span>
        </button>
      </aside>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={DashboardPage} />

        <Route
          path="/events"
          element={
            <EventsPage
              projectId={selectedProjectId}
              onBack={() => navigate("/dashboard")}
            />
          }
        />

        <Route
          path="/api-keys"
          element={
            <ApiKeysPage
              projectId={selectedProjectId}
              onBack={() => navigate("/dashboard")}
            />
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {isIncidentDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
          <div
            onClick={() => setIsIncidentDrawerOpen(false)}
            className="flex-1"
          />

          <aside className="h-full w-[560px] overflow-y-auto bg-white p-8 shadow-2xl">
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-[#6B7280]">
                  Incident Detail
                </p>

                <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-[-0.045em] text-[#111111]">
                  {isIncidentLoading
                    ? "Loading incident..."
                    : selectedIncident?.title}
                </h2>
              </div>

              <button
                onClick={() => setIsIncidentDrawerOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-xl font-bold text-[#111111]"
              >
                ×
              </button>
            </div>

            {isIncidentLoading && (
              <div className="rounded-[24px] bg-[#F7F8FB] p-6 text-sm font-bold text-[#6B7280]">
                Fetching latest incident data...
              </div>
            )}

            {!isIncidentLoading && selectedIncident && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAnalyzeIncident}
                    disabled={isAiLoading}
                    className="flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles size={16} />
                    {isAiLoading ? "Analyzing..." : "Analyze with AI"}
                  </button>

                  {selectedIncident.status !== "RESOLVED" && (
                    <button
                      onClick={() =>
                        handleUpdateIncidentStatus(
                          selectedIncident.id,
                          "RESOLVED"
                        )
                      }
                      className="rounded-full bg-[#DDF8E7] px-5 py-3 text-sm font-extrabold text-[#16A34A]"
                    >
                      Mark Resolved
                    </button>
                  )}

                  {selectedIncident.status !== "IGNORED" && (
                    <button
                      onClick={() =>
                        handleUpdateIncidentStatus(
                          selectedIncident.id,
                          "IGNORED"
                        )
                      }
                      className="rounded-full bg-[#F3F4F6] px-5 py-3 text-sm font-extrabold text-[#4B5563]"
                    >
                      Ignore
                    </button>
                  )}

                  {selectedIncident.status !== "OPEN" && (
                    <button
                      onClick={() =>
                        handleUpdateIncidentStatus(selectedIncident.id, "OPEN")
                      }
                      className="rounded-full bg-[#FFE1E1] px-5 py-3 text-sm font-extrabold text-[#DC2626]"
                    >
                      Reopen
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[24px] bg-[#F7F8FB] p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                      Severity
                    </p>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${getSeverityClass(
                        selectedIncident.severity
                      )}`}
                    >
                      {selectedIncident.severity}
                    </span>
                  </div>

                  <div className="rounded-[24px] bg-[#F7F8FB] p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                      Status
                    </p>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${getStatusClass(
                        selectedIncident.status
                      )}`}
                    >
                      {selectedIncident.status}
                    </span>
                  </div>

                  <div className="rounded-[24px] bg-[#F7F8FB] p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                      Events
                    </p>
                    <h3 className="mt-2 text-3xl font-extrabold">
                      {selectedIncident.eventCount}
                    </h3>
                  </div>

                  <div className="rounded-[24px] bg-[#F7F8FB] p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                      Last Seen
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold">
                      {formatLastSeen(selectedIncident.lastSeenAt)}
                    </h3>
                  </div>
                </div>

                <div className="rounded-[24px] bg-[#101010] p-5 text-white">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-white/40">
                    Fingerprint
                  </p>
                  <p className="mt-3 break-all font-mono text-xs leading-6 text-white/75">
                    {selectedIncident.fingerprint}
                  </p>
                </div>

                {aiAnalysis && (
                  <div className="rounded-[28px] bg-[#EEF2FF] p-6">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#4F46E5]">
                        <Sparkles size={21} />
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold tracking-[-0.035em]">
                          AI Incident Analysis
                        </h3>
                        <p className="text-sm font-semibold text-[#6B7280]">
                          Root cause, fix, and prevention plan
                        </p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[22px] bg-white p-5">
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                          Root Cause
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-6 text-[#374151]">
                          {aiAnalysis.rootCause}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-white p-5">
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                          Suggested Fix
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-6 text-[#374151]">
                          {aiAnalysis.suggestedFix}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-white p-5">
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                          Debug Checklist
                        </p>

                        <div className="mt-4 space-y-3">
                          {aiAnalysis.debugChecklist.map((item, index) => (
                            <div key={index} className="flex gap-3">
                              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#111111] text-xs font-extrabold text-white">
                                {index + 1}
                              </span>
                              <p className="text-sm font-semibold leading-6 text-[#374151]">
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-[22px] bg-white p-5">
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                          Severity Reason
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-6 text-[#374151]">
                          {aiAnalysis.severityReason}
                        </p>
                      </div>

                      <div className="rounded-[22px] bg-white p-5">
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                          Prevention Tip
                        </p>
                        <p className="mt-3 text-sm font-semibold leading-6 text-[#374151]">
                          {aiAnalysis.preventionTip}
                        </p>
                      </div>

                      {aiAnalysis.providerError && (
                        <div className="rounded-[22px] bg-[#FFF7E8] p-5">
                          <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#D97706]">
                            Provider fallback used
                          </p>
                          <p className="mt-3 break-words text-xs font-semibold leading-5 text-[#92400E]">
                            {aiAnalysis.providerError}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-4 text-xl font-extrabold tracking-[-0.035em]">
                    Latest Events
                  </h3>

                  <div className="space-y-4">
                    {selectedIncident.events.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm"
                      >
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-extrabold text-[#111111]">
                              {event.service || "unknown-service"}
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#6B7280]">
                              {event.route || "unknown-route"}
                            </p>
                          </div>

                          <span className="rounded-full bg-[#FFE1E1] px-3 py-1.5 text-xs font-extrabold text-[#DC2626]">
                            {event.level.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-sm font-semibold leading-6 text-[#374151]">
                          {event.message}
                        </p>

                        {event.stack && (
                          <pre className="mt-4 max-h-52 overflow-auto rounded-2xl bg-[#101010] p-4 text-xs leading-5 text-white/75">
                            {event.stack}
                          </pre>
                        )}

                        {event.metadata && (
                          <div className="mt-4 rounded-2xl bg-[#F7F8FB] p-4">
                            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                              Metadata
                            </p>
                            <pre className="overflow-auto text-xs font-semibold leading-5 text-[#4B5563]">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </div>
                        )}

                        <p className="mt-4 text-xs font-bold text-[#9CA3AF]">
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#101010] px-6 py-4 text-sm font-extrabold text-white shadow-2xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;