"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { LiturgicalRibbon } from "./liturgical-ribbon";

export function AppShell({ children }: { children: React.ReactNode }) {
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
        <LiturgicalRibbon />
        <Header
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
