"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/language-context";
import {
  navigationGroups,
  type NavItem,
  type NavGroup,
} from "./nav-config";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

function isItemActive(item: NavItem, pathname: string) {
  if (pathname === item.href) return true;
  if (item.href !== "/dashboard" && pathname.startsWith(item.href)) return true;
  if (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"))) return true;
  return false;
}

export function Sidebar({ mobileOpen, onMobileClose, collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { locale } = useLanguage();
  const userRoles = session?.user?.roles ?? [];

  function hasAccess(roles?: string[]) {
    if (!roles || roles.length === 0) return true;
    return userRoles.some((r) => roles.includes(r));
  }

  const isAmharic = locale === "am";

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden cursor-default border-none"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-[#131014] border-r border-[#29222C] transition-[width,transform] duration-150 select-none",
          collapsed ? "w-[76px]" : "w-[260px]",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand header matching screenshot */}
        <div className="flex flex-col justify-center px-4 py-3.5 border-b border-[#29222C]/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#C69214]/40 bg-gradient-to-b from-[#7A1C2E] to-[#1B171C] shadow-[0_0_12px_rgba(198,146,20,0.25)]">
              <EthiopicCross size={20} variant="gold" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate font-serif text-[15px] font-bold tracking-tight text-[#FAF8F5]">
                  ቅድስት በዓታ
                </div>
                <div className="truncate text-[10.5px] font-medium text-white/50">
                  ቻግኒ ብርሃነ ገነት ቤተክርስቲያን
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="mt-2 flex items-center">
              <span className="inline-flex items-center rounded border border-[#C69214]/40 bg-[#C69214]/10 px-2 py-0.5 text-[9.5px] font-bold tracking-wider text-[#FDC348]">
                EOTC-CHG-014
              </span>
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-2 scrollbar-thin space-y-3.5">
          {navigationGroups.map((group) => {
            const accessibleItems = group.items.filter((item) => hasAccess(item.roles));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                {!collapsed ? (
                  <div className="px-2 pt-1 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                    {group.titleAmharic}{" "}
                    <span className="text-white/25">({group.titleEnglish})</span>
                  </div>
                ) : (
                  <div className="my-1.5 h-px bg-white/10" />
                )}

                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const active = isItemActive(item, pathname);
                    const mainLabel = item.labelAmharic || item.label;
                    const label = item.sublabel
                      ? `${mainLabel} (${item.sublabel})`
                      : mainLabel;

                    return (
                      <NavEntry
                        key={item.href}
                        item={item}
                        displayLabel={label}
                        active={active}
                        collapsed={collapsed}
                        pathname={pathname}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-10 items-center justify-center gap-2 border-t border-[#29222C] text-white/50 transition-colors duration-150 hover:bg-white/5 hover:text-white lg:flex"
        >
          {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          {!collapsed && <span className="text-[12px] font-medium">ማሳነሻ (Collapse)</span>}
        </button>
      </aside>
    </>
  );
}

function SectionLabel({ collapsed, children }: { collapsed: boolean; children: React.ReactNode }) {
  if (collapsed) return <div className="my-3 h-px bg-white/5" />;
  return (
    <div className="mb-2 mt-4 px-3 text-small font-medium text-sidebar-muted">
      {children}
    </div>
  );
}

function NavEntry({
  item,
  displayLabel,
  active,
  collapsed,
  pathname,
}: {
  item: NavItem;
  displayLabel: string;
  active: boolean;
  collapsed: boolean;
  pathname: string;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const [open, setOpen] = React.useState(active);

  // Keep the submenu open if the active route lives inside it.
  React.useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  const trigger = (
    <div
      className={cn(
        "group flex min-h-[38px] items-center rounded-md text-[13px] font-medium transition-colors duration-150",
        collapsed ? "justify-center px-1" : "px-2.5",
        active
          ? "bg-[#7A1C2E] text-white font-semibold shadow-sm"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        onClick={() => {
          if (hasChildren && !collapsed) {
            setOpen(true);
          }
        }}
        className={cn(
          "flex flex-1 items-center gap-2.5 py-2 focus-visible:outline-none rounded-sm",
          collapsed && "justify-center"
        )}
      >
        <Icon size={17} strokeWidth={active ? 2.2 : 1.8} className={cn("shrink-0", active ? "text-white" : "text-white/60 group-hover:text-white")} aria-hidden="true" />
        {!collapsed && <span className="flex-1 truncate tracking-tight">{displayLabel}</span>}
      </Link>
      {!collapsed && hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen((o) => !o);
          }}
          aria-label={open ? "Collapse sub-items" : "Expand sub-items"}
          className="rounded p-1 text-white/40 transition-colors hover:text-white"
        >
          <ChevronDown
            size={14}
            className={cn("shrink-0 transition-transform duration-150", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );

  const wrapped = collapsed ? (
    <Tooltip label={displayLabel} side="right">
      {trigger}
    </Tooltip>
  ) : (
    trigger
  );

  return (
    <div>
      {wrapped}
      {!collapsed && hasChildren && open && (
        <div className="ml-[21px] mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-4">
          {item.children!.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                aria-current={childActive ? "page" : undefined}
                className={cn(
                  "flex min-h-[38px] items-center rounded-md px-3 text-sidebar transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  childActive
                    ? "font-semibold text-gold bg-sidebar-hover/40"
                    : "text-sidebar-muted hover:text-sidebar-text"
                )}
              >
                <span
                  className={cn(
                    "mr-2 h-1.5 w-1.5 shrink-0 rounded-full",
                    childActive ? "bg-gold shadow-glow-gold" : "bg-transparent"
                  )}
                />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
