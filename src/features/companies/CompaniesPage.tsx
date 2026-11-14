import { useState } from "react";

import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";

import { useCompanies } from "./company-context";
import { CompanyForm } from "./CompanyForm";
import { CompanyTable } from "./CompanyTable";
import { formValuesFromCompany, toCompanyInput } from "./submit";
import {
  emptyCompanyForm,
  type Company,
  type CompanyField,
  type CompanyFormValues,
} from "./types";

export function CompaniesPage() {
  const { status, companies, error, pending, reload, create, update, activate } =
    useCompanies();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<CompanyFormValues>(emptyCompanyForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CompanyField, string>>>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);

  function resetForm() {
    setMode("create");
    setEditingId(null);
    setValues(emptyCompanyForm);
    setFieldErrors({});
    setFormError(null);
  }

  function editCompany(company: Company) {
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
      resetForm();
      return;
    }
    setFieldErrors(result.fieldErrors);
    setFormError(result.formError);
  }

  async function activateCompany(company: Company) {
    const result = await activate(company.id);
    if (!result.ok) {
      setFormError(result.formError);
    }
  }

  return (
    <div className="space-y-6">
      <header className="max-w-prose">
        <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Crea y actualiza las empresas de este escritorio. La empresa activa aparece en
          el encabezado y los datos siguen disponibles al cerrar la aplicación.
        </p>
      </header>

      {status === "loading" ? <LoadingState label="Cargando empresas…" /> : null}
      {status === "error" && error ? (
        <ErrorState message={error.message} onRetry={() => void reload()} />
      ) : null}
      {status === "ready" ? (
        <div className="grid items-start gap-8 lg:grid-cols-3">
          <section className="space-y-4 lg:col-span-2">
            {companies.length === 0 ? (
              <EmptyState
                title="Todavía no hay empresas"
                description="Crea la primera empresa con el formulario. Quedará activa para el resto del escritorio."
              />
            ) : (
              <CompanyTable
                companies={companies}
                pending={pending}
                selectedId={editingId}
                onEdit={editCompany}
                onActivate={(company) => void activateCompany(company)}
              />
            )}
          </section>
          <section className="rounded-md border border-border bg-card p-4">
            <CompanyForm
              mode={mode}
              values={values}
              fieldErrors={fieldErrors}
              formError={formError}
              pending={pending}
              onChange={changeField}
              onSubmit={() => void submit()}
              onCancel={mode === "edit" ? resetForm : undefined}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}
