import { Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { IconWell } from "@/components/ui/icon-well";

type StatusNoticeProps = {
  children: string;
};

export function StatusNotice({ children }: StatusNoticeProps) {
  return (
    <Card
      role="status"
      className="flex items-start gap-3 px-4 py-3 text-sm text-foreground"
    >
      <IconWell tone="mint">
        <Check aria-hidden="true" />
      </IconWell>
      <p className="pt-1.5">{children}</p>
    </Card>
  );
}
