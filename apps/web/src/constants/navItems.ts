import {
  Bug,
  ChartNoAxesColumn,
  FolderKanban,
  KeyRound,
  LayoutDashboard,
  Settings
} from "lucide-react";

export const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: Bug, label: "Events", path: "/events" },
  { icon: ChartNoAxesColumn, label: "Analytics", path: "/analytics" },
  { icon: KeyRound, label: "API Keys", path: "/api-keys" },
  { icon: Settings, label: "Settings", path: "/settings" }
] as const;