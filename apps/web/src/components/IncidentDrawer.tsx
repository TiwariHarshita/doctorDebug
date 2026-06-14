import { Sparkles } from "lucide-react";
import type { AiAnalysis, IncidentDetail, IncidentStatus } from "../types";

type IncidentDrawerProps = {
  selectedIncident: IncidentDetail | null;
  aiAnalysis: AiAnalysis | null;
  isIncidentLoading: boolean;
  isAiLoading: boolean;
  onClose: () => void;
  onAnalyzeIncident: () => void;
  onUpdateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
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

function IncidentDrawer({
  selectedIncident,
  aiAnalysis,
  isIncidentLoading,
  isAiLoading,
  onClose,
  onAnalyzeIncident,
  onUpdateIncidentStatus
}: IncidentDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/25">
      <div onClick={onClose} className="flex-1" />

      <aside className="h-full w-[560px] overflow-y-auto bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-[#6B7280]">Incident Detail</p>

            <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-[-0.045em] text-[#111111]">
              {isIncidentLoading ? "Loading incident..." : selectedIncident?.title}
            </h2>
          </div>

          <button
            onClick={onClose}
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
                onClick={onAnalyzeIncident}
                disabled={isAiLoading}
                className="flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles size={16} />
                {isAiLoading ? "Analyzing..." : "Analyze with AI"}
              </button>

              {selectedIncident.status !== "RESOLVED" && (
                <button
                  onClick={() =>
                    onUpdateIncidentStatus(selectedIncident.id, "RESOLVED")
                  }
                  className="rounded-full bg-[#DDF8E7] px-5 py-3 text-sm font-extrabold text-[#16A34A]"
                >
                  Mark Resolved
                </button>
              )}

              {selectedIncident.status !== "IGNORED" && (
                <button
                  onClick={() =>
                    onUpdateIncidentStatus(selectedIncident.id, "IGNORED")
                  }
                  className="rounded-full bg-[#F3F4F6] px-5 py-3 text-sm font-extrabold text-[#4B5563]"
                >
                  Ignore
                </button>
              )}

              {selectedIncident.status !== "OPEN" && (
                <button
                  onClick={() =>
                    onUpdateIncidentStatus(selectedIncident.id, "OPEN")
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
                  <AiBlock title="Root Cause" body={aiAnalysis.rootCause} />
                  <AiBlock title="Suggested Fix" body={aiAnalysis.suggestedFix} />

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

                  <AiBlock title="Severity Reason" body={aiAnalysis.severityReason} />
                  <AiBlock title="Prevention Tip" body={aiAnalysis.preventionTip} />

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
  );
}

function AiBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] bg-white p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {title}
      </p>

      <p className="mt-3 text-sm font-semibold leading-6 text-[#374151]">
        {body}
      </p>
    </div>
  );
}

export default IncidentDrawer;