"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Wallet2, Bell, ShieldCheck, DatabaseBackup } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "General Settings", href: "/settings", icon: Settings },
  { label: "Financial Settings", href: "/settings/financial", icon: Wallet2 },
  { label: "Notification Settings", href: "/settings/notifications", icon: Bell },
  { label: "Security Settings", href: "/settings/security", icon: ShieldCheck },
  { label: "Backup & Restore", href: "/settings/backup", icon: DatabaseBackup },
];

export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex gap-6 overflow-x-auto border-b border-border scrollbar-thin">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 pb-3 text-[14px] font-medium transition-colors duration-150",
              active ? "text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            <Icon size={15} />
            {tab.label}
            {active && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
          </Link>
        );
      })}
    </div>
  );
}
