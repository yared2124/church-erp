import {
  LayoutDashboard,
  Users,
  Cross,
  Wallet,
  Building2,
  Boxes,
  UserCog,
  FileBadge2,
  BarChart3,
  History,
  UploadCloud,
  ShieldAlert,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavChild[];
}

export const dashboardNavItem: NavItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
};

export const mainModuleNavItems: NavItem[] = [
  {
    label: "Members & Families",
    href: "/members",
    icon: Users,
    children: [
      { label: "Members", href: "/members" },
      { label: "Families", href: "/members/families" },
      { label: "Family Payments", href: "/members/family-payments" },
    ],
  },
  {
    label: "Sacraments",
    href: "/sacraments",
    icon: Cross,
    children: [
      { label: "Baptisms", href: "/sacraments/baptisms" },
      { label: "Marriages", href: "/sacraments/marriages" },
      { label: "Burials", href: "/sacraments/burials" },
    ],
  },
  {
    label: "Financial Management",
    href: "/finance",
    icon: Wallet,
    children: [
      { label: "Overview", href: "/finance" },
      { label: "Transactions", href: "/finance/transactions" },
      { label: "Sebeka Payments", href: "/finance/sebeka-payments" },
      { label: "Income", href: "/finance/income" },
      { label: "Expenses", href: "/finance/expenses" },
      { label: "Categories", href: "/finance/categories" },
      { label: "Payment Methods", href: "/finance/payment-methods" },
      { label: "Reports", href: "/finance/reports" },
    ],
  },
  {
    label: "Property & Rentals",
    href: "/property",
    icon: Building2,
    children: [
      { label: "Overview", href: "/property" },
      { label: "Houses", href: "/property/houses" },
      { label: "Tenants", href: "/property/tenants" },
      { label: "Rent Payments", href: "/property/rent-payments" },
      { label: "Lease Agreements", href: "/property/lease-agreements" },
      { label: "Maintenance", href: "/property/maintenance" },
      { label: "Overdue Rentals", href: "/property/overdue-rentals" },
    ],
  },
  {
    label: "Assets & Inventory",
    href: "/inventory",
    icon: Boxes,
    children: [
      { label: "Overview", href: "/inventory" },
      { label: "Items", href: "/inventory/items" },
      { label: "Categories", href: "/inventory/categories" },
      { label: "Suppliers", href: "/inventory/suppliers" },
      { label: "Purchases", href: "/inventory/purchases" },
      { label: "Maintenance", href: "/inventory/maintenance" },
      { label: "Stock Movements", href: "/inventory/stock-movements" },
    ],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: UserCog,
    children: [
      { label: "Overview", href: "/employees" },
      { label: "All Employees", href: "/employees/all" },
      { label: "Departments", href: "/employees/departments" },
      { label: "Positions", href: "/employees/positions" },
      { label: "Attendance", href: "/employees/attendance" },
      { label: "Leaves", href: "/employees/leaves" },
      { label: "Payroll", href: "/employees/payroll" },
    ],
  },
  {
    label: "Certificate Requests",
    href: "/certificates",
    icon: FileBadge2,
    children: [{ label: "Certificates", href: "/certificates" }],
  },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    children: [
      { label: "Overview", href: "/reports" },
      { label: "Financial Reports", href: "/reports/financial" },
      { label: "Member Reports", href: "/reports/members" },
      { label: "Sacrament Reports", href: "/reports/sacraments" },
      { label: "Property Reports", href: "/reports/property" },
      { label: "Inventory Reports", href: "/reports/inventory" },
      { label: "Employee Reports", href: "/reports/employees" },
      { label: "Custom Reports", href: "/reports/custom" },
    ],
  },
  {
    label: "Church History",
    href: "/history",
    icon: History,
    children: [
      { label: "Timeline", href: "/history" },
      { label: "Milestones", href: "/history/milestones" },
      { label: "Events", href: "/history/events" },
      { label: "Gallery", href: "/history/gallery" },
      { label: "Documents", href: "/history/documents" },
    ],
  },
  {
    label: "Bulk Import",
    href: "/bulk-import",
    icon: UploadCloud,
    children: [
      { label: "Overview", href: "/bulk-import" },
      { label: "Import Members", href: "/bulk-import/members" },
      { label: "Import Accounts", href: "/bulk-import/accounts" },
      { label: "Import Transactions", href: "/bulk-import/transactions" },
      { label: "Import Donations", href: "/bulk-import/donations" },
      { label: "Import Assets", href: "/bulk-import/assets" },
    ],
  },
  { label: "Audit Logs", href: "/audit-logs", icon: ShieldAlert },
];

export const settingsNavItems: NavItem[] = [
  {
    label: "Users & Roles",
    href: "/users",
    icon: ShieldCheck,
    children: [
      { label: "Users", href: "/users" },
      { label: "Roles & Permissions", href: "/users/roles" },
    ],
  },
  {
    label: "System Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { label: "General Settings", href: "/settings" },
      { label: "Financial Settings", href: "/settings/financial" },
      { label: "Notification Settings", href: "/settings/notifications" },
      { label: "Security Settings", href: "/settings/security" },
      { label: "Backup & Restore", href: "/settings/backup" },
    ],
  },
];
