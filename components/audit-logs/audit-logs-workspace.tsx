"use client";

import * as React from "react";
import { AuditLogTable, type ApiAuditLog } from "./audit-log-table";
import { AuditLogDetailDialog } from "./audit-log-detail-dialog";

export function AuditLogsWorkspace({
  filterOptions,
}: {
  filterOptions: { users: { id: string; name: string }[]; actions: string[]; entities: string[] };
}) {
  const [selected, setSelected] = React.useState<ApiAuditLog | null>(null);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-card sm:p-5">
        <AuditLogTable selectedId={selected?.id ?? null} onSelect={setSelected} filterOptions={filterOptions} />
      </div>

      {/* Pop-up Modal Dialog with Back Button */}
      <AuditLogDetailDialog
        log={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
