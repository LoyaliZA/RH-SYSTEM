import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import { StatusNotice } from "@/components/states/StatusNotice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusLabel } from "@/components/ui/status-label";
import { useCompanies } from "@/features/companies/company-context";

import { EmploymentSection } from "@/features/employment/EmploymentSection";

import { getPersonnelFile, updatePersonnelFile } from "./api";
import { fieldForError, readCommandError } from "./errors";
import { PersonnelFileForm } from "./PersonnelFileForm";
import { formValuesFromFile, isPersonnelFormDirty, toPersonnelInput } from "./submit";
import {
  administrativeStatusLabels,
  isAdministrativeStatus,
  type CommandError,
  type PersonnelField,
  type PersonnelFile,
  type PersonnelFormValues,
} from "./types";

type LoadState =
  | {
      status: "loading";
      fileId: string | null;
      companyId: string | null;
      file: PersonnelFile | null;
      error: null;
    }
  | {
      status: "ready";
      fileId: string;
      companyId: string;
      file: PersonnelFile;
      error: null;
    }
  | {
      status: "error";
      fileId: string | null;
      companyId: string | null;
      file: PersonnelFile | null;
      error: CommandError;
    };

export function PersonnelFilePage() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { status: companyStatus, activeCompany } = useCompanies();
  const [load, setLoad] = useState<LoadState>({
    status: "loading",
    fileId: null,
    companyId: null,
    file: null,
    error: null,
  });
  const [values, setValues] = useState<PersonnelFormValues | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<PersonnelField, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!fileId || companyStatus === "loading" || !activeCompany) {
      return;
    }
    const companyId = activeCompany.id;
    const requestedId = fileId;
    let cancelled = false;
    getPersonnelFile(requestedId)
      .then((file) => {
        if (cancelled) {
          return;
        }
        setLoad({
          status: "ready",
          fileId: requestedId,
          companyId,
          file,
          error: null,
        });
        setValues(formValuesFromFile(file));
        setFieldErrors({});
        setFormError(null);
        setNotice(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoad({
            status: "error",
            fileId: requestedId,
            companyId,
            file: null,
            error: readCommandError(error),
          });
          setValues(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeCompany, companyStatus, fileId]);

  function changeField(field: PersonnelField, value: string) {
    setValues((current) => {
      if (!current) {
        return current;
      }
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
    if (!fileId || !values) {
      return;
    }
    setPending(true);
    try {
      const file = await updatePersonnelFile(fileId, toPersonnelInput(values));
      setLoad({
        status: "ready",
        fileId,
        companyId: file.companyId,
        file,
        error: null,
      });
      setValues(formValuesFromFile(file));
      setFieldErrors({});
      setFormError(null);
      setNotice("Se guardaron los cambios.");
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

  function goBack() {
    const original =
      load.status === "ready" && load.file ? formValuesFromFile(load.file) : null;
    if (values && original && isPersonnelFormDirty(values, original)) {
      const discard = window.confirm(
        "Hay cambios sin guardar. ¿Descartar los cambios y volver al listado?",
      );
      if (!discard) {
        return;
      }
    }
    void navigate("/files");
  }

  const original =
    load.status === "ready" && load.file ? formValuesFromFile(load.file) : null;
  const dirty = Boolean(values && original && isPersonnelFormDirty(values, original));
  const fileMatchesRequest =
    load.fileId === fileId && load.companyId === activeCompany?.id;
  const fileLoading =
    Boolean(activeCompany) &&
    Boolean(fileId) &&
    (!fileMatchesRequest || load.status === "loading");
  const fileError = fileMatchesRequest && load.status === "error" ? load.error : null;
  const fileReady = fileMatchesRequest && load.status === "ready";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          fileReady ? `${load.file.givenName} ${load.file.familyName}` : "Expediente"
        }
        description="Expediente digital de la empresa activa. La relación laboral inicial se consulta en esta pantalla. No hay historial salarial ni movimientos."
        actions={
          <Button type="button" variant="outline" onClick={goBack}>
            Volver al listado
          </Button>
        }
      />

      {notice ? <StatusNotice>{notice}</StatusNotice> : null}

      {companyStatus === "loading" || fileLoading ? (
        <LoadingState label="Cargando expediente…" />
      ) : null}
      {fileError ? (
        <ErrorState title="No se encontró el expediente" message={fileError.message} />
      ) : null}
      {fileReady && values ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
            <Card className="p-6">
              <PersonnelFileForm
                mode="edit"
                values={values}
                fieldErrors={fieldErrors}
                formError={formError}
                pending={pending}
                dirty={dirty}
                onChange={changeField}
                onSubmit={() => void submit()}
                onCancel={goBack}
              />
            </Card>
            <div className="flex flex-col gap-4">
              <Card className="space-y-3 p-5">
                <h2 className="text-lg font-semibold tracking-tight">
                  Identidad del expediente
                </h2>
                <Definition label="Identificador interno" value={load.file.id} mono />
                <Definition
                  label="Identificador de persona"
                  value={load.file.personId}
                  mono
                />
                <Definition label="Empresa" value={load.file.companyName} />
                <div>
                  <p className="text-sm text-muted-foreground">Estado administrativo</p>
                  <StatusLabel
                    tone={
                      load.file.administrativeStatus === "active"
                        ? "active"
                        : "inactive"
                    }
                  >
                    {administrativeStatusLabels[load.file.administrativeStatus]}
                  </StatusLabel>
                </div>
              </Card>
              <Card className="space-y-2 p-5">
                <h2 className="text-lg font-semibold tracking-tight">
                  Fuera de esta entrega
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Salarios, contratos, documentos sensibles, bancos, CURP, RFC,
                  historial de puestos y movimientos laborales no están disponibles. El
                  estado administrativo no abre ni cierra la relación laboral.
                </p>
                <p>
                  <Link
                    to="/jobs"
                    className="text-sm font-medium text-primary-ink underline decoration-primary-ink/40 underline-offset-4"
                  >
                    Catálogo de puestos
                  </Link>
                </p>
              </Card>
            </div>
          </div>
          <EmploymentSection
            key={`${load.file.companyId}:${load.file.id}`}
            fileId={load.file.id}
          />
        </>
      ) : null}
      {companyStatus === "ready" && !activeCompany ? (
        <EmptyState
          title="No hay empresa activa"
          description="Active una empresa para consultar sus expedientes."
          action={
            <Button asChild>
              <Link to="/companies">Ir a empresas</Link>
            </Button>
          }
        />
      ) : null}
    </div>
  );
}

function Definition({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={mono ? "break-all font-mono text-sm" : "text-sm font-medium"}>
        {value}
      </p>
    </div>
  );
}
