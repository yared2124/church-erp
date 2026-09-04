"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TABS = ["Users", "Roles & Permissions"] as const;
export type UsersTab = (typeof TABS)[number];

export function UsersTabs({ value, onChange }: { value: UsersTab; onChange: (v: UsersTab) => void }) {
  return (
    <div className="mb-5 flex gap-6 border-b border-border">
      {TABS.map((tab) => {
        const active = tab === value;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={cn(
              "relative pb-3 text-[14px] font-medium transition-colors duration-150",
              active ? "text-primary" : "text-text-secondary hover:text-text-primary"
            )}
          >
            {tab}
            {active && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
