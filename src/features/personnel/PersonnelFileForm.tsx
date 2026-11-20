import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";

import {
  administrativeStatusLabels,
  administrativeStatuses,
  type PersonnelField,
  type PersonnelFormValues,
} from "./types";

type PersonnelFileFormProps = {
  mode: "create" | "edit";
  values: PersonnelFormValues;
  fieldErrors: Partial<Record<PersonnelField, string>>;
  formError: string | null;
  pending: boolean;
  embedded?: boolean;
  dirty?: boolean;
  onChange: (field: PersonnelField, value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
};

export function PersonnelFileForm({
  mode,
  values,
  fieldErrors,
  formError,
  pending,
  embedded = false,
  dirty = false,
  onChange,
  onSubmit,
  onCancel,
}: PersonnelFileFormProps) {
  const title = mode === "create" ? "Nuevo expediente" : "Editar expediente";
  const submitLabel = mode === "create" ? "Crear expediente" : "Guardar cambios";

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
      <p className="text-sm text-muted-foreground">
        Use datos sintéticos. No registre información personal real mientras F1
        (autenticación y autorización) esté incompleta.
      </p>
      <Field
        id="given-name"
        label="Nombre"
        required
        value={values.givenName}
        error={fieldErrors.givenName}
        disabled={pending}
        onChange={(value) => onChange("givenName", value)}
      />
      <Field
        id="family-name"
        label="Apellidos"
        required
        value={values.familyName}
        error={fieldErrors.familyName}
        disabled={pending}
        onChange={(value) => onChange("familyName", value)}
      />
      <Field
        id="employee-number"
        label="Número de empleado"
        required
        value={values.employeeNumber}
        error={fieldErrors.employeeNumber}
        disabled={pending}
        onChange={(value) => onChange("employeeNumber", value)}
        hint="Único en la empresa activa. Letras, números y guiones. No es CURP ni RFC."
      />
      <div className="space-y-2">
        <Label htmlFor="administrative-status">
          Estado administrativo
          <span className="text-destructive"> *</span>
        </Label>
        <NativeSelect
          id="administrative-status"
          value={values.administrativeStatus}
          disabled={pending}
          aria-invalid={Boolean(fieldErrors.administrativeStatus)}
          aria-describedby={
            fieldErrors.administrativeStatus ? "administrative-status-error" : undefined
          }
          onChange={(event) => onChange("administrativeStatus", event.target.value)}
        >
          {administrativeStatuses.map((status) => (
            <option key={status} value={status}>
              {administrativeStatusLabels[status]}
            </option>
          ))}
        </NativeSelect>
        {fieldErrors.administrativeStatus ? (
          <p id="administrative-status-error" className="text-sm text-destructive">
            {fieldErrors.administrativeStatus}
          </p>
        ) : null}
      </div>
      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-border px-3 py-2 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}
      {mode === "edit" && dirty ? (
        <p className="text-sm text-muted-foreground">Hay cambios sin guardar.</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || (mode === "edit" && !dirty)}>
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
        spellCheck={id === "employee-number" ? false : undefined}
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
