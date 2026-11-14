import { Outlet } from "react-router-dom";

import { AppShell } from "@/app/shell/AppShell";
import { useTheme } from "@/app/theme";
import { useCompanies } from "@/features/companies/company-context";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const { status, activeCompany } = useCompanies();

  return (
    <AppShell
      companyName={activeCompany?.displayName ?? null}
      companyStatus={status}
      theme={theme}
      onToggleTheme={toggleTheme}
    >
      <Outlet />
    </AppShell>
  );
}
