import { useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { Bento, BentoItem } from "@/components/ui/bento";
import { Card } from "@/components/ui/card";
import { IconWell } from "@/components/ui/icon-well";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { StatusLabel } from "@/components/ui/status-label";
import {
  plannedModules,
  primaryModules,
  type AppModule,
} from "@/features/modules/catalog";
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

      <Bento>
        <BentoItem span="lead" className="rh-enter">
          {status === "loading" ? <LoadingState label="Cargando empresa…" /> : null}
          {status === "error" ? (
            <ErrorState
              message="No se pudo consultar la empresa activa."
              onRetry={() => void reload()}
            />
          ) : null}
          {status === "ready" && companies.length === 0 ? (
            <Card className="flex h-full flex-col justify-between gap-6 p-6">
              <div>
                <h2 className="text-[2rem] leading-10 font-semibold tracking-[-0.02em] text-balance">
                  Sin empresa activa.
                </h2>
                <p className="mt-3 max-w-[36ch] text-sm leading-6 text-muted-foreground">
                  Crea la primera empresa para usarla en el resto del escritorio.
                </p>
              </div>
              <p>
                <Link
                  to="/companies"
                  className="text-sm font-medium text-primary-ink underline decoration-primary-ink/40 underline-offset-4"
                >
                  Ir a empresas
                </Link>
              </p>
            </Card>
          ) : null}
          {status === "ready" && companies.length > 0 ? (
            <Card className="flex h-full flex-col gap-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <IconWell tone="active" size="md">
                    <span className="text-sm font-semibold tracking-tight">
                      {monogram(
                        activeCompany?.legalName ?? activeCompany?.displayName ?? "",
                      )}
                    </span>
                  </IconWell>
                  {activeCompany ? (
                    <div className="min-w-0">
                      <h2 className="text-[2rem] leading-10 font-semibold tracking-[-0.02em] text-balance break-words">
                        {activeCompany.displayName}
                      </h2>
                      {activeCompany.tradeName ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activeCompany.legalName}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-base text-muted-foreground">
                      Ninguna empresa está marcada como activa.
                    </p>
                  )}
                </div>
                {activeCompany?.isActive ? (
                  <StatusLabel tone="active">Activa</StatusLabel>
                ) : null}
              </div>
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
                <p role="alert" className="text-sm text-destructive">
                  {switchError}
                </p>
              ) : null}
              {activeCompany ? (
                <p className="text-sm">
                  <span className="block text-muted-foreground">
                    Identificador fiscal
                  </span>
                  <span
                    className={cn(
                      "mt-1 block tabular-nums",
                      activeCompany.taxId
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {activeCompany.taxId ?? "Sin identificador"}
                  </span>
                </p>
              ) : null}
              <p className="mt-auto">
                <Link
                  to="/companies"
                  className="text-sm font-medium text-primary-ink underline decoration-primary-ink/40 underline-offset-4"
                >
                  Administrar empresas
                </Link>
              </p>
            </Card>
          ) : null}
        </BentoItem>

        <BentoItem span="aside">
          <Card className="flex h-full min-h-52 flex-col p-6">
            <h2
              id="indicadores-titulo"
              className="text-lg font-semibold tracking-tight"
            >
              Indicadores
            </h2>
            <p className="my-auto max-w-[34ch] pt-6 text-base leading-7 text-muted-foreground">
              Todavía no hay indicadores. Cuando existan expedientes, asistencia o
              prenómina, el resumen aparecerá aquí. No se muestran cifras de ejemplo.
            </p>
          </Card>
        </BentoItem>

        <BentoItem span="lead">
          <Card className="p-5">
            <h2 id="modulos-titulo" className="text-lg font-semibold tracking-tight">
              En preparación
            </h2>
            <ul className="mt-2">
              {plannedModules.map((module) => (
                <li key={module.id}>
                  <ModuleRow module={module} />
                </li>
              ))}
            </ul>
          </Card>
        </BentoItem>
        <BentoItem span="aside">
          <Card className="p-5">
            <h2 className="text-lg font-semibold tracking-tight">Disponibles</h2>
            <ul className="mt-2">
              {primaryModules.map((module) => (
                <li key={module.id}>
                  <ModuleRow module={module} />
                </li>
              ))}
            </ul>
          </Card>
        </BentoItem>
      </Bento>
    </div>
  );
}

function ModuleRow({ module }: { module: AppModule }) {
  return (
    <Link
      to={module.to}
      className="-mx-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 rounded-xl px-2 py-3 transition-colors duration-[var(--motion-fast)] hover:bg-muted/70"
    >
      <span className="flex min-w-0 gap-3">
        <IconWell tone={module.implemented ? "mintSoft" : "neutral"} size="sm">
          <module.icon aria-hidden="true" />
        </IconWell>
        <span className="min-w-0">
          <span className="block font-medium text-foreground">{module.label}</span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {module.summary}
          </span>
        </span>
      </span>
      <StatusLabel tone={module.implemented ? "available" : "pending"}>
        {module.implemented ? "Disponible" : "En preparación"}
      </StatusLabel>
    </Link>
  );
}

function monogram(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "";
  const second = parts[1];
  if (!first) {
    return "—";
  }
  if (!second) {
    return first.slice(0, 2).toUpperCase();
  }
  return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
}
