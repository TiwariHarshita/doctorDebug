import { Bell, Search } from "lucide-react";
import type { CurrentUser } from "../types";

type DashboardHeaderProps = {
  currentUser: CurrentUser | null;
};

function DashboardHeader({ currentUser }: DashboardHeaderProps) {
  return (
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
  );
}

export default DashboardHeader;