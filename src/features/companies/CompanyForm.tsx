import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { CompanyField, CompanyFormValues } from "./types";

type CompanyFormProps = {
  mode: "create" | "edit";
  values: CompanyFormValues;
  fieldErrors: Partial<Record<CompanyField, string>>;
  formError: string | null;
  pending: boolean;
  embedded?: boolean;
  onChange: (field: CompanyField, value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
};

export function CompanyForm({
  mode,
  values,
  fieldErrors,
  formError,
  pending,
  embedded = false,
  onChange,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const title = mode === "create" ? "Nueva empresa" : "Editar empresa";
  const submitLabel = mode === "create" ? "Crear empresa" : "Guardar cambios";

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {embedded ? null : (
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      )}
      {mode === "edit" ? (
        <p className="text-sm text-muted-foreground">
          El nombre comercial y el identificador fiscal se conservan si no los
          modificas. Si los dejas vacíos, se borran.
        </p>
      ) : null}
      <Field
        id="legal-name"
        label="Razón social"
        required
        value={values.legalName}
        error={fieldErrors.legalName}
        disabled={pending}
        onChange={(value) => onChange("legalName", value)}
      />
      <Field
        id="trade-name"
        label="Nombre comercial"
        value={values.tradeName}
        error={fieldErrors.tradeName}
        disabled={pending}
        onChange={(value) => onChange("tradeName", value)}
      />
      <Field
        id="tax-id"
        label="Identificador fiscal"
        value={values.taxId}
        error={fieldErrors.taxId}
        disabled={pending}
        onChange={(value) => onChange("taxId", value)}
        hint="Letras, números y guiones. Sin datos personales reales."
      />
      {formError ? (
        <p
          role="alert"
          className="rounded-md border border-border px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  error,
  hint,
  required = false,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        value={value}
        disabled={disabled}
        autoComplete="off"
        spellCheck={id === "tax-id" ? false : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
