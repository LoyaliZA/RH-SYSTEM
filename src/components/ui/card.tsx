import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const cardClassName =
  "rounded-xl border border-border bg-card text-card-foreground shadow-card";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(cardClassName, className)} {...props} />;
}
