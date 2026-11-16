import { cn } from "@/lib/utils";

type StatusLabelProps = {
  tone: "active" | "available" | "inactive" | "pending" | "danger";
  marker?: boolean;
  children: string;
};

const tones = {
  active: "bg-mint-soft text-mint-soft-foreground",
  available: "bg-mint-soft text-mint-soft-foreground",
  inactive: "bg-inactive-soft text-foreground",
  pending: "bg-inactive-soft text-foreground",
  danger: "bg-destructive-soft text-destructive-soft-foreground",
};

const dots = {
  active: "bg-mint",
  available: "bg-mint",
  inactive: "bg-inactive",
  pending: "bg-inactive",
  danger: "bg-destructive",
};

export function StatusLabel({ tone, marker = true, children }: StatusLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {marker ? (
        <span className={cn("size-1.5 rounded-full", dots[tone])} aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
