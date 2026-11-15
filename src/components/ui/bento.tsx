import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const spans = {
  lead: "rh-span-lead",
  aside: "rh-span-aside",
  band: "rh-span-band",
} as const;

export function Bento({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rh-bento", className)} {...props} />;
}

export function BentoItem({
  span = "band",
  className,
  ...props
}: ComponentProps<"div"> & { span?: keyof typeof spans }) {
  return <div className={cn("min-w-0", spans[span], className)} {...props} />;
}
