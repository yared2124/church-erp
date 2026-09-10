"use client";

import * as React from "react";
import { CertificateTable, type ApiCertificateRequest } from "./certificate-table";
import { CertificateDetailDialog } from "./certificate-detail-dialog";

export function CertificatesWorkspace() {
  const [selected, setSelected] = React.useState<ApiCertificateRequest | null>(null);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-card sm:p-5">
        <CertificateTable selectedId={selected?.id ?? null} onSelect={setSelected} />
      </div>

      {/* Pop-up Modal Dialog with Back Button */}
      <CertificateDetailDialog
        request={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
