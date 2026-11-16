import { Card } from "@/components/ui/card";

type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <Card role="status" aria-live="polite" className="px-6 py-8">
      <p className="text-base text-muted-foreground">{label}</p>
    </Card>
  );
}
