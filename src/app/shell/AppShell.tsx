import type { ReactNode } from "react";

import type { Theme } from "@/app/theme";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  companyName: string | null;
  companyStatus: "loading" | "ready" | "error";
  theme: Theme;
  onToggleTheme: () => void;
  children: ReactNode;
};

export function AppShell({
  companyName,
  companyStatus,
  theme,
  onToggleTheme,
  children,
}: AppShellProps) {
  return (
    <TooltipProvider>
      <div className="flex h-svh overflow-hidden bg-background text-foreground">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:text-sm focus:text-foreground"
        >
          Saltar al contenido
        </a>
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            companyName={companyName}
            companyStatus={companyStatus}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
          <main
            id="contenido"
            tabIndex={-1}
            className="min-h-0 flex-1 overflow-auto px-4 py-5 outline-none md:px-6 md:py-6"
          >
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
