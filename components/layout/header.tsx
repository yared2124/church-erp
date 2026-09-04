"use client";

import * as React from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Menu, Search, Bell, Mail, Calendar, ChevronDown, Globe, LogOut } from "lucide-react";
import { SearchInput } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";

interface HeaderProps {
  onMenuClick: () => void;
  userName: string;
  userRole: string;
  avatarUrl: string;
}

export function Header({ onMenuClick, userName, userRole, avatarUrl }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-header items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-control-md w-control-md shrink-0 items-center justify-center rounded-md border border-border text-text-secondary transition-colors duration-150 hover:bg-background-alt lg:hidden"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold text-text-primary">
            Welcome back, {userName}!
          </p>
          <p className="text-[12.5px] text-text-secondary">{userRole}</p>
        </div>
      </div>

      <div className="hidden max-w-[440px] flex-1 md:block">
        <div className="relative">
          <SearchInput
            placeholder="Search members, transactions, reports..."
            aria-label="Global search"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-text-muted">
            Ctrl + K
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Tooltip label="Calendar" side="bottom">
          <IconButton icon={Calendar} className="hidden sm:inline-flex" ariaLabel="Calendar" />
        </Tooltip>
        <Tooltip label="Messages" side="bottom">
          <IconButton icon={Mail} className="hidden sm:inline-flex" ariaLabel="Messages" />
        </Tooltip>
        <Tooltip label="Notifications" side="bottom">
          <IconButton icon={Bell} badge={3} ariaLabel="Notifications" />
        </Tooltip>
        <Tooltip label="Language" side="bottom">
          <IconButton icon={Globe} className="hidden sm:inline-flex" ariaLabel="Change language" />
        </Tooltip>

        <div className="mx-1 hidden h-7 w-px bg-border sm:block" />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors duration-150 hover:bg-background-alt"
          >
            <Image
              src={avatarUrl}
              alt={userName}
              width={38}
              height={38}
              className="rounded-full object-cover"
            />
            <div className="hidden text-left sm:block">
              <div className="text-[13.5px] font-semibold text-text-primary">{userName}</div>
              <div className="text-[12px] text-text-secondary">{userRole}</div>
            </div>
            <ChevronDown size={16} className="hidden text-text-muted sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-md border border-border bg-surface py-1.5 shadow-elevated">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] font-medium text-danger transition-colors duration-150 hover:bg-background-alt"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function IconButton({
  icon: Icon,
  badge,
  className,
  ariaLabel,
}: {
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`relative flex h-control-md w-control-md items-center justify-center rounded-md border border-border text-text-secondary transition-colors duration-150 hover:bg-background-alt ${className ?? ""}`}
    >
      <Icon size={18} />
      {badge && (
        <span className="absolute -right-1 -top-1 flex h-[17px] w-[17px] items-center justify-center rounded-full border-2 border-surface bg-danger text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
