"use client";

import * as React from "react";
import { SacramentTable } from "./sacrament-table";
import { SacramentDetailPanel } from "./sacrament-detail-panel";
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
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <SacramentTable type={type} selectedId={selected?.id ?? null} onSelect={setSelected} priestOptions={priestOptions} />
        </div>
      </div>
      <div className="xl:col-span-4">
        <SacramentDetailPanel record={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
