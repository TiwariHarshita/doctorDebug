import type { ProjectStats } from "../types";

type AnalyticsPageProps = {
  stats: ProjectStats | null;
};

function AnalyticsPage({ stats }: AnalyticsPageProps) {
  return (
    <main className="flex-1 px-10 py-8">
      <div className="mb-8">
        <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-[#111111]">
          Analytics
        </h1>

        <p className="mt-1 text-[15px] font-medium text-[#6B7280]">
          Track noisy services, routes, and incident patterns.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-6">
        <div className="rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-black/5">
          <h2 className="text-xl font-extrabold">Top Services</h2>

          <div className="mt-5 space-y-3">
            {(stats?.topServices || []).map((item) => (
              <div
                key={item.service}
                className="flex items-center justify-between rounded-2xl bg-[#F7F8FB] px-4 py-3"
              >
                <span className="text-sm font-bold">{item.service}</span>
                <span className="text-sm font-extrabold">{item.count}</span>
              </div>
            ))}

            {(!stats?.topServices || stats.topServices.length === 0) && (
              <p className="text-sm font-semibold text-[#6B7280]">
                No service data yet.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-7 shadow-sm ring-1 ring-black/5">
          <h2 className="text-xl font-extrabold">Top Routes</h2>

          <div className="mt-5 space-y-3">
            {(stats?.topRoutes || []).map((item) => (
              <div
                key={item.route}
                className="flex items-center justify-between rounded-2xl bg-[#F7F8FB] px-4 py-3"
              >
                <span className="text-sm font-bold">{item.route}</span>
                <span className="text-sm font-extrabold">{item.count}</span>
              </div>
            ))}

            {(!stats?.topRoutes || stats.topRoutes.length === 0) && (
              <p className="text-sm font-semibold text-[#6B7280]">
                No route data yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AnalyticsPage;