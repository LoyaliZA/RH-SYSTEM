import type { ReactNode } from "react";

import type { Theme } from "@/app/theme";

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
    <div className="flex h-svh bg-background text-foreground">
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
          className="min-h-0 flex-1 overflow-auto px-4 py-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
