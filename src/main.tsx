import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "@fontsource/plus-jakarta-sans/latin-400.css";
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-600.css";
import "@fontsource/plus-jakarta-sans/latin-700.css";

import { App } from "@/app/App";
import { ThemeProvider } from "@/app/theme";
import { CompanyProvider } from "@/features/companies/company-context";
import { CompaniesPage } from "@/features/companies/CompaniesPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { PlaceholderPage } from "@/features/modules/PlaceholderPage";
import { JobsPage } from "@/features/jobs/JobsPage";
import { PersonnelFilePage } from "@/features/personnel/PersonnelFilePage";
import { PersonnelFilesPage } from "@/features/personnel/PersonnelFilesPage";

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
              <Route path="files" element={<PersonnelFilesPage />} />
              <Route path="files/:fileId" element={<PersonnelFilePage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="modules/:moduleId" element={<PlaceholderPage />} />
            </Route>
          </Routes>
        </CompanyProvider>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);
