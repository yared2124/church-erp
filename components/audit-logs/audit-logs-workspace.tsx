"use client";

import * as React from "react";
import { AuditLogTable, type ApiAuditLog } from "./audit-log-table";
import { AuditLogDetailPanel } from "./audit-log-detail-panel";

export function AuditLogsWorkspace({
  filterOptions,
}: {
  filterOptions: { users: { id: string; name: string }[]; actions: string[]; entities: string[] };
}) {
  const [selected, setSelected] = React.useState<ApiAuditLog | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <AuditLogTable selectedId={selected?.id ?? null} onSelect={setSelected} filterOptions={filterOptions} />
        </div>
      </div>
      <div className="xl:col-span-4">
        <AuditLogDetailPanel log={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
