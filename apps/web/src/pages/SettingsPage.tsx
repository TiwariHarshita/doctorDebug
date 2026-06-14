import type { CurrentUser } from "../types";

type SettingsPageProps = {
  currentUser: CurrentUser | null;
};

function SettingsPage({ currentUser }: SettingsPageProps) {
  return (
    <main className="flex-1 px-10 py-8">
      <div className="mb-8">
        <h1 className="text-[34px] font-extrabold tracking-[-0.04em] text-[#111111]">
          Settings
        </h1>

        <p className="mt-1 text-[15px] font-medium text-[#6B7280]">
          Manage workspace settings and account preferences.
        </p>
      </div>

      <div className="max-w-2xl rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h2 className="text-xl font-extrabold">Account</h2>

        <div className="mt-6 space-y-5">
          <SettingRow label="Name" value={currentUser?.name || "User"} />
          <SettingRow label="Email" value={currentUser?.email || "Not loaded"} />
          <SettingRow label="User ID" value={currentUser?.id || "Not loaded"} />
        </div>
      </div>
    </main>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F8FB] px-5 py-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {label}
      </p>

      <p className="mt-2 break-all text-sm font-bold text-[#111111]">
        {value}
      </p>
    </div>
  );
}

export default SettingsPage;