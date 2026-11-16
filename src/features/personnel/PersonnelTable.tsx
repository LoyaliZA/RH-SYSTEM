import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { StatusLabel } from "@/components/ui/status-label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  administrativeStatusLabels,
  type AdministrativeStatus,
  type PersonnelFile,
} from "./types";

export function PersonnelTable({ files }: { files: PersonnelFile[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Apellidos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => (
          <TableRow key={file.id}>
            <TableCell className="font-medium tabular-nums">
              {file.employeeNumber}
            </TableCell>
            <TableCell>{file.givenName}</TableCell>
            <TableCell>{file.familyName}</TableCell>
            <TableCell>
              <StatusLabel tone={statusTone(file.administrativeStatus)}>
                {administrativeStatusLabels[file.administrativeStatus]}
              </StatusLabel>
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link to={`/files/${file.id}`}>Consultar</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function statusTone(status: AdministrativeStatus) {
  return status === "active" ? "active" : "inactive";
}
