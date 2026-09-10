"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronsLeft, ChevronsRight, ChevronDown, Church, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/language-context";
import {
  dashboardNavItem,
  mainModuleNavItems,
  settingsNavItems,
  type NavItem,
} from "./nav-config";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

function getActiveChildHref(item: NavItem, pathname: string): string | null {
  if (!item.children?.length) return null;
  const matches = item.children.filter(
    (c) => pathname === c.href || pathname.startsWith(c.href + "/")
  );
  if (matches.length === 0) return null;
  // Multiple children can share a path prefix (e.g. "/members" and
  // "/members/families" both start with "/members"), so the most specific
  // (longest) href wins and only that one lights up.
  return matches.reduce((best, c) => (c.href.length > best.href.length ? c : best)).href;
}

function isItemActive(item: NavItem, pathname: string) {
  if (!item.children?.length) return pathname === item.href;
  return getActiveChildHref(item, pathname) !== null;
}

export function Sidebar({ mobileOpen, onMobileClose, collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const userRoles = session?.user?.roles ?? [];

  function translateNav(label: string): string {
    const keyMap: Record<string, string> = {
      "Dashboard": "sidebar.dashboard",
      "Members & Families": "sidebar.members",
      "Members": "sidebar.members_list",
      "Families": "sidebar.families",
      "Family Payments": "sidebar.family_payments",
      "Sacraments": "sidebar.sacraments",
      "Baptisms": "sidebar.baptisms",
      "Marriages": "sidebar.marriages",
      "Burials": "sidebar.burials",
      "Financial Management": "sidebar.finance",
      "Income": "sidebar.income",
      "Expenses": "sidebar.expenses",
      "Transactions": "sidebar.transactions",
      "Sebeka Payments": "sidebar.sebeka_payments",
      "Financial Reports": "sidebar.finance_reports",
      "Certificates": "sidebar.certificates",
      "Property & Inventory": "sidebar.property",
      "Clergy & Employees": "sidebar.employees",
      "Church History": "sidebar.history",
      "Reports & Analytics": "sidebar.reports",
      "Bulk Import": "sidebar.bulk_import",
      "Audit Logs": "sidebar.audit_logs",
      "Users & Roles": "sidebar.users",
      "Users": "sidebar.users",
      "Roles & Permissions": "sidebar.users",
      "System Settings": "sidebar.system_settings",
      "General Settings": "sidebar.system_settings",
      "Financial Settings": "sidebar.system_settings",
      "Notification Settings": "sidebar.system_settings",
      "Security Settings": "sidebar.system_settings",
      "Backup & Restore": "sidebar.system_settings",
    };

    const key = keyMap[label];
    return key ? t(key) : label;
  }

  function hasAccess(roles?: string[]) {
    if (!roles || roles.length === 0) return true;
    return userRoles.some((r) => roles.includes(r));
  }

  function filterNav(items: NavItem[]): NavItem[] {
    return items
      .filter((item) => hasAccess(item.roles))
      .map((item) => ({
        ...item,
        label: translateNav(item.label),
        children: item.children?.filter((child) => hasAccess(child.roles)).map((c) => ({
          ...c,
          label: translateNav(c.label),
        })),
      }));
  }

  const showDashboard = hasAccess(dashboardNavItem.roles);
  const translatedDashboardItem = {
    ...dashboardNavItem,
    label: translateNav(dashboardNavItem.label),
  };
  const filteredMainItems = filterNav(mainModuleNavItems);
  const filteredSettingsItems = filterNav(settingsNavItems);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col bg-sidebar transition-all duration-150",
          collapsed ? "w-sidebar-collapsed" : "w-sidebar",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-sidebar-secondary">
            <Church size={20} className="text-[#C9A24B]" strokeWidth={1.75} />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[14px] font-bold text-sidebar-text">
                Birhane Genet
              </div>
              <div className="truncate text-[12.5px] text-sidebar-muted">
                St. Mary Church
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 scrollbar-thin">
          {showDashboard && (
            <NavEntry
              item={translatedDashboardItem}
              active={pathname === dashboardNavItem.href}
              collapsed={collapsed}
              pathname={pathname}
            />
          )}

          {filteredMainItems.length > 0 && (
            <>
              <SectionLabel collapsed={collapsed}>{t("sidebar.main_modules")}</SectionLabel>
              <div className="flex flex-col gap-0.5">
                {filteredMainItems.map((item) => (
                  <NavEntry
                    key={item.href}
                    item={item}
                    active={isItemActive(item, pathname)}
                    collapsed={collapsed}
                    pathname={pathname}
                  />
                ))}
              </div>
            </>
          )}

          {filteredSettingsItems.length > 0 && (
            <>
              <SectionLabel collapsed={collapsed}>{t("sidebar.settings")}</SectionLabel>
              <div className="flex flex-col gap-0.5 pb-3">
                {filteredSettingsItems.map((item) => (
                  <NavEntry
                    key={item.href}
                    item={item}
                    active={isItemActive(item, pathname)}
                    collapsed={collapsed}
                    pathname={pathname}
                  />
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Help card */}
        {!collapsed && (
          <div className="m-3 rounded-lg bg-sidebar-secondary p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/25">
                <Headphones size={17} className="text-indigo-300" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-sidebar-text">Need Help?</div>
                <div className="text-[12px] text-sidebar-muted">Contact System Admin</div>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-11 items-center justify-center gap-2 border-t border-white/5 text-sidebar-muted transition-colors duration-150 hover:bg-sidebar-hover hover:text-sidebar-text lg:flex"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!collapsed && <span className="text-[13px] font-medium">Collapse</span>}
        </button>
      </aside>
    </>
  );
}

function SectionLabel({ collapsed, children }: { collapsed: boolean; children: React.ReactNode }) {
  if (collapsed) return <div className="my-3 h-px bg-white/5" />;
  return (
    <div className="mb-2 mt-5 px-3 text-[11px] font-bold uppercase tracking-wider text-sidebar-muted">
      {children}
    </div>
  );
}

function NavEntry({
  item,
  active,
  collapsed,
  pathname,
}: {
  item: NavItem;
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
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={(e) => {
        if (hasChildren && !collapsed) {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }}
      className={cn(
        "flex min-h-[44px] items-center gap-3 rounded-md px-3 text-[14px] font-medium transition-colors duration-150",
        collapsed && "justify-center px-0",
        active
          ? "bg-sidebar-active text-white font-semibold"
          : "text-sidebar-text-secondary hover:bg-sidebar-hover hover:text-sidebar-text"
      )}
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && hasChildren && (
        <ChevronDown
          size={15}
          className={cn("shrink-0 transition-transform duration-150", open && "rotate-180")}
        />
      )}
    </Link>
  );

  const wrapped = collapsed ? (
    <Tooltip label={item.label} side="right">
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
                  "flex min-h-[38px] items-center rounded-md px-3 text-[13.5px] transition-colors duration-150",
                  childActive
                    ? "font-semibold text-white"
                    : "text-sidebar-muted hover:text-sidebar-text"
                )}
              >
                <span
                  className={cn(
                    "mr-2 h-1.5 w-1.5 shrink-0 rounded-full",
                    childActive ? "bg-primary" : "bg-transparent"
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
