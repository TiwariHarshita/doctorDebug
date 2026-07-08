import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";

import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ApiKeysPage from "./ApiKeysPage";
import EventsPage from "./EventsPage";

import Sidebar from "./components/Sidebar";
import LoadingScreen from "./components/LoadingScreen";
import ErrorScreen from "./components/ErrorScreen";
import IncidentDrawer from "./components/IncidentDrawer";

import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import DocsPage from "./pages/DocsPage";

import type {
  AiAnalysis,
  CurrentUser,
  Incident,
  IncidentDetail,
  IncidentStatus,
  Project,
  ProjectStats
} from "./types";

import { api } from "./lib/api";

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem("debugpilot_token"));
  });

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const [selectedIncident, setSelectedIncident] =
    useState<IncidentDetail | null>(null);
  const [isIncidentDrawerOpen, setIsIncidentDrawerOpen] = useState(false);
  const [isIncidentLoading, setIsIncidentLoading] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) || null;

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

  const showToast = useCallback((message: string) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
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
  }, []);

  const fetchProjects = useCallback(async () => {
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
      setErrorMessage(getErrorMessage(error, "Failed to load projects"));
      setIsLoading(false);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!selectedProjectId) return;

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
      setErrorMessage(
        getErrorMessage(error, "Failed to load dashboard data")
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedIncident(null);
    setIsIncidentDrawerOpen(false);
    setAiAnalysis(null);
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
      setErrorMessage(getErrorMessage(error, "Failed to load incident"));
      setIsIncidentDrawerOpen(false);
    } finally {
      setIsIncidentLoading(false);
    }
  };

  const handleUpdateIncidentStatus = async (
    incidentId: string,
    status: IncidentStatus
  ) => {
    try {
      const response = await api.patch(`/incidents/${incidentId}/status`, {
        status
      });

      const updatedIncident = response.data.data;

      setSelectedIncident((currentIncident) => {
        if (!currentIncident) return currentIncident;

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

      if (selectedProjectId) {
        const statsResponse = await api.get(
          `/projects/${selectedProjectId}/stats`
        );

        setStats(statsResponse.data.data);
      }

      if (status === "RESOLVED") {
        showToast("Incident marked as resolved");
      } else if (status === "IGNORED") {
        showToast("Incident ignored");
      } else {
        showToast("Incident reopened");
      }
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Failed to update incident status")
      );
    }
  };

  const handleAnalyzeIncident = async () => {
    if (!selectedIncident) return;

    try {
      setIsAiLoading(true);
      setAiAnalysis(null);

      const response = await api.post(
        `/incidents/${selectedIncident.id}/analyze`
      );

      setAiAnalysis(response.data.data);
      showToast("AI analysis generated");
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to analyze incident"));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("debugpilot_token");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setProjects([]);
    setSelectedProjectId("");
    setStats(null);
    setIncidents([]);
    setSelectedIncident(null);
    setIsIncidentDrawerOpen(false);
    setAiAnalysis(null);
    navigate("/login");
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchCurrentUser();
    fetchProjects();
  }, [isAuthenticated, fetchCurrentUser, fetchProjects]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!selectedProjectId) return;

    fetchDashboardData();
  }, [isAuthenticated, selectedProjectId, fetchDashboardData]);

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
    return <LoadingScreen />;
  }

  if (errorMessage) {
    return <ErrorScreen message={errorMessage} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F7F8FB]">
      <Sidebar
        currentPath={location.pathname}
        onNavigate={(path) => navigate(path)}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <DashboardPage
              currentUser={currentUser}
              projects={projects}
              selectedProjectId={selectedProjectId}
              selectedProject={selectedProject}
              stats={stats}
              incidents={incidents}
              mostUrgentIncident={mostUrgentIncident}
              onProjectChange={handleProjectChange}
              onIncidentClick={handleIncidentClick}
              onViewDocs={() => navigate("/docs")}
            />
          }
        />

        <Route
          path="/projects"
          element={
            <ProjectsPage
              projects={projects}
              selectedProjectId={selectedProjectId}
              onProjectChange={handleProjectChange}
            />
          }
        />

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
          path="/analytics"
          element={<AnalyticsPage stats={stats} />}
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

        <Route
          path="/settings"
          element={<SettingsPage currentUser={currentUser} />}
        />

        <Route path="/docs" element={<DocsPage />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {isIncidentDrawerOpen && (
        <IncidentDrawer
          selectedIncident={selectedIncident}
          aiAnalysis={aiAnalysis}
          isIncidentLoading={isIncidentLoading}
          isAiLoading={isAiLoading}
          onClose={() => setIsIncidentDrawerOpen(false)}
          onAnalyzeIncident={handleAnalyzeIncident}
          onUpdateIncidentStatus={handleUpdateIncidentStatus}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 z-60 -translate-x-1/2 rounded-full bg-[#101010] px-6 py-4 text-sm font-extrabold text-white shadow-2xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;