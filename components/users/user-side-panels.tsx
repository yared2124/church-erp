import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { ApiSystemUser } from "./user-table";

type UserStatus = "Active" | "Inactive" | "Locked";
const statusTone: Record<UserStatus, BadgeTone> = { Active: "success", Inactive: "neutral", Locked: "danger" };

interface RoleSummary {
  id: string;
  name: string;
  users: number;
}

export function RolesSummaryCard({ roles }: { roles: RoleSummary[] }) {
  const totalRoles = roles.length;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles Summary</CardTitle>
        <button className="flex items-center gap-1 text-[13px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover">
          <Plus size={14} /> Add Role
        </button>
      </CardHeader>
      <div className="flex flex-col gap-2.5">
        {roles.map((r) => (
          <div key={r.id} className="flex items-center justify-between text-[13px]">
            <Badge tone="info">{r.name}</Badge>
            <span className="text-text-secondary">{r.users} users</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border-light pt-3 text-[13px]">
        <span className="text-text-secondary">Total Roles</span>
        <span className="font-bold text-text-primary">{totalRoles}</span>
      </div>
    </Card>
  );
}

export function SelectedUserDetailsCard({ user }: { user: ApiSystemUser | null }) {
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <p className="py-6 text-center text-small text-text-secondary">Select a user from the table to see their details here.</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Details</CardTitle>
      </CardHeader>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-[14px] font-bold text-primary">
          {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold text-text-primary">{user.name}</p>
          <p className="text-[12px] text-text-secondary">{user.email}</p>
        </div>
        <Badge tone={statusTone[user.status]}>{user.status}</Badge>
      </div>
      <div className="mt-4 flex flex-col gap-2.5 text-[13px]">
        <Row label="Roles" value={user.roles.map((r) => r.role.name).join(", ") || "—"} />
        <Row label="Email" value={user.email} />
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11.5px] text-text-muted">{label}</p>
      <p className="font-medium text-text-primary">{value}</p>
    </div>
  );
}
