type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-border bg-card px-5 py-8"
    >
      <p className="text-base text-muted-foreground">{label}</p>
    </div>
  );
}
