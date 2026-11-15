import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconWell } from "@/components/ui/icon-well";
import { StatusLabel } from "@/components/ui/status-label";
import { cn } from "@/lib/utils";

import type { Company } from "./types";

type CompanyCardProps = {
  company: Company;
  pending: boolean;
  selected: boolean;
  prominence: "lead" | "compact";
  onEdit: (company: Company) => void;
  onActivate: (company: Company) => void;
};

export function CompanyCard({
  company,
  pending,
  selected,
  prominence,
  onEdit,
  onActivate,
}: CompanyCardProps) {
  const headingId = `empresa-${company.id}`;
  const lead = prominence === "lead";

  return (
    <Card
      role="article"
      aria-labelledby={headingId}
      data-selected={selected ? "true" : undefined}
      className={cn("flex h-full flex-col gap-4 p-5", selected && "bg-accent")}
    >
      <div className="flex items-start justify-between gap-3">
        <IconWell
          tone={company.isActive ? "active" : "mintSoft"}
          size={lead ? "md" : "sm"}
        >
          <span
            className={cn("font-semibold tracking-tight", lead ? "text-sm" : "text-xs")}
          >
            {monogram(company.legalName)}
          </span>
        </IconWell>
        <StatusLabel tone={company.isActive ? "active" : "inactive"}>
          {company.isActive ? "Activa" : "Inactiva"}
        </StatusLabel>
      </div>
      <div className="min-w-0">
        <h2
          id={headingId}
          className={cn(
            "font-semibold tracking-[-0.02em] text-balance break-words text-foreground",
            lead ? "text-2xl leading-8" : "text-xl leading-7",
          )}
        >
          {company.legalName}
        </h2>
        <p
          className={cn(
            "mt-1 text-sm break-words",
            company.tradeName ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {company.tradeName ?? "Sin nombre comercial"}
        </p>
        <p className="mt-3 text-sm">
          <span className="block text-muted-foreground">Identificador fiscal</span>
          <span
            className={cn(
              "mt-0.5 block tabular-nums",
              company.taxId ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {company.taxId ?? "Sin identificador"}
          </span>
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onEdit(company)}
        >
          Editar
        </Button>
        {company.isActive ? null : (
          <Button type="button" disabled={pending} onClick={() => onActivate(company)}>
            Activar
          </Button>
        )}
      </div>
    </Card>
  );
}

function monogram(legalName: string) {
  const parts = legalName.trim().split(/\s+/).filter(Boolean);
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
