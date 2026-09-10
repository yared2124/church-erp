"use client";

import * as React from "react";
import { SacramentTable } from "./sacrament-table";
import { SacramentDetailDialog } from "./sacrament-detail-dialog";
import type { ApiSacrament, SacramentType } from "@/features/sacraments/sacrament.types";

export function SacramentsWorkspace({
  type,
  priestOptions,
}: {
  type: SacramentType;
  priestOptions: { id: string; name: string }[];
}) {
  const [selected, setSelected] = React.useState<ApiSacrament | null>(null);

  React.useEffect(() => setSelected(null), [type]);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-card sm:p-5">
        <SacramentTable
          type={type}
          selectedId={selected?.id ?? null}
          onSelect={setSelected}
          priestOptions={priestOptions}
        />
      </div>

      {/* Pop-up Modal Dialog with Back Button */}
      <SacramentDetailDialog
        record={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
