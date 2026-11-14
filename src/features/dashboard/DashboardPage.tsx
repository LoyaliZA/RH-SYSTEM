import { Link } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { allModules } from "@/features/modules/catalog";

import { useCompanies } from "../companies/company-context";

export function DashboardPage() {
  const { status, activeCompany } = useCompanies();

  return (
    <div className="space-y-10">
      <header className="max-w-prose">
        <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Este escritorio guarda las empresas en el equipo. El resto de los módulos de
          recursos humanos todavía no está implementado.
        </p>
      </header>

      <section className="max-w-prose space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Empresa activa</h2>
        {status === "loading" ? (
          <p className="text-base text-muted-foreground">Cargando empresa…</p>
        ) : null}
        {status === "error" ? (
          <p className="text-base text-muted-foreground">
            No se pudo consultar la empresa activa.
          </p>
        ) : null}
        {status === "ready" && activeCompany ? (
          <p className="text-base text-foreground">{activeCompany.displayName}</p>
        ) : null}
        {status === "ready" && !activeCompany ? (
          <p className="text-base text-muted-foreground">
            Sin empresa activa.{" "}
            <Link
              to="/companies"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Crear o elegir una empresa
            </Link>
            .
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Módulos</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Módulo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allModules.map((module) => (
              <TableRow key={module.id}>
                <TableCell>
                  <Link
                    to={module.to}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {module.label}
                  </Link>
                </TableCell>
                <TableCell>
                  {module.implemented ? "Disponible" : "No implementado"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
