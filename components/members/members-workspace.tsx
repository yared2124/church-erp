"use client";

import * as React from "react";
import { MemberTable } from "./member-table";
import { MemberDetailPanel } from "./member-detail-panel";
import type { ApiMember } from "@/features/members/member.types";

export function MembersWorkspace() {
  const [selected, setSelected] = React.useState<ApiMember | null>(null);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
          <MemberTable selectedId={selected?.id ?? null} onSelect={setSelected} />
        </div>
      </div>
      <div className="xl:col-span-4">
        <MemberDetailPanel member={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
