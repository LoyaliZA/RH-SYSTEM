import { Check } from "lucide-react";

type StatusNoticeProps = {
  children: string;
};

export function StatusNotice({ children }: StatusNoticeProps) {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-card"
    >
      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
      <p>{children}</p>
    </div>
  );
}
