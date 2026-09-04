"use client";

import * as React from "react";
import { CertificateTable, type ApiCertificateRequest } from "./certificate-table";
import { CertificateDetailPanel } from "./certificate-detail-panel";

export function CertificatesWorkspace() {
  const [selected, setSelected] = React.useState<ApiCertificateRequest | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <CertificateTable selectedId={selected?.id ?? null} onSelect={setSelected} />
        </div>
      </div>
      <div className="xl:col-span-4">
        <CertificateDetailPanel request={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
