"use client";

import * as React from "react";
import { FamilyTable } from "./family-table";
import { FamilyDetailDialog } from "./family-detail-dialog";
import type { ApiFamily } from "@/features/families/family.types";

export function FamiliesWorkspace({ refreshKey = 0 }: { refreshKey?: number }) {
  const [selected, setSelected] = React.useState<ApiFamily | null>(null);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-card sm:p-5">
        <FamilyTable selectedId={selected?.id ?? null} onSelect={setSelected} refreshKey={refreshKey} />
      </div>

      {/* Pop-up Modal Dialog with Back Button */}
      <FamilyDetailDialog
        family={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
