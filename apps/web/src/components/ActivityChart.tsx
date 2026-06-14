const activity = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 4 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 7 },
  { day: "Fri", count: 5 },
  { day: "Sat", count: 6 },
  { day: "Sun", count: 4 }
];

function ActivityChart() {
  const maxActivity = Math.max(...activity.map((item) => item.count));

  return (
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
            <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
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
  );
}

export default ActivityChart;