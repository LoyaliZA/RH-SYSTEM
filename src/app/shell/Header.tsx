import { Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { findModule } from "@/features/modules/catalog";
import type { Theme } from "@/app/theme";

type HeaderProps = {
  companyName: string | null;
  companyStatus: "loading" | "ready" | "error";
  theme: Theme;
  onToggleTheme: () => void;
};

export function Header({
  companyName,
  companyStatus,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const { pathname } = useLocation();
  const themeLabel = theme === "dark" ? "Activar tema claro" : "Activar tema oscuro";
  let companyLabel = "Sin empresa activa";
  if (companyStatus === "loading") {
    companyLabel = "Cargando empresa…";
  } else if (companyStatus === "error") {
    companyLabel = "Empresa no disponible";
  } else if (companyName) {
    companyLabel = companyName;
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <p className="hidden shrink-0 text-sm font-semibold text-foreground sm:block">
        {sectionTitle(pathname)}
      </p>
      <Link
        to="/companies"
        title={companyLabel}
        className="ml-auto min-w-0 truncate text-sm text-foreground"
      >
        <span className="text-muted-foreground">Empresa activa: </span>
        {companyLabel}
      </Link>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label={themeLabel}
            onClick={onToggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{themeLabel}</TooltipContent>
      </Tooltip>
    </header>
  );
}

function sectionTitle(pathname: string): string {
  if (pathname === "/") {
    return "Inicio";
  }
  if (pathname.startsWith("/companies")) {
    return "Empresas";
  }
  const moduleId = pathname.split("/").filter(Boolean)[1];
  if (pathname.startsWith("/modules/") && moduleId) {
    return findModule(moduleId)?.label ?? "Módulo";
  }
  return "RH System";
}
