import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="px-6 py-10">
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-balance text-foreground">
        {title}
      </h2>
      <p className="mt-2 max-w-[62ch] text-base text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
