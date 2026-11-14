import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { plannedModules, primaryModules } from "@/features/modules/catalog";

export function Sidebar() {
  return (
    <aside className="flex w-16 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:w-60">
      <div className="flex h-14 items-center border-b border-sidebar-border px-3">
        <span className="text-sm font-semibold tracking-tight lg:hidden">RH</span>
        <span className="hidden text-base font-semibold tracking-tight lg:inline">
          RH System
        </span>
      </div>
      <nav
        aria-label="Módulos"
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-2"
      >
        {primaryModules.map((module) => (
          <SidebarLink
            key={module.id}
            to={module.to}
            label={module.label}
            icon={module.icon}
          />
        ))}
        <p className="hidden px-3 pb-1 pt-6 text-xs font-medium text-muted-foreground lg:block">
          En preparación
        </p>
        {plannedModules.map((module) => (
          <SidebarLink
            key={module.id}
            to={module.to}
            label={module.label}
            icon={module.icon}
          />
        ))}
      </nav>
    </aside>
  );
}

function SidebarLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: (typeof primaryModules)[number]["icon"];
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      title={label}
      className={({ isActive }) =>
        cn(
          "flex h-10 items-center justify-center gap-3 rounded-md px-0 text-sm lg:justify-start lg:px-3",
          isActive
            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent/70",
        )
      }
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="sr-only lg:not-sr-only lg:truncate">{label}</span>
    </NavLink>
  );
}
