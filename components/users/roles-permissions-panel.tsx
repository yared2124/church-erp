"use client";

import * as React from "react";
import { ShieldCheck, Users, Lock, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { RoleUsersDialog } from "./role-users-dialog";

export interface RoleSummary {
  id: string;
  name: string;
  users: number;
  permissions: string[];
}

export function RolesPermissionsPanel({ roles }: { roles: RoleSummary[] }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {roles.map((role) => (
          <Card key={role.id} hoverable className="flex flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary-light text-primary">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    <p className="text-small text-text-secondary">
                      {role.users} {isAmharic ? "ተጠቃሚዎች ተመድበዋል" : "assigned users"}
                    </p>
                  </div>
                </div>
                <Badge tone="info">{role.name}</Badge>
              </CardHeader>

              <div className="px-5 py-2">
                <p className="text-[12.5px] font-medium text-text-muted mb-2">
                  {isAmharic ? "የተሰጡ ፈቃዶች (Permissions):" : "Granted Permissions:"}
                </p>
                {role.permissions.length === 0 ? (
                  <p className="text-[13px] text-text-secondary italic">
                    {isAmharic ? "ምንም የተሰጠ ፈቃድ የለም።" : "No permissions assigned yet."}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center rounded-md border border-border/80 bg-background-alt px-2 py-0.5 text-[11.5px] font-medium text-text-secondary"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border-light px-5 py-3 mt-4 bg-background-alt/30 rounded-b-xl">
              <span className="text-[12px] text-text-muted">
                {role.permissions.length} {isAmharic ? "ፈቃዶች" : "permissions"}
              </span>
              <Button
                variant="secondary"
                size="sm"
                icon={<Users size={14} />}
                onClick={() => setSelectedRole(role.name)}
                className="text-[12.5px] font-medium"
              >
                {isAmharic ? "ተጠቃሚዎችን እይ" : "View Members"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Role Members Pop-up Modal with Back Button */}
      <RoleUsersDialog
        roleName={selectedRole}
        open={!!selectedRole}
        onOpenChange={(open) => {
          if (!open) setSelectedRole(null);
        }}
      />
    </>
  );
}
