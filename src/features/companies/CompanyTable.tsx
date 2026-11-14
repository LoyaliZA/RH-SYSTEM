import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <TableHeader>
        <TableRow>
          <TableHead>Razón social</TableHead>
          <TableHead>Nombre comercial</TableHead>
          <TableHead>Identificador fiscal</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow
            key={company.id}
            data-selected={selectedId === company.id ? "true" : undefined}
            className={selectedId === company.id ? "bg-muted" : undefined}
          >
            <TableCell className="font-medium">{company.legalName}</TableCell>
            <TableCell>{company.tradeName ?? "—"}</TableCell>
            <TableCell className="tabular-nums">{company.taxId ?? "—"}</TableCell>
            <TableCell>{company.isActive ? "Activa" : "—"}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
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
