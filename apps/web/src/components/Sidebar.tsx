import { LogOut, Zap } from "lucide-react";
import { navItems } from "../constants/navItems";

type SidebarProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
};

function Sidebar({ currentPath, onNavigate, onLogout }: SidebarProps) {
  const isActiveRoute = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/" || currentPath === "/dashboard";
    }

    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
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
              onClick={() => onNavigate(item.path)}
              className={`flex h-12 w-full items-center gap-3 rounded-2xl px-3 transition ${
                isActiveRoute(item.path)
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
        onClick={onLogout}
        className="flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-white/45 transition hover:bg-white/10 hover:text-white"
        title="Logout"
      >
        <LogOut size={20} />

        <span className="hidden whitespace-nowrap text-sm font-bold group-hover:block">
          Logout
        </span>
      </button>
    </aside>
  );
}

export default Sidebar;