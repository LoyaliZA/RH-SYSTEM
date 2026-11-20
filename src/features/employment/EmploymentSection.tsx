import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { StatusNotice } from "@/components/states/StatusNotice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusLabel } from "@/components/ui/status-label";
import { listJobs } from "@/features/jobs/api";
import { jobStatusLabels, type Job } from "@/features/jobs/types";

import { createEmploymentRelationship, getEmploymentForFile } from "./api";
import { formatCalendarDate } from "./dates";
import { readCommandError } from "./errors";
import {
  employmentStateLabels,
  type CommandError,
  type EmploymentRelationship,
} from "./types";

type LoadState =
  | {
      status: "loading";
      fileId: string | null;
      relationship: EmploymentRelationship | null;
      jobs: Job[];
      error: null;
    }
  | {
      status: "ready";
      fileId: string;
      relationship: EmploymentRelationship | null;
      jobs: Job[];
      error: null;
    }
  | {
      status: "error";
      fileId: string | null;
      relationship: null;
      jobs: Job[];
      error: CommandError;
    };

type EmploymentSectionProps = {
  fileId: string;
};

export function EmploymentSection({ fileId }: EmploymentSectionProps) {
  const [load, setLoad] = useState<LoadState>({
    status: "loading",
    fileId: null,
    relationship: null,
    jobs: [],
    error: null,
  });
  const [creating, setCreating] = useState(false);
  const [startedOn, setStartedOn] = useState("");
  const [jobId, setJobId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function reload(requestedId = fileId) {
    try {
      const [relationship, jobs] = await Promise.all([
        getEmploymentForFile(requestedId),
        listJobs(),
      ]);
      setLoad({
        status: "ready",
        fileId: requestedId,
        relationship,
        jobs,
        error: null,
      });
    } catch (error) {
      setLoad({
        status: "error",
        fileId: requestedId,
        relationship: null,
        jobs: [],
        error: readCommandError(error),
      });
    }
  }

  useEffect(() => {
    const requestedId = fileId;
    let cancelled = false;
    Promise.all([getEmploymentForFile(requestedId), listJobs()])
      .then(([relationship, jobs]) => {
        if (!cancelled) {
          setLoad({
            status: "ready",
            fileId: requestedId,
            relationship,
            jobs,
            error: null,
          });
          setCreating(false);
          setNotice(null);
          setStartedOn("");
          setJobId("");
          setFormError(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoad({
            status: "error",
            fileId: requestedId,
            relationship: null,
            jobs: [],
            error: readCommandError(error),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [fileId]);

  function openCreate() {
    setNotice(null);
    setCreating(true);
    setStartedOn("");
    setJobId("");
    setFormError(null);
  }

  function closeCreate() {
    if (pending) {
      return;
    }
    setCreating(false);
    setFormError(null);
  }

  async function submit() {
    setPending(true);
    try {
      await createEmploymentRelationship({
        personnelFileId: fileId,
        jobId,
        startedOn,
      });
      setNotice("Se registró la relación laboral.");
      setCreating(false);
      setFormError(null);
      await reload(fileId);
    } catch (error) {
      setFormError(readCommandError(error).message);
    } finally {
      setPending(false);
    }
  }

  const matches = load.fileId === fileId;
  const loading = !matches || load.status === "loading";
  const error = matches && load.status === "error" ? load.error : null;
  const ready = matches && load.status === "ready";
  const relationship = ready ? load.relationship : null;
  const activeJobs = ready ? load.jobs.filter((job) => job.status === "active") : [];

  return (
    <section className="space-y-3" aria-labelledby="relacion-laboral-titulo">
      <h2 id="relacion-laboral-titulo" className="text-lg font-semibold tracking-tight">
        Información laboral
      </h2>
      {notice ? <StatusNotice>{notice}</StatusNotice> : null}
      {loading ? <LoadingState label="Cargando relación laboral…" /> : null}
      {error ? (
        <ErrorState
          title="No se pudo consultar la relación laboral"
          message={error.message}
          onRetry={() => void reload(fileId)}
        />
      ) : null}
      {ready && !relationship ? (
        <EmptyState
          title="Sin relación laboral"
          description="Este expediente no tiene una relación laboral inicial. El estado administrativo no la abre ni la cierra. Disponible en compilaciones de desarrollo, con datos sintéticos."
          action={
            <Button type="button" onClick={openCreate}>
              Registrar relación inicial
            </Button>
          }
        />
      ) : null}
      {relationship ? (
        <Card className="space-y-3 p-5">
          <div>
            <p className="text-sm text-muted-foreground">Vigencia</p>
            <StatusLabel tone={relationship.state === "open" ? "active" : "inactive"}>
              {employmentStateLabels[relationship.state]}
            </StatusLabel>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de inicio</p>
            <p className="text-sm font-medium">
              {formatCalendarDate(relationship.startedOn)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Puesto asignado</p>
            <p className="text-sm font-medium">
              {relationship.jobName}{" "}
              <span className="text-muted-foreground">({relationship.jobCode})</span>
            </p>
            <StatusLabel
              tone={relationship.jobStatus === "active" ? "active" : "inactive"}
            >
              {jobStatusLabels[relationship.jobStatus]}
            </StatusLabel>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Identificador de la relación
            </p>
            <p className="break-all font-mono text-sm">{relationship.id}</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Esta consulta muestra el vínculo inicial. No hay historial de puestos,
            salarios ni movimientos. Cambiar el estado administrativo del expediente no
            altera esta relación.
          </p>
        </Card>
      ) : null}

      {creating ? (
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open) {
              closeCreate();
            }
          }}
        >
          <SheetContent
            onPointerDownOutside={(event) => {
              if (pending) {
                event.preventDefault();
              }
            }}
            onEscapeKeyDown={(event) => {
              if (pending) {
                event.preventDefault();
              }
            }}
          >
            <SheetHeader>
              <SheetTitle>Relación laboral inicial</SheetTitle>
              <SheetDescription>
                La fecha es un día de calendario. El puesto debe pertenecer a la empresa
                activa y estar activo.
              </SheetDescription>
            </SheetHeader>
            <SheetBody>
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit();
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="employment-start">Fecha de inicio</Label>
                  <Input
                    id="employment-start"
                    type="date"
                    required
                    value={startedOn}
                    disabled={pending}
                    onChange={(event) => {
                      setStartedOn(event.target.value);
                      setFormError(null);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment-job">Puesto</Label>
                  {activeJobs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay puestos activos.{" "}
                      <Link
                        to="/jobs"
                        className="font-medium text-primary-ink underline decoration-primary-ink/40 underline-offset-4"
                      >
                        Ir al catálogo de puestos
                      </Link>
                    </p>
                  ) : (
                    <NativeSelect
                      id="employment-job"
                      required
                      value={jobId}
                      disabled={pending}
                      onChange={(event) => {
                        setJobId(event.target.value);
                        setFormError(null);
                      }}
                    >
                      <option value="">Seleccionar puesto</option>
                      {activeJobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.code} · {job.name}
                        </option>
                      ))}
                    </NativeSelect>
                  )}
                </div>
                {formError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {formError}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={pending || activeJobs.length === 0}>
                    Registrar relación
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={closeCreate}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </SheetBody>
          </SheetContent>
        </Sheet>
      ) : null}
    </section>
  );
}
