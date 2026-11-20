import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { StatusNotice } from "@/components/states/StatusNotice";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCompanies } from "@/features/companies/company-context";

import { createJob, listJobs, setJobStatus, updateJob } from "./api";
import { fieldForError, readCommandError } from "./errors";
import { JobForm } from "./JobForm";
import { JobTable } from "./JobTable";
import { blankJobForm, formValuesFromJob, toJobInput } from "./submit";
import type { CommandError, Job, JobField, JobFormValues } from "./types";

type Editor =
  | { mode: "create"; values: JobFormValues }
  | { mode: "edit"; jobId: string; values: JobFormValues };

type LoadState =
  | { status: "loading"; companyId: string | null; jobs: Job[]; error: null }
  | { status: "ready"; companyId: string; jobs: Job[]; error: null }
  | { status: "error"; companyId: string | null; jobs: Job[]; error: CommandError };

export function JobsPage() {
  const { status: companyStatus, activeCompany } = useCompanies();
  const [load, setLoad] = useState<LoadState>({
    status: "loading",
    companyId: null,
    jobs: [],
    error: null,
  });
  const [editor, setEditor] = useState<Editor | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<JobField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function reload() {
    if (!activeCompany) {
      return;
    }
    const companyId = activeCompany.id;
    try {
      const jobs = await listJobs();
      setLoad({ status: "ready", companyId, jobs, error: null });
    } catch (error) {
      setLoad({
        status: "error",
        companyId,
        jobs: [],
        error: readCommandError(error),
      });
    }
  }

  useEffect(() => {
    if (companyStatus === "loading" || !activeCompany) {
      return;
    }
    const companyId = activeCompany.id;
    let cancelled = false;
    listJobs()
      .then((jobs) => {
        if (!cancelled) {
          setLoad({ status: "ready", companyId, jobs, error: null });
          setEditor(null);
          setNotice(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoad({
            status: "error",
            companyId,
            jobs: [],
            error: readCommandError(error),
          });
          setEditor(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeCompany, companyStatus]);

  function openCreate() {
    setNotice(null);
    setEditor({ mode: "create", values: blankJobForm() });
    setFieldErrors({});
    setFormError(null);
  }

  function openEdit(job: Job) {
    setNotice(null);
    setEditor({ mode: "edit", jobId: job.id, values: formValuesFromJob(job) });
    setFieldErrors({});
    setFormError(null);
  }

  function closeEditor() {
    if (pending) {
      return;
    }
    setEditor(null);
    setFieldErrors({});
    setFormError(null);
  }

  function changeField(field: JobField, value: string) {
    setEditor((current) =>
      current ? { ...current, values: { ...current.values, [field]: value } } : current,
    );
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function submit() {
    if (!editor) {
      return;
    }
    setPending(true);
    try {
      const input = toJobInput(editor.values);
      if (editor.mode === "create") {
        await createJob(input);
        setNotice("Se creó el puesto.");
      } else {
        await updateJob(editor.jobId, input);
        setNotice("Se guardaron los cambios.");
      }
      setEditor(null);
      setFieldErrors({});
      setFormError(null);
      await reload();
    } catch (error) {
      const commandError = readCommandError(error);
      const field = fieldForError(commandError.code);
      if (field) {
        setFieldErrors({ [field]: commandError.message });
        setFormError(null);
      } else {
        setFieldErrors({});
        setFormError(commandError.message);
      }
    } finally {
      setPending(false);
    }
  }

  async function toggleStatus(job: Job) {
    const next = job.status === "active" ? "inactive" : "active";
    if (next === "inactive") {
      const confirmed = window.confirm(
        `¿Desactivar el puesto «${job.name}»? No admitirá nuevas asignaciones. Las relaciones ya registradas se conservan.`,
      );
      if (!confirmed) {
        return;
      }
    }
    setPending(true);
    setNotice(null);
    try {
      await setJobStatus(job.id, next);
      setNotice(
        next === "inactive" ? "Se desactivó el puesto." : "Se activó el puesto.",
      );
      await reload();
    } catch (error) {
      setLoad({
        status: "error",
        companyId: activeCompany?.id ?? null,
        jobs: [],
        error: readCommandError(error),
      });
    } finally {
      setPending(false);
    }
  }

  const companyReady = companyStatus === "ready";
  const hasCompany = Boolean(activeCompany);
  const jobsMatch = load.companyId === activeCompany?.id;
  const jobsLoading = hasCompany && (!jobsMatch || load.status === "loading");
  const jobsError = jobsMatch && load.status === "error" ? load.error : null;
  const jobsReady = jobsMatch && load.status === "ready";
  const companyName = activeCompany?.displayName;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Puestos"
        description={
          companyName
            ? `Catálogo de puestos de ${companyName}. Desactivar un puesto impide nuevas asignaciones y conserva las relaciones ya registradas.`
            : "Catálogo de puestos de la empresa activa."
        }
        actions={
          companyReady && hasCompany ? (
            <Button type="button" onClick={openCreate} disabled={pending}>
              <Plus aria-hidden="true" />
              Nuevo puesto
            </Button>
          ) : null
        }
      />

      {notice ? <StatusNotice>{notice}</StatusNotice> : null}

      {companyStatus === "loading" ? <LoadingState label="Cargando empresa…" /> : null}
      {companyStatus === "error" ? (
        <ErrorState message="No se pudo consultar la empresa activa." />
      ) : null}
      {companyReady && !hasCompany ? (
        <EmptyState
          title="No hay empresa activa"
          description="Cree o active una empresa antes de consultar puestos. El cambio de empresa no sustituye una autorización."
          action={
            <Button asChild>
              <Link to="/companies">Ir a empresas</Link>
            </Button>
          }
        />
      ) : null}

      {companyReady && hasCompany ? (
        <>
          {jobsLoading ? <LoadingState label="Cargando puestos…" /> : null}
          {jobsError ? (
            <ErrorState message={jobsError.message} onRetry={() => void reload()} />
          ) : null}
          {jobsReady && load.jobs.length === 0 ? (
            <EmptyState
              title="Todavía no hay puestos"
              description="Cree el primer puesto de esta empresa. El mismo código puede existir en otra empresa."
            />
          ) : null}
          {jobsReady && load.jobs.length > 0 ? (
            <JobTable
              jobs={load.jobs}
              pending={pending}
              onEdit={openEdit}
              onToggleStatus={(job) => void toggleStatus(job)}
            />
          ) : null}
        </>
      ) : null}

      {editor ? (
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open) {
              closeEditor();
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
              <SheetTitle>
                {editor.mode === "create" ? "Nuevo puesto" : "Editar puesto"}
              </SheetTitle>
              <SheetDescription>
                Alta breve del catálogo. No define salario, departamento ni sucursal.
              </SheetDescription>
            </SheetHeader>
            <SheetBody>
              <JobForm
                mode={editor.mode}
                values={editor.values}
                fieldErrors={fieldErrors}
                formError={formError}
                pending={pending}
                onChange={changeField}
                onSubmit={() => void submit()}
                onCancel={closeEditor}
              />
            </SheetBody>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
