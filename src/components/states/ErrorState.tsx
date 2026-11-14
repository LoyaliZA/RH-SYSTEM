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
    <div role="alert" className="max-w-prose space-y-4 py-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-base text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
