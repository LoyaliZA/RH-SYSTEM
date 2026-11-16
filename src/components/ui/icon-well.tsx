import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type IconWellProps = {
  tone?: "neutral" | "active" | "mint" | "mintSoft" | "danger";
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
};

const tones = {
  neutral: "bg-muted text-foreground",
  active: "bg-primary-soft text-foreground",
  mint: "bg-mint text-mint-foreground",
  mintSoft: "bg-mint-soft text-foreground",
  danger: "bg-destructive-soft text-destructive-soft-foreground",
};

const sizes = {
  sm: "size-8 rounded-md [&_svg]:size-4",
  md: "size-12 rounded-lg [&_svg]:size-5",
};

export function IconWell({
  tone = "neutral",
  size = "sm",
  className,
  children,
}: IconWellProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        tones[tone],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
