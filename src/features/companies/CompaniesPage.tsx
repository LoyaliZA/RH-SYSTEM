import { useState } from "react";

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

import { useCompanies } from "./company-context";
import { CompanyCard } from "./CompanyCard";
import { CompanyForm } from "./CompanyForm";
import { formValuesFromCompany, toCompanyInput } from "./submit";
import {
  emptyCompanyForm,
  type Company,
  type CompanyField,
  type CompanyFormValues,
} from "./types";

type PanelMode = "closed" | "create" | "edit";

function CompanyBoard({
  companies,
  pending,
  selectedId,
  onEdit,
  onActivate,
}: {
  companies: Company[];
  pending: boolean;
  selectedId: string | null;
  onEdit: (company: Company) => void;
  onActivate: (company: Company) => void;
}) {
  const ordered = [
    ...companies.filter((company) => company.isActive),
    ...companies.filter((company) => !company.isActive),
  ];

  return (
    <ul className="rh-company-grid">
      {ordered.map((company) => (
        <li key={company.id} className="h-full min-w-0">
          <CompanyCard
            company={company}
            pending={pending}
            selected={selectedId === company.id}
            prominence={company.isActive ? "lead" : "compact"}
            onEdit={onEdit}
            onActivate={onActivate}
          />
        </li>
      ))}
    </ul>
  );
}

export function CompaniesPage() {
  const { status, companies, error, pending, reload, create, update, activate } =
    useCompanies();
  const [mode, setMode] = useState<PanelMode>("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<CompanyFormValues>(emptyCompanyForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CompanyField, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  function closePanel() {
    setMode("closed");
    setEditingId(null);
    setValues(emptyCompanyForm);
    setFieldErrors({});
    setFormError(null);
  }

  function openCreate() {
    setNotice(null);
    setPageError(null);
    setMode("create");
    setEditingId(null);
    setValues(emptyCompanyForm);
    setFieldErrors({});
    setFormError(null);
  }

  function editCompany(company: Company) {
    setNotice(null);
    setPageError(null);
    setMode("edit");
    setEditingId(company.id);
    setValues(formValuesFromCompany(company));
    setFieldErrors({});
    setFormError(null);
  }

  function changeField(field: CompanyField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function submit() {
    const input = toCompanyInput(values);
    const result =
      mode === "edit" && editingId
        ? await update(editingId, input)
        : await create(input);
    if (result.ok) {
      setNotice(mode === "edit" ? "Se guardaron los cambios." : "Se creó la empresa.");
      setPageError(null);
      closePanel();
      return;
    }
    setFieldErrors(result.fieldErrors);
    setFormError(result.formError);
  }

  async function activateCompany(company: Company) {
    setNotice(null);
    setPageError(null);
    const result = await activate(company.id);
    if (result.ok) {
      setNotice("La empresa quedó activa.");
      return;
    }
    setPageError(result.formError ?? "No se pudo activar la empresa.");
  }

  const panelTitle = mode === "edit" ? "Editar empresa" : "Nueva empresa";
  const panelDescription =
    mode === "edit"
      ? "Actualiza los datos guardados en este equipo."
      : "La empresa queda guardada en este equipo. Si todavía no hay una empresa activa, la nueva queda activa.";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empresas"
        description="Crea y actualiza las empresas de este escritorio. La empresa activa aparece en el encabezado y los datos siguen disponibles al cerrar la aplicación."
        actions={
          status === "ready" ? (
            <Button type="button" onClick={openCreate} disabled={pending}>
              Nueva empresa
            </Button>
          ) : null
        }
      />

      {notice ? <StatusNotice>{notice}</StatusNotice> : null}
      {pageError ? (
        <p
          role="alert"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-destructive shadow-card"
        >
          {pageError}
        </p>
      ) : null}

      {status === "loading" ? <LoadingState label="Cargando empresas…" /> : null}
      {status === "error" && error ? (
        <ErrorState message={error.message} onRetry={() => void reload()} />
      ) : null}
      {status === "ready" && companies.length === 0 ? (
        <EmptyState
          title="Todavía no hay empresas"
          description="Crea la primera empresa con Nueva empresa. Quedará activa para el resto del escritorio."
        />
      ) : null}
      {status === "ready" && companies.length > 0 ? (
        <CompanyBoard
          companies={companies}
          pending={pending}
          selectedId={editingId}
          onEdit={editCompany}
          onActivate={(company) => void activateCompany(company)}
        />
      ) : null}

      {mode !== "closed" ? (
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open && !pending) {
              closePanel();
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
              <SheetTitle>{panelTitle}</SheetTitle>
              <SheetDescription>{panelDescription}</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <CompanyForm
                embedded
                mode={mode === "edit" ? "edit" : "create"}
                values={values}
                fieldErrors={fieldErrors}
                formError={formError}
                pending={pending}
                onChange={changeField}
                onSubmit={() => void submit()}
                onCancel={closePanel}
              />
            </SheetBody>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
