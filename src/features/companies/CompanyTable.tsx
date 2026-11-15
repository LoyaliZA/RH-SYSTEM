import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

import type { Company } from "./types";

type CompanyTableProps = {
  companies: Company[];
  pending: boolean;
  selectedId: string | null;
  onEdit: (company: Company) => void;
  onActivate: (company: Company) => void;
};

export function CompanyTable({
  companies,
  pending,
  selectedId,
  onEdit,
  onActivate,
}: CompanyTableProps) {
  return (
    <Table>
      <caption className="sr-only">Empresas guardadas en este equipo</caption>
      <TableHeader>
        <TableRow>
          <TableHead>Razón social</TableHead>
          <TableHead>Nombre comercial</TableHead>
          <TableHead>Identificador fiscal</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow
            key={company.id}
            data-selected={selectedId === company.id ? "true" : undefined}
            className={cn(
              selectedId === company.id ? "bg-accent" : "hover:bg-muted/70",
            )}
          >
            <TableCell className="max-w-64 font-medium whitespace-normal">
              {company.legalName}
            </TableCell>
            <TableCell className="max-w-56 whitespace-normal">
              {company.tradeName ?? <Missing label="Sin nombre comercial" />}
            </TableCell>
            <TableCell className="tabular-nums">
              {company.taxId ?? <Missing label="Sin identificador" />}
            </TableCell>
            <TableCell>{company.isActive ? "Activa" : "Inactiva"}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-2 whitespace-nowrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => onEdit(company)}
                >
                  Editar
                </Button>
                {company.isActive ? null : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => onActivate(company)}
                  >
                    Activar
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Missing({ label }: { label: string }) {
  return <span className="text-muted-foreground">{label}</span>;
}
