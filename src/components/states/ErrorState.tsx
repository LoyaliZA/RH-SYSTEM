import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "No se pudieron cargar los datos",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="max-w-[68ch] rounded-lg border border-border bg-card px-5 py-5 shadow-card"
    >
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-base text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
