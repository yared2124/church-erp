"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  // Owned here (not inside Sidebar) so the content area's left padding can
  // stay in sync with the sidebar's actual rendered width. If this state
  // lived only inside Sidebar, collapsing it would leave a gap/overlap
  // because the content padding would never change.
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-150",
          collapsed ? "lg:pl-sidebar-collapsed" : "lg:pl-sidebar"
        )}
      >
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
          userName={session?.user?.name ?? "..."}
          userRole={session?.user?.roles?.[0] ?? "Member"}
          avatarUrl={session?.user?.image ?? "https://i.pravatar.cc/76?img=13"}
        />
        {children}
      </div>
    </div>
  );
}
