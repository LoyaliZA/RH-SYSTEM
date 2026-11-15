import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  plannedModules,
  primaryModules,
  type AppModule,
} from "@/features/modules/catalog";
import { cn } from "@/lib/utils";

import { useSidebarPreference } from "./use-sidebar";

type SidebarProps = {
  companyName?: string | null;
  companyStatus?: "loading" | "ready" | "error";
};

export function Sidebar({ companyName = null, companyStatus = "ready" }: SidebarProps) {
  const { expanded, toggle } = useSidebarPreference();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) {
        return;
      }
      if (event.key.toLowerCase() !== "b") {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }
      event.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const toggleLabel = expanded ? "Contraer navegación" : "Expandir navegación";

  return (
    <aside
      id="navegacion"
      data-expanded={expanded ? "true" : "false"}
      className={cn(
        "flex h-svh shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        expanded ? "w-60" : "w-16",
        "transition-[width] duration-[var(--motion-panel)] ease-out motion-reduce:transition-none",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3",
          !expanded && "justify-center px-0",
        )}
      >
        <BrandMark className="size-8" />
        <span className={cn("truncate text-sm font-semibold", !expanded && "sr-only")}>
          RH System
        </span>
      </div>
      {expanded ? (
        <div className="px-2 pt-2">
          <Link
            to="/companies"
            title={companyLabel(companyName, companyStatus)}
            className="block rounded-xl bg-sidebar-accent px-3 py-2 text-sm leading-5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block">Empresa activa:</span>
            <span className="block truncate font-semibold">
              {companyLabel(companyName, companyStatus)}
            </span>
          </Link>
        </div>
      ) : null}
      <nav
        id="navegacion-modulos"
        aria-label="Módulos"
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2"
      >
        {primaryModules.map((module) => (
          <SidebarLink key={module.id} module={module} expanded={expanded} />
        ))}
        <p
          className={cn(
            "px-3 pt-4 pb-1 text-xs font-medium text-muted-foreground",
            !expanded && "sr-only",
          )}
        >
          En preparación
        </p>
        {expanded ? null : <div className="mx-2 my-1 border-t border-sidebar-border" />}
        {plannedModules.map((module) => (
          <SidebarLink key={module.id} module={module} expanded={expanded} />
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size={expanded ? "default" : "icon"}
              aria-expanded={expanded}
              aria-controls="navegacion-modulos"
              aria-label={toggleLabel}
              className={cn(
                "text-sidebar-foreground hover:bg-sidebar-accent",
                expanded ? "w-full justify-start px-3" : "mx-auto",
              )}
              onClick={toggle}
            >
              {expanded ? (
                <PanelLeftClose className="size-4" aria-hidden="true" />
              ) : (
                <PanelLeftOpen className="size-4" aria-hidden="true" />
              )}
              <span className={expanded ? "truncate" : "sr-only"}>{toggleLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{toggleLabel} (Ctrl+B)</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}

function companyLabel(
  companyName: string | null,
  companyStatus: "loading" | "ready" | "error",
) {
  if (companyStatus === "loading") {
    return "Cargando empresa…";
  }
  if (companyStatus === "error") {
    return "Empresa no disponible";
  }
  return companyName ?? "Sin empresa activa";
}

function SidebarLink({ module, expanded }: { module: AppModule; expanded: boolean }) {
  const link = (
    <NavLink
      to={module.to}
      end={module.to === "/"}
      className={({ isActive }) =>
        cn(
          "flex h-10 items-center gap-3 rounded-md px-3 text-sm text-sidebar-foreground transition-colors duration-[var(--motion-fast)]",
          !expanded && "justify-center px-0",
          isActive ? "bg-primary-soft font-medium" : "hover:bg-sidebar-accent/70",
        )
      }
    >
      {({ isActive }) => (
        <>
          <module.icon
            className={cn(
              "size-4 shrink-0",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
          <span
            className={cn(expanded ? "min-w-0 flex-1 truncate text-left" : "sr-only")}
          >
            {module.label}
          </span>
        </>
      )}
    </NavLink>
  );

  if (expanded) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{module.label}</TooltipContent>
    </Tooltip>
  );
}
