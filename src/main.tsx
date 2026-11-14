import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";

import { App } from "@/app/App";
import { ThemeProvider } from "@/app/theme";
import { CompanyProvider } from "@/features/companies/company-context";
import { CompaniesPage } from "@/features/companies/CompaniesPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { PlaceholderPage } from "@/features/modules/PlaceholderPage";

import "./index.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider>
      <HashRouter>
        <CompanyProvider>
          <Routes>
            <Route element={<App />}>
              <Route index element={<DashboardPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="modules/:moduleId" element={<PlaceholderPage />} />
            </Route>
          </Routes>
        </CompanyProvider>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);
