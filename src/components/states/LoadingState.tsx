type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="py-10">
      <p className="text-base text-muted-foreground">{label}</p>
    </div>
  );
}
