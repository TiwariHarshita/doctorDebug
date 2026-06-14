import type { Incident } from "../types";

type IncidentTableProps = {
  incidents: Incident[];
  onIncidentClick: (incidentId: string) => void;
};

function getSeverityClass(severity: string) {
  if (severity === "CRITICAL") return "bg-[#FFE1E1] text-[#DC2626]";
  if (severity === "HIGH") return "bg-[#FFF0D6] text-[#D97706]";
  if (severity === "MEDIUM") return "bg-[#E8ECFF] text-[#4F46E5]";

  return "bg-gray-100 text-gray-600";
}

function getStatusClass(status: string) {
  if (status === "OPEN") return "bg-[#FFE1E1] text-[#DC2626]";
  if (status === "RESOLVED") return "bg-[#DDF8E7] text-[#16A34A]";

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

function IncidentTable({ incidents, onIncidentClick }: IncidentTableProps) {
  return (
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
                onClick={() => onIncidentClick(incident.id)}
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

        {incidents.length === 0 && (
          <div className="p-8 text-center text-sm font-bold text-[#6B7280]">
            No incidents yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidentTable;