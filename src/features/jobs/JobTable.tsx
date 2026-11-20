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

import { jobStatusLabels, type Job } from "./types";

type JobTableProps = {
  jobs: Job[];
  pending: boolean;
  onEdit: (job: Job) => void;
  onToggleStatus: (job: Job) => void;
};

export function JobTable({ jobs, pending, onEdit, onToggleStatus }: JobTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          const active = job.status === "active";
          return (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.code}</TableCell>
              <TableCell>{job.name}</TableCell>
              <TableCell>
                <StatusLabel tone={active ? "active" : "inactive"}>
                  {jobStatusLabels[job.status]}
                </StatusLabel>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => onEdit(job)}
                  >
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() => onToggleStatus(job)}
                  >
                    {active ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
