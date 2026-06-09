import {
  Bell,
  Bug,
  ChartNoAxesColumn,
  ChevronDown,
  Clock,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  Zap
} from "lucide-react";

const incidents = [
  {
    title: "Cannot read properties of undefined",
    service: "checkout-service",
    route: "/checkout/complete",
    status: "OPEN",
    events: 2,
    severity: "HIGH",
    lastSeen: "2 min ago"
  },
  {
    title: "Payment provider timeout",
    service: "payment-service",
    route: "/payment/confirm",
    status: "OPEN",
    events: 5,
    severity: "CRITICAL",
    lastSeen: "18 min ago"
  },
  {
    title: "Invalid coupon code format",
    service: "coupon-service",
    route: "/coupon/apply",
    status: "RESOLVED",
    events: 8,
    severity: "MEDIUM",
    lastSeen: "Yesterday"
  }
];

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
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FolderKanban, label: "Projects", active: false },
  { icon: Bug, label: "Incidents", active: false },
  { icon: ChartNoAxesColumn, label: "Analytics", active: false },
  { icon: Settings, label: "Settings", active: false }
];

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

  return "bg-[#DDF8E7] text-[#16A34A]";
}

function App() {
  const maxActivity = Math.max(...activity.map((item) => item.count));

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
                className={`flex h-12 w-full items-center gap-3 rounded-2xl px-3 transition ${
                  item.active
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
          className="flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-white/45 transition hover:bg-white/10 hover:text-white"
          title="Logout"
        >
          <LogOut size={20} />

          <span className="hidden whitespace-nowrap text-sm font-bold group-hover:block">
            Logout
          </span>
        </button>
      </aside>

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
                H
              </div>
              <span className="text-sm font-bold text-[#111111]">
                Harshita
              </span>
            </div>
          </div>
        </header>

        <section className="mb-9">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[22px] font-extrabold tracking-[-0.035em] shadow-sm ring-1 ring-black/5">
                  Checkout Backend
                  <ChevronDown size={18} />
                </button>

                <span className="flex items-center gap-2 rounded-full bg-[#E7F9EE] px-3 py-2 text-xs font-extrabold text-[#16A34A]">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                  Live
                </span>
              </div>

              <p className="mt-3 text-sm font-medium text-[#6B7280]">
                Project health and recent backend errors
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
                7
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
                3
              </h3>
              <p className="mt-3 text-sm font-bold text-[#EF4444]">
                Needs attention
              </p>
            </div>

            <div className="rounded-[28px] bg-[#DDF5E5] p-6">
              <p className="text-sm font-semibold text-[#4B5563]">
                Resolved
              </p>
              <h3 className="mt-4 text-[38px] font-extrabold tracking-[-0.04em]">
                1
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
                checkout
              </h3>
              <p className="mt-5 text-sm font-medium text-[#6B7280]">
                7 captured errors
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
              <span className="rounded-full bg-[#FFE1E1] px-3 py-1.5 text-xs font-extrabold text-[#DC2626]">
                CRITICAL
              </span>

              <h3 className="mt-4 text-xl font-extrabold leading-tight tracking-[-0.035em]">
                Payment provider timeout
              </h3>

              <p className="mt-3 text-sm font-medium leading-6 text-[#6B7280]">
                5 events detected from payment-service. Review this incident
                before lower severity issues.
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
                    <th className="px-6 py-5">Service</th>
                    <th className="px-6 py-5">Severity</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Events</th>
                    <th className="px-6 py-5">Last Seen</th>
                  </tr>
                </thead>

                <tbody>
                  {incidents.map((incident) => (
                    <tr
                      key={`${incident.title}-${incident.service}`}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="max-w-[260px] text-sm font-extrabold leading-5 text-[#111827]">
                          {incident.title}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#6B7280]">
                          {incident.route}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[#4B5563]">
                        {incident.service}
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
                        {incident.events}
                      </td>

                      <td className="px-6 py-5 text-sm font-semibold text-[#6B7280]">
                        {incident.lastSeen}
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
                  <p className="text-sm font-bold text-white/80">
                    Install SDK
                  </p>
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
              <p className="text-sm font-semibold text-[#6B7280]">
                Top Route
              </p>

              <h3 className="mt-5 text-[25px] font-extrabold tracking-[-0.04em]">
                /checkout/complete
              </h3>

              <p className="mx-auto mt-4 max-w-xs text-sm font-medium leading-6 text-[#6B7280]">
                Most frequent source of errors in this project.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;