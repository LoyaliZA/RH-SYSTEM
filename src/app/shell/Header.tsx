import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background px-4 lg:px-8">
      <p className="min-w-0 truncate text-base font-medium text-foreground">
        {companyLabel}
      </p>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={themeLabel}
        onClick={onToggleTheme}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>
    </header>
  );
}
