"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { Menu, Bell, Mail, Calendar, ChevronDown, Globe, LogOut, Check, UserCircle2 } from "lucide-react";
import { SearchInput } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { locale, setLocale, t } = useLanguage();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[58px] items-center justify-between gap-3 border-b border-[#E4E2DF] bg-white px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#E4E2DF] text-slate-700 transition-colors duration-150 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={18} aria-hidden="true" />
        </button>

        {/* Date & Liturgical Year Badge from Design */}
        <div className="hidden items-center gap-2.5 text-[12.5px] text-slate-700 xl:flex">
          <Calendar size={15} className="text-[#7A1C2E]" />
          <span className="font-semibold text-slate-800">
            ጥቅምት ፳፬ ቀን ፳፻፲፯ ዓ.ም.
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">Nov 3, 2024</span>
          <span className="inline-flex items-center rounded-full border border-[#C69214]/30 bg-[#FDF8ED] px-2.5 py-0.5 text-[10.5px] font-bold text-[#9A6F0A]">
            ዘመነ ማቴዎስ
          </span>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="max-w-[420px] flex-1">
        <div className="relative">
          <SearchInput
            placeholder="በመታወቂያ / በክርስትና ስም / በስልክ..."
            aria-label="Global search"
            className="h-9 rounded-md border-[#D1D5DB] bg-[#F9FAFB] pl-9 text-[12.5px] focus:bg-white"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* + አዲስ ምዝገባ Action Button */}
        <button
          type="button"
          onClick={() => {
            window.location.href = "/members";
          }}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-[#7A1C2E] px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-sm transition-all hover:bg-[#631625] active:scale-95"
        >
          <span>+</span>
          <span>አዲስ ምዝገባ</span>
        </button>

        {/* Segmented Language Switcher */}
        <div className="hidden rounded-md border border-[#E4E2DF] bg-slate-50 p-0.5 sm:inline-flex text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setLocale("am")}
            className={cn(
              "rounded px-2.5 py-1 transition-all",
              locale === "am" ? "bg-white text-[#7A1C2E] shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
            )}
          >
            አማርኛ
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={cn(
              "rounded px-2.5 py-1 transition-all",
              locale === "en" ? "bg-white text-[#7A1C2E] shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
            )}
          >
            English
          </button>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-md border border-[#E4E2DF] text-slate-700 hover:bg-slate-100"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#E53E3E] ring-2 ring-white" />
          </button>

          {notifOpen && (
            <>
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-lg border border-border bg-surface p-4 shadow-elevated">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="text-[13.5px] font-bold text-text-primary">ማሳወቂያዎች (Notifications)</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-bold text-primary">3 አዲስ</span>
                </div>
                <div className="divide-y divide-border/60 py-2 text-[12px]">
                  <div className="py-2">
                    <p className="font-semibold text-text-primary">የጥምቀት ምስክር ወረቀት ጥያቄ ቀርቧል</p>
                    <p className="text-[11px] text-text-muted">ከ 15 ደቂቃ በፊት • በቀሲስ ዮሐንስ</p>
                  </div>
                  <div className="py-2">
                    <p className="font-semibold text-text-primary">የዓመታዊ ሰበካ መዋጮ ደረሰኝ #REC-4092 ተመዝግቧል</p>
                    <p className="text-[11px] text-text-muted">ከ 1 ሰዓት በፊት • 1,500 ETB</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Account Pill */}
        <div className="relative">
          <button
            type="button"
            aria-label="User account menu"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-[#E4E2DF] bg-slate-50/60 py-1 pl-1.5 pr-2.5 hover:bg-slate-100"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#7A1C2E] to-[#C69214] text-[11px] font-extrabold text-white">
              ዋአ
            </div>
            <div className="hidden text-left text-[11.5px] leading-tight md:block">
              <div className="font-bold text-slate-800">Super Admin</div>
              <div className="text-[10px] text-slate-500 font-medium">ዋና አስተዳዳሪ</div>
            </div>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close user menu"
                className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-md border border-border bg-surface py-1.5 shadow-elevated">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] font-semibold text-danger hover:bg-slate-50"
                >
                  <LogOut size={15} />
                  <span>ውጣ (Sign Out)</span>
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
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  badge?: number;
  className?: string;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative flex h-control-md w-control-md items-center justify-center rounded-md border border-border text-text-secondary transition-colors duration-150 hover:bg-background-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${className ?? ""}`}
    >
      <Icon size={18} aria-hidden="true" />
      {badge && (
        <span className="absolute -right-1 -top-1 flex h-[17px] w-[17px] items-center justify-center rounded-full border-2 border-surface bg-danger text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}
