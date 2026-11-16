import { ArrowUpRight } from "lucide-react";

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
  onEdit: (company: Company) => void;
  onActivate: (company: Company) => void;
};

export function CompanyCard({
  company,
  pending,
  selected,
  onEdit,
  onActivate,
}: CompanyCardProps) {
  const headingId = `empresa-${company.id}`;

  return (
    <Card
      role="article"
      aria-labelledby={headingId}
      data-selected={selected ? "true" : undefined}
      className={cn(
        "flex h-full flex-col gap-5 p-5 transition-colors duration-[var(--motion-fast)] motion-reduce:transition-none",
        selected && "bg-accent",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <IconWell
          tone={company.isActive ? "active" : "mintSoft"}
          className="size-[4.5rem] rounded-2xl"
        >
          <span className="text-lg font-semibold tracking-tight">
            {monogram(company.legalName)}
          </span>
        </IconWell>
        <StatusLabel marker={false} tone={company.isActive ? "active" : "inactive"}>
          {company.isActive ? "Activa" : "Inactiva"}
        </StatusLabel>
      </div>
      <div className="min-w-0">
        <h2
          id={headingId}
          className="text-2xl leading-8 font-semibold tracking-[-0.02em] text-balance break-words text-foreground"
        >
          {company.legalName}
        </h2>
        <p className="mt-2 text-sm break-words text-muted-foreground">
          <span className={company.tradeName ? "text-foreground" : undefined}>
            {company.tradeName ?? "Sin nombre comercial"}
          </span>
          <span aria-hidden="true"> · </span>
          <span className={cn("tabular-nums", company.taxId && "text-foreground")}>
            {company.taxId ?? "Sin identificador"}
          </span>
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onEdit(company)}
        >
          Editar
          <ArrowUpRight aria-hidden="true" />
        </Button>
        {company.isActive ? null : (
          <Button type="button" disabled={pending} onClick={() => onActivate(company)}>
            Activar
            <ArrowUpRight aria-hidden="true" />
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
