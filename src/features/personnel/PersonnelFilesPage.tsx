import { Plus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { StatusNotice } from "@/components/states/StatusNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCompanies } from "@/features/companies/company-context";

import { createPersonnelFile, listPersonnelFiles } from "./api";
import { fieldForError, readCommandError } from "./errors";
import { PersonnelFileForm } from "./PersonnelFileForm";
import { PersonnelTable } from "./PersonnelTable";
import { blankPersonnelForm, toPersonnelInput } from "./submit";
import {
  isAdministrativeStatus,
  type CommandError,
  type PersonnelField,
  type PersonnelFile,
  type PersonnelFormValues,
} from "./types";

type LoadState =
  | {
      status: "loading";
      companyId: string | null;
      query: string;
      files: PersonnelFile[];
      error: null;
    }
  | {
      status: "ready";
      companyId: string;
      query: string;
      files: PersonnelFile[];
      error: null;
    }
  | {
      status: "error";
      companyId: string | null;
      query: string;
      files: PersonnelFile[];
      error: CommandError;
    };

export function PersonnelFilesPage() {
  const { status: companyStatus, activeCompany } = useCompanies();
  const [load, setLoad] = useState<LoadState>({
    status: "loading",
    companyId: null,
    query: "",
    files: [],
    error: null,
  });
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [values, setValues] = useState<PersonnelFormValues>(blankPersonnelForm());
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<PersonnelField, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function reload(search = appliedQuery) {
    if (!activeCompany) {
      return;
    }
    const companyId = activeCompany.id;
    try {
      const files = await listPersonnelFiles(search);
      setLoad({ status: "ready", companyId, query: search, files, error: null });
    } catch (error) {
      setLoad({
        status: "error",
        companyId,
        query: search,
        files: [],
        error: readCommandError(error),
      });
    }
  }

  useEffect(() => {
    if (companyStatus === "loading" || !activeCompany) {
      return;
    }
    const companyId = activeCompany.id;
    const search = appliedQuery;
    let cancelled = false;
    listPersonnelFiles(search)
      .then((files) => {
        if (!cancelled) {
          setLoad({ status: "ready", companyId, query: search, files, error: null });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoad({
            status: "error",
            companyId,
            query: search,
            files: [],
            error: readCommandError(error),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeCompany, appliedQuery, companyStatus]);

  function openCreate() {
    setNotice(null);
    setCreating(true);
    setValues(blankPersonnelForm());
    setFieldErrors({});
    setFormError(null);
  }

  function closeCreate() {
    if (pending) {
      return;
    }
    setCreating(false);
    setValues(blankPersonnelForm());
    setFieldErrors({});
    setFormError(null);
  }

  function changeField(field: PersonnelField, value: string) {
    setValues((current) => {
      if (field === "administrativeStatus") {
        return isAdministrativeStatus(value)
          ? { ...current, administrativeStatus: value }
          : current;
      }
      return { ...current, [field]: value };
    });
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function submit() {
    setPending(true);
    try {
      await createPersonnelFile(toPersonnelInput(values));
      setNotice("Se creó el expediente.");
      setCreating(false);
      setValues(blankPersonnelForm());
      setFieldErrors({});
      setFormError(null);
      await reload(appliedQuery);
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

  function applySearch(event: FormEvent) {
    event.preventDefault();
    setAppliedQuery(query.trim());
  }

  const searching = appliedQuery.length > 0;
  const companyReady = companyStatus === "ready";
  const hasCompany = Boolean(activeCompany);
  const filesMatchRequest =
    load.companyId === activeCompany?.id && load.query === appliedQuery;
  const filesLoading = hasCompany && (!filesMatchRequest || load.status === "loading");
  const filesError = filesMatchRequest && load.status === "error" ? load.error : null;
  const filesReady = filesMatchRequest && load.status === "ready";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Expedientes"
        description="Consulta y actualiza los expedientes de la empresa activa. Esta entrega usa datos sintéticos y no habilita salarios, documentos, CURP ni RFC."
        actions={
          companyReady && hasCompany ? (
            <Button type="button" onClick={openCreate} disabled={pending}>
              <Plus aria-hidden="true" />
              Nuevo expediente
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
          description="Cree o active una empresa antes de consultar expedientes. El cambio de empresa no sustituye una autorización."
          action={
            <Button asChild>
              <Link to="/companies">Ir a empresas</Link>
            </Button>
          }
        />
      ) : null}

      {companyReady && hasCompany ? (
        <>
          <form
            className="flex max-w-xl flex-wrap items-end gap-3"
            onSubmit={applySearch}
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="personnel-search">Buscar expedientes</Label>
              <Input
                id="personnel-search"
                value={query}
                autoComplete="off"
                placeholder="Nombre o número de empleado"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>

          {filesLoading ? <LoadingState label="Cargando expedientes…" /> : null}
          {filesError ? (
            <ErrorState
              message={filesError.message}
              onRetry={() => void reload(appliedQuery)}
            />
          ) : null}
          {filesReady && load.files.length === 0 ? (
            <EmptyState
              title={searching ? "Sin resultados" : "Todavía no hay expedientes"}
              description={
                searching
                  ? `No hay expedientes que coincidan con «${appliedQuery}» en ${activeCompany?.displayName}.`
                  : "Cree el primer expediente con datos sintéticos. Quedará aislado en la empresa activa."
              }
            />
          ) : null}
          {filesReady && load.files.length > 0 ? (
            <PersonnelTable files={load.files} />
          ) : null}
        </>
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
              <SheetTitle>Nuevo expediente</SheetTitle>
              <SheetDescription>
                Alta ficticia persistida en este equipo, limitada a la empresa activa.
              </SheetDescription>
            </SheetHeader>
            <SheetBody>
              <PersonnelFileForm
                embedded
                mode="create"
                values={values}
                fieldErrors={fieldErrors}
                formError={formError}
                pending={pending}
                onChange={changeField}
                onSubmit={() => void submit()}
                onCancel={closeCreate}
              />
            </SheetBody>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
