import { useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { plannedModules, primaryModules } from "@/features/modules/catalog";
import { cn } from "@/lib/utils";

import { useCompanies } from "../companies/company-context";

export function DashboardPage() {
  const { status, companies, activeCompany, pending, activate, reload } =
    useCompanies();
  const [switchError, setSwitchError] = useState<string | null>(null);

  async function changeCompany(id: string) {
    if (!id || id === activeCompany?.id) {
      return;
    }
    setSwitchError(null);
    const result = await activate(id);
    if (!result.ok) {
      setSwitchError(result.formError ?? "No se pudo cambiar la empresa.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Inicio"
        description="Este escritorio guarda las empresas en el equipo. El resto de los módulos de recursos humanos todavía no está implementado."
      />

      <section className="flex flex-col gap-3" aria-labelledby="empresa-titulo">
        <h2 id="empresa-titulo" className="text-lg font-semibold tracking-tight">
          Empresa de trabajo
        </h2>
        {status === "loading" ? <LoadingState label="Cargando empresa…" /> : null}
        {status === "error" ? (
          <ErrorState
            message="No se pudo consultar la empresa activa."
            onRetry={() => void reload()}
          />
        ) : null}
        {status === "ready" && companies.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-5 py-4 shadow-card">
            <p className="text-base text-foreground">Sin empresa activa.</p>
            <p className="mt-2 max-w-[68ch] text-base text-muted-foreground">
              Crea la primera empresa para usarla en el resto del escritorio.
            </p>
            <p className="mt-4">
              <Link
                to="/companies"
                className="text-sm font-medium text-primary-ink underline decoration-primary-ink/40 underline-offset-4"
              >
                Ir a empresas
              </Link>
            </p>
          </div>
        ) : null}
        {status === "ready" && companies.length > 0 ? (
          <div className="rounded-lg border border-border bg-card px-5 py-4 shadow-card">
            <div className="space-y-2">
              <Label htmlFor="company-selector">Elegir empresa</Label>
              <NativeSelect
                id="company-selector"
                value={activeCompany?.id ?? ""}
                disabled={pending}
                onChange={(event) => void changeCompany(event.target.value)}
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.displayName}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {switchError ? (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {switchError}
              </p>
            ) : null}
            {activeCompany ? (
              <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                <Detail term="Nombre visible" value={activeCompany.displayName} />
                <Detail term="Razón social" value={activeCompany.legalName} />
                <Detail
                  term="Identificador fiscal"
                  value={activeCompany.taxId ?? "Sin identificador"}
                  muted={!activeCompany.taxId}
                />
              </dl>
            ) : (
              <p className="mt-4 text-base text-muted-foreground">
                Ninguna empresa está marcada como activa.
              </p>
            )}
            <p className="mt-4">
              <Link
                to="/companies"
                className="text-sm font-medium text-primary-ink underline decoration-primary-ink/40 underline-offset-4"
              >
                Administrar empresas
              </Link>
            </p>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="indicadores-titulo">
        <h2 id="indicadores-titulo" className="text-lg font-semibold tracking-tight">
          Indicadores
        </h2>
        <p className="max-w-[68ch] text-base text-muted-foreground">
          Todavía no hay indicadores. Cuando existan expedientes, asistencia o
          prenómina, el resumen aparecerá aquí. No se muestran cifras de ejemplo.
        </p>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="modulos-titulo">
        <h2 id="modulos-titulo" className="text-lg font-semibold tracking-tight">
          Módulos
        </h2>
        <ModuleGroup title="Disponibles" modules={primaryModules} />
        <ModuleGroup title="En preparación" modules={plannedModules} />
      </section>
    </div>
  );
}

function Detail({
  term,
  value,
  muted = false,
}: {
  term: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd
        className={cn(
          "mt-1 text-base",
          muted ? "text-muted-foreground" : "font-medium",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function ModuleGroup({
  title,
  modules,
}: {
  title: string;
  modules: typeof primaryModules;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="rounded-lg shadow-card">
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {modules.map((module) => (
            <li key={module.id}>
              <Link
                to={module.to}
                className="flex gap-3 px-4 py-3 hover:bg-muted/70 focus-visible:bg-muted/70"
              >
                <module.icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    module.implemented ? "text-primary-ink" : "text-muted-foreground",
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="font-medium text-foreground">{module.label}</span>{" "}
                    <span className="text-sm text-muted-foreground">
                      {module.implemented ? "Disponible" : "En preparación"}
                    </span>
                  </span>{" "}
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {module.summary}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
