"use client";

import * as React from "react";
import { FamilyTable } from "./family-table";
import { FamilyDetailPanel } from "./family-detail-panel";
import type { ApiFamily } from "@/features/families/family.types";

export function FamiliesWorkspace({ refreshKey = 0 }: { refreshKey?: number }) {
  const [selected, setSelected] = React.useState<ApiFamily | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <FamilyTable selectedId={selected?.id ?? null} onSelect={setSelected} refreshKey={refreshKey} />
        </div>
      </div>
      <div className="xl:col-span-4">
        <FamilyDetailPanel family={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
