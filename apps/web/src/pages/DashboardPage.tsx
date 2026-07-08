import { Clock, ShieldCheck } from "lucide-react";
import type {
  CurrentUser,
  Incident,
  Project,
  ProjectStats
} from "../types";
import ActivityChart from "../components/ActivityChart";
import DashboardHeader from "../components/DashboardHeader";
import IncidentTable from "../components/IncidentTable";
import ProjectSelector from "../components/ProjectSelector";
import StatCard from "../components/StatCard";

type DashboardPageProps = {
  currentUser: CurrentUser | null;
  projects: Project[];
  selectedProjectId: string;
  selectedProject: Project | null;
  stats: ProjectStats | null;
  incidents: Incident[];
  mostUrgentIncident: Incident | undefined;
  onProjectChange: (projectId: string) => void;
  onIncidentClick: (incidentId: string) => void;
  onViewDocs: () => void;
};

function getSeverityClass(severity: string) {
  if (severity === "CRITICAL") return "bg-[#FFE1E1] text-[#DC2626]";
  if (severity === "HIGH") return "bg-[#FFF0D6] text-[#D97706]";
  if (severity === "MEDIUM") return "bg-[#E8ECFF] text-[#4F46E5]";

  return "bg-gray-100 text-gray-600";
}

function DashboardPage({
  currentUser,
  projects,
  selectedProjectId,
  selectedProject,
  stats,
  incidents,
  mostUrgentIncident,
  onProjectChange,
  onIncidentClick,
  onViewDocs
}: DashboardPageProps) {
  const topService = stats?.topServices[0];
  const topRoute = stats?.topRoutes[0];

  return (
    <main className="flex-1 px-10 py-8">
      <DashboardHeader currentUser={currentUser} />

      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProjectId}
        selectedProject={selectedProject}
        onProjectChange={onProjectChange}
      />

      <section className="mb-9 grid grid-cols-4 gap-5">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents ?? 0}
          description="Captured from SDK"
          className="bg-[#DDEEFF]"
        />

        <StatCard
          title="Open Incidents"
          value={stats?.openIncidents ?? 0}
          description="Needs attention"
          className="bg-[#EEE5FF]"
          descriptionClassName="text-[#EF4444] font-bold"
        />

        <StatCard
          title="Resolved"
          value={stats?.resolvedIncidents ?? 0}
          description="Fixed incidents"
          className="bg-[#DDF5E5]"
          descriptionClassName="text-[#16A34A] font-bold"
        />

        <div className="rounded-[28px] bg-[#FFF3CC] p-6">
          <p className="text-sm font-semibold text-[#4B5563]">Top Service</p>

          <h3 className="mt-5 text-[24px] font-extrabold tracking-[-0.04em]">
            {topService?.service ?? "No service"}
          </h3>

          <p className="mt-5 text-sm font-medium text-[#6B7280]">
            {topService?.count ?? 0} captured errors
          </p>
        </div>
      </section>

      <section className="mb-7 grid grid-cols-[1.2fr_0.8fr] gap-7">
        <ActivityChart />

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
        <IncidentTable
          incidents={incidents}
          onIncidentClick={onIncidentClick}
        />

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
              {[
                "Install SDK",
                "Add project API key",
                "Attach Express middleware"
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#111111]">
                    {index + 1}
                  </span>

                  <p className="text-sm font-bold text-white/80">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 px-5 py-4 text-center font-mono text-[13px] font-semibold text-white/80">
              app.use(debugPilot.expressErrorHandler())
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className="rounded-full bg-[#DDEEFF] px-6 py-3 text-sm font-extrabold text-[#111111] transition hover:bg-white"
                onClick={onViewDocs}
              >
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
}

export default DashboardPage;