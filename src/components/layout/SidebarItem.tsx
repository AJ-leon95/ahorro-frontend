import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

export default function SidebarItem({
  to,
  icon: Icon,
  label,
}: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
          isActive
            ? "bg-emerald-500 text-white"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}
