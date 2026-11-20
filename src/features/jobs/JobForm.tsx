import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { JobField, JobFormValues } from "./types";

type JobFormProps = {
  mode: "create" | "edit";
  values: JobFormValues;
  fieldErrors: Partial<Record<JobField, string>>;
  formError: string | null;
  pending: boolean;
  onChange: (field: JobField, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function JobForm({
  mode,
  values,
  fieldErrors,
  formError,
  pending,
  onChange,
  onSubmit,
  onCancel,
}: JobFormProps) {
  const submitLabel = mode === "create" ? "Crear puesto" : "Guardar cambios";

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-sm text-muted-foreground">
        El código es único dentro de la empresa activa. Use datos sintéticos.
      </p>
      <Field
        id="job-code"
        label="Código"
        required
        value={values.code}
        error={fieldErrors.code}
        disabled={pending}
        onChange={(value) => onChange("code", value)}
      />
      <Field
        id="job-name"
        label="Nombre del puesto"
        required
        value={values.name}
        error={fieldErrors.name}
        disabled={pending}
        onChange={(value) => onChange("name", value)}
      />
      <div className="space-y-2">
        <Label htmlFor="job-description">Descripción</Label>
        <textarea
          id="job-description"
          value={values.description}
          disabled={pending}
          aria-invalid={fieldErrors.description ? true : undefined}
          aria-describedby={
            fieldErrors.description ? "job-description-error" : undefined
          }
          className="flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-foreground caret-foreground outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
          onChange={(event) => onChange("description", event.target.value)}
        />
        {fieldErrors.description ? (
          <p id="job-description-error" className="text-sm text-destructive">
            {fieldErrors.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Opcional. No incluye salario.</p>
        )}
      </div>
      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required = false,
  value,
  error,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={id}
        value={value}
        required={required}
        disabled={disabled}
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
