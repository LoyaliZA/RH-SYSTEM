import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Theme } from "@/app/theme";

import { useSidebarPreference } from "./use-sidebar";

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
  const { expanded } = useSidebarPreference();
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
      {expanded ? null : (
        <Link
          to="/companies"
          title={companyLabel}
          className="min-w-0 truncate rounded-md text-sm text-foreground"
        >
          <span className="text-muted-foreground">Empresa activa: </span>
          <span className="font-semibold">{companyLabel}</span>
        </Link>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="ml-auto shrink-0"
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
