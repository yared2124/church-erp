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
  roles?: string[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
  children?: NavChild[];
}

// 1. Dashboard - ለሁሉም የተፈቀዱ Roles ይታያል
export const dashboardNavItem: NavItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
  roles: ["ADMIN", "PRIEST", "CASHIER", "SEBEKA_GUBAE"],
};

// 2. Main Modules - በ Role የተገደቡ ዋና ዋና ክፍሎች
export const mainModuleNavItems: NavItem[] = [
  {
    label: "Members & Families",
    href: "/members",
    icon: Users,
    roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE"],
    children: [
      {
        label: "Members",
        href: "/members",
        roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE"],
      },
      {
        label: "Families",
        href: "/members/families",
        roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE"],
      },
      {
        label: "Family Payments",
        href: "/members/family-payments",
        roles: ["ADMIN", "CASHIER", "SEBEKA_GUBAE"],
      },
    ],
  },
  {
    label: "Sacraments",
    href: "/sacraments",
    icon: Cross,
    roles: ["ADMIN", "PRIEST"],
    children: [
      {
        label: "Baptisms",
        href: "/sacraments/baptisms",
        roles: ["ADMIN", "PRIEST"],
      },
      {
        label: "Marriages",
        href: "/sacraments/marriages",
        roles: ["ADMIN", "PRIEST"],
      },
      {
        label: "Burials",
        href: "/sacraments/burials",
        roles: ["ADMIN", "PRIEST"],
      },
    ],
  },
  {
    label: "Financial Management",
    href: "/finance",
    icon: Wallet,
    roles: ["ADMIN", "CASHIER", "SEBEKA_GUBAE"],
    children: [
      {
        label: "Overview",
        href: "/finance",
        roles: ["ADMIN", "CASHIER", "SEBEKA_GUBAE"],
      },
      {
        label: "Transactions",
        href: "/finance/transactions",
        roles: ["ADMIN", "CASHIER"],
      },
      {
        label: "Sebeka Payments",
        href: "/finance/sebeka-payments",
        roles: ["ADMIN", "CASHIER", "SEBEKA_GUBAE"],
      },
      { label: "Income", href: "/finance/income", roles: ["ADMIN", "CASHIER"] },
      {
        label: "Expenses",
        href: "/finance/expenses",
        roles: ["ADMIN", "CASHIER"],
      },
      { label: "Categories", href: "/finance/categories", roles: ["ADMIN"] },
      {
        label: "Payment Methods",
        href: "/finance/payment-methods",
        roles: ["ADMIN"],
      },
      {
        label: "Reports",
        href: "/finance/reports",
        roles: ["ADMIN", "CASHIER", "SEBEKA_GUBAE"],
      },
    ],
  },
  {
    label: "Property & Rentals",
    href: "/property",
    icon: Building2,
    roles: ["ADMIN", "SEBEKA_GUBAE"],
    children: [
      {
        label: "Overview",
        href: "/property",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Houses",
        href: "/property/houses",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Tenants",
        href: "/property/tenants",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Rent Payments",
        href: "/property/rent-payments",
        roles: ["ADMIN", "CASHIER", "SEBEKA_GUBAE"],
      },
      {
        label: "Lease Agreements",
        href: "/property/lease-agreements",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Maintenance",
        href: "/property/maintenance",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Overdue Rentals",
        href: "/property/overdue-rentals",
        roles: ["ADMIN", "CASHIER", "SEBEKA_GUBAE"],
      },
    ],
  },
  {
    label: "Assets & Inventory",
    href: "/inventory",
    icon: Boxes,
    roles: ["ADMIN", "SEBEKA_GUBAE"],
    children: [
      {
        label: "Overview",
        href: "/inventory",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Items",
        href: "/inventory/items",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      { label: "Categories", href: "/inventory/categories", roles: ["ADMIN"] },
      {
        label: "Suppliers",
        href: "/inventory/suppliers",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Purchases",
        href: "/inventory/purchases",
        roles: ["ADMIN", "CASHIER"],
      },
      {
        label: "Maintenance",
        href: "/inventory/maintenance",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Stock Movements",
        href: "/inventory/stock-movements",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
    ],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: UserCog,
    roles: ["ADMIN", "SEBEKA_GUBAE"],
    children: [
      {
        label: "Overview",
        href: "/employees",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "All Employees",
        href: "/employees/all",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Departments",
        href: "/employees/departments",
        roles: ["ADMIN"],
      },
      { label: "Positions", href: "/employees/positions", roles: ["ADMIN"] },
      {
        label: "Attendance",
        href: "/employees/attendance",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Leaves",
        href: "/employees/leaves",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Payroll",
        href: "/employees/payroll",
        roles: ["ADMIN", "CASHIER"],
      },
    ],
  },
  {
    label: "Certificate Requests",
    href: "/certificates",
    icon: FileBadge2,
    roles: ["ADMIN", "PRIEST"],
    children: [
      {
        label: "Certificates",
        href: "/certificates",
        roles: ["ADMIN", "PRIEST"],
      },
    ],
  },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    roles: ["ADMIN", "SEBEKA_GUBAE", "CASHIER"],
    children: [
      {
        label: "Overview",
        href: "/reports",
        roles: ["ADMIN", "SEBEKA_GUBAE", "CASHIER"],
      },
      {
        label: "Financial Reports",
        href: "/reports/financial",
        roles: ["ADMIN", "CASHIER", "SEBEKA_GUBAE"],
      },
      {
        label: "Member Reports",
        href: "/reports/members",
        roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE"],
      },
      {
        label: "Sacrament Reports",
        href: "/reports/sacraments",
        roles: ["ADMIN", "PRIEST"],
      },
      {
        label: "Property Reports",
        href: "/reports/property",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Inventory Reports",
        href: "/reports/inventory",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      {
        label: "Employee Reports",
        href: "/reports/employees",
        roles: ["ADMIN", "SEBEKA_GUBAE"],
      },
      { label: "Custom Reports", href: "/reports/custom", roles: ["ADMIN"] },
    ],
  },
  {
    label: "Church History",
    href: "/history",
    icon: History,
    roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE", "CASHIER"],
    children: [
      {
        label: "Timeline",
        href: "/history",
        roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE", "CASHIER"],
      },
      {
        label: "Milestones",
        href: "/history/milestones",
        roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE", "CASHIER"],
      },
      {
        label: "Events",
        href: "/history/events",
        roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE", "CASHIER"],
      },
      {
        label: "Gallery",
        href: "/history/gallery",
        roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE", "CASHIER"],
      },
      {
        label: "Documents",
        href: "/history/documents",
        roles: ["ADMIN", "PRIEST", "SEBEKA_GUBAE", "CASHIER"],
      },
    ],
  },
  {
    label: "Bulk Import",
    href: "/bulk-import",
    icon: UploadCloud,
    roles: ["ADMIN"],
    children: [
      { label: "Overview", href: "/bulk-import", roles: ["ADMIN"] },
      {
        label: "Import Members",
        href: "/bulk-import/members",
        roles: ["ADMIN"],
      },
      {
        label: "Import Accounts",
        href: "/bulk-import/accounts",
        roles: ["ADMIN"],
      },
      {
        label: "Import Transactions",
        href: "/bulk-import/transactions",
        roles: ["ADMIN"],
      },
      {
        label: "Import Donations",
        href: "/bulk-import/donations",
        roles: ["ADMIN"],
      },
      { label: "Import Assets", href: "/bulk-import/assets", roles: ["ADMIN"] },
    ],
  },
  {
    label: "Audit Logs",
    href: "/audit-logs",
    icon: ShieldAlert,
    roles: ["ADMIN"],
  },
];

// 3. Settings & User Management - የ Admin ብቻ ክፍሎች
export const settingsNavItems: NavItem[] = [
  {
    label: "Users & Roles",
    href: "/users",
    icon: ShieldCheck,
    roles: ["ADMIN"],
    children: [
      { label: "Users", href: "/users", roles: ["ADMIN"] },
      { label: "Roles & Permissions", href: "/users/roles", roles: ["ADMIN"] },
    ],
  },
  {
    label: "System Settings",
    href: "/settings",
    icon: Settings,
    roles: ["ADMIN"],
    children: [
      { label: "General Settings", href: "/settings", roles: ["ADMIN"] },
      {
        label: "Financial Settings",
        href: "/settings/financial",
        roles: ["ADMIN"],
      },
      {
        label: "Notification Settings",
        href: "/settings/notifications",
        roles: ["ADMIN"],
      },
      {
        label: "Security Settings",
        href: "/settings/security",
        roles: ["ADMIN"],
      },
      { label: "Backup & Restore", href: "/settings/backup", roles: ["ADMIN"] },
    ],
  },
];
