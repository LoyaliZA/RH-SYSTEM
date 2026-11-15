import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconWell } from "@/components/ui/icon-well";

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
    <Card role="alert" className="max-w-[68ch] px-6 py-6">
      <IconWell tone="danger">
        <AlertCircle aria-hidden="true" />
      </IconWell>
      <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 text-base text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-5" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </Card>
  );
}
