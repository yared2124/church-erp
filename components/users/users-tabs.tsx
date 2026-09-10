"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Users", href: "/users" },
  { label: "Roles & Permissions", href: "/users/roles" },
] as const;

export type UsersTab = (typeof TABS)[number]["label"];

export function UsersTabs({
  value,
  onChange,
}: {
  value: UsersTab;
  onChange?: (v: UsersTab) => void;
}) {
  return (
    <div className="mb-5 flex gap-6 border-b border-border">
      {TABS.map((tab) => {
        const active = tab.label === value;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            onClick={() => {
              if (onChange) onChange(tab.label);
            }}
            className={cn(
              "relative pb-3 text-[14px] font-medium transition-colors duration-150",
              active ? "text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.label}
            {active && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
          </Link>
        );
      })}
    </div>
  );
}
