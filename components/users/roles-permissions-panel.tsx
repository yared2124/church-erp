import { ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleSummary {
  id: string;
  name: string;
  users: number;
  permissions: string[];
}

export function RolesPermissionsPanel({ roles }: { roles: RoleSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {roles.map((role) => (
        <Card key={role.id}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-light">
                <ShieldCheck size={20} className="text-primary" />
              </div>
              <div>
                <CardTitle>{role.name}</CardTitle>
                <p className="text-small text-text-secondary">{role.users} users</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">Edit</Button>
          </CardHeader>
          {role.permissions.length === 0 ? (
            <p className="text-[13px] text-text-secondary">No permissions assigned yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {role.permissions.map((perm) => (
                <li key={perm} className="flex items-start gap-2 text-[13px] text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {perm}
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}
