"use client";

import * as React from "react";
import { MemberTable } from "./member-table";
import { MemberDetailDialog } from "./member-detail-dialog";
import type { ApiMember } from "@/features/members/member.types";

export function MembersWorkspace() {
  const [selected, setSelected] = React.useState<ApiMember | null>(null);

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-card sm:p-5">
        <MemberTable selectedId={selected?.id ?? null} onSelect={setSelected} />
      </div>

      {/* Pop-up Modal Dialog with Back Button */}
      <MemberDetailDialog
        member={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
