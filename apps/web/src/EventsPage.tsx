import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Bug,
  Code2,
  Server,
  Route,
  Clock,
  Layers
} from "lucide-react";
import { api } from "./lib/api";

type EventIncident = {
  id: string;
  title: string;
  status: "OPEN" | "RESOLVED" | "IGNORED";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

type ApiEvent = {
  id: string;
  level: string;
  message: string;
  stack?: string;
  service?: string;
  route?: string;
  environment?: string;
  metadata?: Record<string, unknown>;
  projectId: string;
  incidentId?: string | null;
  createdAt: string;
  incident?: EventIncident | null;
};

type EventsPageProps = {
  projectId: string;
  onBack: () => void;
};

function getSeverityClass(severity?: string) {
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

function getStatusClass(status?: string) {
  if (status === "OPEN") {
    return "bg-[#FFE1E1] text-[#DC2626]";
  }

  if (status === "RESOLVED") {
    return "bg-[#DDF8E7] text-[#16A34A]";
  }

  return "bg-gray-100 text-gray-600";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString();
}

function EventsPage({ projectId, onBack }: EventsPageProps) {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await api.get(`/projects/${projectId}/events`);

      setEvents(response.data.data);
      setSelectedEvent(response.data.data[0] || null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Failed to load events");
      } else {
        setErrorMessage("Failed to load events");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <main className="flex-1 px-10 py-8">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="mb-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-[#111111] shadow-sm ring-1 ring-black/5"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>

          <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-[#111111]">
            Events
          </h1>

          <p className="mt-1 text-[15px] font-medium text-[#6B7280]">
            Raw errors and logs captured by the DebugPilot SDK.
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE1E1] text-[#DC2626]">
          <Bug size={26} />
        </div>
      </header>

      {errorMessage && (
        <div className="mb-6 rounded-[24px] bg-[#FFE1E1] p-5 text-sm font-bold text-[#DC2626]">
          {errorMessage}
        </div>
      )}

      <section className="grid grid-cols-[1fr_0.95fr] gap-7">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[22px] font-extrabold tracking-[-0.035em]">
              Recent Events
            </h2>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#6B7280] shadow-sm ring-1 ring-black/5">
              {events.length} events
            </span>
          </div>

          <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
            {isLoading ? (
              <div className="p-8 text-sm font-bold text-[#6B7280]">
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="p-8 text-sm font-bold text-[#6B7280]">
                No events captured yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`block w-full p-5 text-left transition hover:bg-[#FAFAFB] ${
                      selectedEvent?.id === event.id ? "bg-[#FAFAFB]" : "bg-white"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="line-clamp-1 text-sm font-extrabold text-[#111827]">
                          {event.message}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#6B7280]">
                          Event ID: {event.id.slice(0, 8)}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#FFE1E1] px-3 py-1.5 text-xs font-extrabold text-[#DC2626]">
                        {event.level.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-bold text-[#4B5563]">
                        {event.service || "unknown-service"}
                      </span>

                      <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-bold text-[#4B5563]">
                        {event.route || "unknown-route"}
                      </span>

                      {event.incident && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${getStatusClass(
                            event.incident.status
                          )}`}
                        >
                          {event.incident.status}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs font-semibold text-[#9CA3AF]">
                      {formatDate(event.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="sticky top-8 h-fit rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5">
          {!selectedEvent ? (
            <div className="text-sm font-bold text-[#6B7280]">
              Select an event to inspect details.
            </div>
          ) : (
            <div>
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#6B7280]">
                    Event Detail
                  </p>

                  <h2 className="mt-3 text-[25px] font-extrabold leading-tight tracking-[-0.04em]">
                    {selectedEvent.message}
                  </h2>
                </div>

                <span className="rounded-full bg-[#FFE1E1] px-3 py-1.5 text-xs font-extrabold text-[#DC2626]">
                  {selectedEvent.level.toUpperCase()}
                </span>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="rounded-[24px] bg-[#F7F8FB] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                    <Server size={18} />
                  </div>

                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Service
                  </p>

                  <p className="mt-2 break-words text-sm font-extrabold">
                    {selectedEvent.service || "unknown"}
                  </p>
                </div>

                <div className="rounded-[24px] bg-[#F7F8FB] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                    <Route size={18} />
                  </div>

                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Route
                  </p>

                  <p className="mt-2 break-words text-sm font-extrabold">
                    {selectedEvent.route || "unknown"}
                  </p>
                </div>

                <div className="rounded-[24px] bg-[#F7F8FB] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                    <Layers size={18} />
                  </div>

                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Environment
                  </p>

                  <p className="mt-2 break-words text-sm font-extrabold">
                    {selectedEvent.environment || "unknown"}
                  </p>
                </div>

                <div className="rounded-[24px] bg-[#F7F8FB] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                    <Clock size={18} />
                  </div>

                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Time
                  </p>

                  <p className="mt-2 break-words text-sm font-extrabold">
                    {formatDate(selectedEvent.createdAt)}
                  </p>
                </div>
              </div>

              {selectedEvent.incident && (
                <div className="mb-6 rounded-[24px] bg-[#FFF7E8] p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Linked Incident
                  </p>

                  <h3 className="mt-3 text-lg font-extrabold tracking-[-0.035em]">
                    {selectedEvent.incident.title}
                  </h3>

                  <div className="mt-4 flex gap-2">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${getSeverityClass(
                        selectedEvent.incident.severity
                      )}`}
                    >
                      {selectedEvent.incident.severity}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${getStatusClass(
                        selectedEvent.incident.status
                      )}`}
                    >
                      {selectedEvent.incident.status}
                    </span>
                  </div>
                </div>
              )}

              {selectedEvent.stack && (
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Code2 size={18} />
                    <h3 className="text-lg font-extrabold tracking-[-0.035em]">
                      Stack Trace
                    </h3>
                  </div>

                  <pre className="max-h-80 overflow-auto rounded-[24px] bg-[#101010] p-5 text-xs leading-5 text-white/75">
                    {selectedEvent.stack}
                  </pre>
                </div>
              )}

              {selectedEvent.metadata && (
                <div>
                  <h3 className="mb-3 text-lg font-extrabold tracking-[-0.035em]">
                    Metadata
                  </h3>

                  <pre className="max-h-72 overflow-auto rounded-[24px] bg-[#F7F8FB] p-5 text-xs font-semibold leading-5 text-[#4B5563]">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

export default EventsPage;