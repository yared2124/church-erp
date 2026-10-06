"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { Menu, Bell, Mail, Calendar, ChevronDown, Globe, LogOut, Check, UserCircle2 } from "lucide-react";
import { SearchInput } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/language-context";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { locale, setLocale, t } = useLanguage();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-header items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-control-md w-control-md shrink-0 items-center justify-center rounded-md border border-border text-text-secondary transition-colors duration-150 hover:bg-background-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="hidden max-w-[440px] flex-1 md:block">
        <div className="relative">
          <SearchInput
            placeholder={t("nav.search_placeholder")}
            aria-label="Global search"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[11px] text-text-muted">
            {t("nav.search_shortcut")}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Tooltip label={t("nav.calendar")} side="bottom">
          <IconButton icon={Calendar} className="hidden sm:inline-flex" ariaLabel="Calendar" />
        </Tooltip>
        <Tooltip label={t("nav.messages")} side="bottom">
          <IconButton icon={Mail} className="hidden sm:inline-flex" ariaLabel="Messages" />
        </Tooltip>

        {/* Notifications */}
        <div className="relative">
          <Tooltip label={t("nav.notifications")} side="bottom">
            <IconButton
              icon={Bell}
              ariaLabel="Notifications"
              onClick={() => {
                setNotifOpen((o) => !o);
                setLangMenuOpen(false);
                setMenuOpen(false);
              }}
            />
          </Tooltip>

          {notifOpen && (
            <>
              <button
                type="button"
                aria-label="Close notifications"
                className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-lg border border-border bg-surface p-4 shadow-elevated animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <h3 className="text-[14px] font-bold text-text-primary">{t("nav.notifications")}</h3>
                  <span className="rounded-full bg-background-alt px-2 py-0.5 text-[11px] font-medium text-text-muted">0 new</span>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-background-alt text-text-muted">
                    <Bell size={20} aria-hidden="true" />
                  </div>
                  <p className="text-[13.5px] font-semibold text-text-primary">{t("nav.no_notifications")}</p>
                  <p className="mt-1 text-[12px] text-text-secondary">{t("nav.no_notifications_desc")}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative">
          <Tooltip label={t("nav.language")} side="bottom">
            <button
              type="button"
              onClick={() => {
                setLangMenuOpen((o) => !o);
                setNotifOpen(false);
                setMenuOpen(false);
              }}
              aria-label="Change language"
              className="flex h-control-md items-center gap-1.5 rounded-md border border-border px-2 text-[12.5px] font-semibold text-text-secondary transition-colors duration-150 hover:bg-background-alt hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            >
              <Globe size={16} aria-hidden="true" />
              <span className="uppercase">{locale}</span>
            </button>
          </Tooltip>

          {langMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Close language menu"
                className="fixed inset-0 z-40 cursor-default border-none bg-transparent"
                onClick={() => setLangMenuOpen(false)}
              />
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 rounded-md border border-border bg-surface py-1.5 shadow-elevated animate-in fade-in duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setLocale("en");
                    setLangMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-[13px] font-medium transition-colors duration-150 hover:bg-background-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${locale === "en" ? "text-primary font-semibold bg-primary-light/40" : "text-text-primary"}`}
                >
                  <span>{t("lang.english")}</span>
                  {locale === "en" && <Check size={14} className="text-primary" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLocale("am");
                    setLangMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-[13px] font-medium transition-colors duration-150 hover:bg-background-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${locale === "am" ? "text-primary font-semibold bg-primary-light/40" : "text-text-primary"}`}
                >
                  <span>{t("lang.amharic")}</span>
                  {locale === "am" && <Check size={14} className="text-primary" aria-hidden="true" />}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mx-1 hidden h-7 w-px bg-border sm:block" />

        {/* User profile dropdown - Clean text without avatar photo */}
        <div className="relative">
          <button
            type="button"
            aria-label="User account menu"
            onClick={() => {
              setMenuOpen((o) => !o);
              setLangMenuOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface px-2.5 py-1.5 transition-colors duration-150 hover:bg-background-alt hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          >
            <UserCircle2 size={20} className="text-text-secondary" aria-hidden="true" />
            <ChevronDown size={14} className="text-text-muted" aria-hidden="true" />
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
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] font-medium text-danger transition-colors duration-150 hover:bg-background-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                >
                  <LogOut size={16} aria-hidden="true" />
                  {t("nav.sign_out")}
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
