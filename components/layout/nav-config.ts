import {
  LayoutDashboard,
  Users,
  Cross,
  Wallet,
  Building2,
  Boxes,
  UserCheck,
  UserCog,
  FileBadge2,
  BarChart3,
  History,
  UploadCloud,
  ShieldAlert,
  ShieldCheck,
  Settings,
  Flame,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  labelAmharic?: string;
  href: string;
  roles?: string[];
}

export interface NavItem {
  label: string;
  labelAmharic?: string;
  sublabel?: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
  children?: NavChild[];
}

export interface NavGroup {
  id: string;
  titleAmharic: string;
  titleEnglish: string;
  items: NavItem[];
}

/**
 * Canonical 6-Tier Hierarchical Navigation matching the Stitch EOTC Design System:
 * 1. ዋና አስተዳደር (GOVERNANCE)
 * 2. ምዕመናንና ቤተሰቦች (PASTORAL)
 * 3. ቅዱሳት ምሥጢራት (SACRAMENTS)
 * 4. ሰበካ ጉባኤና ፋይናንስ (FINANCE)
 * 5. ንብረትና አስተዳደር (PARISH ASSETS)
 * 6. ቁጥጥርና ሥርዓት (AUDIT)
 */
export const navigationGroups: NavGroup[] = [
  {
    id: "governance",
    titleAmharic: "ዋና አስተዳደር",
    titleEnglish: "GOVERNANCE",
    items: [
      {
        label: "Dashboard",
        labelAmharic: "ዳሽቦርድ",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["Super Admin", "Priest", "Cashier", "Sebeka Gubae", "Property Manager", "Registrar"],
      },
    ],
  },
  {
    id: "pastoral",
    titleAmharic: "ምዕመናንና ቤተሰቦች",
    titleEnglish: "PASTORAL",
    items: [
      {
        label: "Census & Members",
        labelAmharic: "የምዕመናን መዝገብ",
        href: "/members",
        icon: Users,
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Registrar"],
        children: [
          { label: "Members", labelAmharic: "ምዕመናን", href: "/members" },
          { label: "Families", labelAmharic: "አባወራና ቤተሰቦች", href: "/members/families" },
        ],
      },
      {
        label: "Confessors",
        labelAmharic: "የንስሐ አባቶች",
        href: "/members/confessors",
        icon: UserCheck,
        roles: ["Super Admin", "Priest", "Sebeka Gubae"],
      },
    ],
  },
  {
    id: "sacraments",
    titleAmharic: "ቅዱሳት ምሥጢራት",
    titleEnglish: "SACRAMENTS",
    items: [
      {
        label: "Baptism",
        labelAmharic: "ጥምቀት",
        sublabel: "Baptism",
        href: "/sacraments/baptisms",
        icon: Flame,
        roles: ["Super Admin", "Priest", "Registrar"],
      },
      {
        label: "Matrimony",
        labelAmharic: "ተክሊል / ጋብቻ",
        sublabel: "Matrimony",
        href: "/sacraments/matrimony",
        icon: Cross,
        roles: ["Super Admin", "Priest", "Registrar"],
      },
      {
        label: "Burial",
        labelAmharic: "ፍትሐት",
        sublabel: "Burial",
        href: "/sacraments/burials",
        icon: Cross,
        roles: ["Super Admin", "Priest", "Registrar"],
      },
    ],
  },
  {
    id: "finance",
    titleAmharic: "ሰበካ ጉባኤና ፋይናንስ",
    titleEnglish: "FINANCE",
    items: [
      {
        label: "Sebeka Dues",
        labelAmharic: "ዓመታዊ መዋጮ",
        sublabel: "Sebeka Dues",
        href: "/finance/sebeka-payments",
        icon: Wallet,
        roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
      },
      {
        label: "Ledger",
        labelAmharic: "ዋና የሂሳብ መዝገብ",
        sublabel: "Ledger",
        href: "/finance/transactions",
        icon: Wallet,
        roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
      },
      {
        label: "Cash Flow",
        labelAmharic: "ገቢና ወጪ",
        sublabel: "Cash Flow",
        href: "/finance/cash-flow",
        icon: Wallet,
        roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
      },
    ],
  },
  {
    id: "assets",
    titleAmharic: "ንብረትና አስተዳደር",
    titleEnglish: "PARISH ASSETS",
    items: [
      {
        label: "Parish Property",
        labelAmharic: "የቤተክርስቲያን ንብረት",
        href: "/inventory",
        icon: Boxes,
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "Leases",
        labelAmharic: "የኪራይ ቤቶች",
        sublabel: "Leases",
        href: "/property",
        icon: Building2,
        roles: ["Super Admin", "Sebeka Gubae", "Property Manager"],
      },
      {
        label: "Clergy",
        labelAmharic: "ካህናትና ሠራተኞች",
        sublabel: "Clergy",
        href: "/employees",
        icon: Users,
        roles: ["Super Admin", "Sebeka Gubae"],
      },
    ],
  },
  {
    id: "audit",
    titleAmharic: "ቁጥጥርና ሥርዓት",
    titleEnglish: "AUDIT",
    items: [
      {
        label: "Audit Logs",
        labelAmharic: "የኦዲት መዝገብ",
        sublabel: "Audit",
        href: "/audit-logs",
        icon: ShieldAlert,
        roles: ["Super Admin"],
      },
      {
        label: "Settings",
        labelAmharic: "ማስተካከያ",
        sublabel: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["Super Admin"],
      },
    ],
  },
];

// 1. Dashboard - ለሁሉም የተፈቀዱ Roles ይታያል
export const dashboardNavItem: NavItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
  roles: ["Super Admin", "Priest", "Cashier", "Sebeka Gubae", "Property Manager", "Registrar"],
};

// 2. Main Modules - በ Role የተገደቡ ዋና ዋና ክፍሎች (ለ RBAC ፈተናዎችና ተዛማጅ ክፍሎች)
export const mainModuleNavItems: NavItem[] = [
  {
    label: "Members & Families",
    href: "/members",
    icon: Users,
    roles: ["Super Admin", "Priest", "Sebeka Gubae", "Registrar"],
    children: [
      {
        label: "Members",
        href: "/members",
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Registrar"],
      },
      {
        label: "Families",
        href: "/members/families",
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Registrar"],
      },
      {
        label: "Family Payments",
        href: "/members/family-payments",
        roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
      },
    ],
  },
  {
    label: "Sacraments",
    href: "/sacraments",
    icon: Cross,
    roles: ["Super Admin", "Priest"],
    children: [
      {
        label: "Baptisms",
        href: "/sacraments/baptisms",
        roles: ["Super Admin", "Priest"],
      },
      {
        label: "Marriages",
        href: "/sacraments/marriages",
        roles: ["Super Admin", "Priest"],
      },
      {
        label: "Burials",
        href: "/sacraments/burials",
        roles: ["Super Admin", "Priest"],
      },
    ],
  },
  {
    label: "Financial Management",
    href: "/finance",
    icon: Wallet,
    roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
    children: [
      {
        label: "Overview",
        href: "/finance",
        roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
      },
      {
        label: "Transactions",
        href: "/finance/transactions",
        roles: ["Super Admin", "Cashier"],
      },
      {
        label: "Sebeka Payments",
        href: "/finance/sebeka-payments",
        roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
      },
      { label: "Income", href: "/finance/income", roles: ["Super Admin", "Cashier"] },
      {
        label: "Expenses",
        href: "/finance/expenses",
        roles: ["Super Admin", "Cashier"],
      },
      { label: "Categories", href: "/finance/categories", roles: ["Super Admin"] },
      {
        label: "Payment Methods",
        href: "/finance/payment-methods",
        roles: ["Super Admin"],
      },
      {
        label: "Reports",
        href: "/finance/reports",
        roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
      },
    ],
  },
  {
    label: "Property & Rentals",
    href: "/property",
    icon: Building2,
    roles: ["Super Admin", "Sebeka Gubae", "Property Manager"],
    children: [
      {
        label: "Overview",
        href: "/property",
        roles: ["Super Admin", "Sebeka Gubae", "Property Manager"],
      },
      {
        label: "Houses",
        href: "/property/houses",
        roles: ["Super Admin", "Sebeka Gubae", "Property Manager"],
      },
      {
        label: "Tenants",
        href: "/property/tenants",
        roles: ["Super Admin", "Sebeka Gubae", "Property Manager"],
      },
      {
        label: "Rent Payments",
        href: "/property/rent-payments",
        roles: ["Super Admin", "Cashier", "Sebeka Gubae", "Property Manager"],
      },
      {
        label: "Lease Agreements",
        href: "/property/lease-agreements",
        roles: ["Super Admin", "Sebeka Gubae", "Property Manager"],
      },
      {
        label: "Maintenance",
        href: "/property/maintenance",
        roles: ["Super Admin", "Sebeka Gubae", "Property Manager"],
      },
      {
        label: "Overdue Rentals",
        href: "/property/overdue-rentals",
        roles: ["Super Admin", "Cashier", "Sebeka Gubae", "Property Manager"],
      },
    ],
  },
  {
    label: "Assets & Inventory",
    href: "/inventory",
    icon: Boxes,
    roles: ["Super Admin", "Sebeka Gubae"],
    children: [
      {
        label: "Overview",
        href: "/inventory",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "Items",
        href: "/inventory/items",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      { label: "Categories", href: "/inventory/categories", roles: ["Super Admin"] },
      {
        label: "Suppliers",
        href: "/inventory/suppliers",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "Purchases",
        href: "/inventory/purchases",
        roles: ["Super Admin", "Cashier"],
      },
      {
        label: "Maintenance",
        href: "/inventory/maintenance",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "Stock Movements",
        href: "/inventory/stock-movements",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
    ],
  },
  {
    label: "Employees",
    href: "/employees",
    icon: UserCog,
    roles: ["Super Admin", "Sebeka Gubae"],
    children: [
      {
        label: "Overview",
        href: "/employees",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "All Employees",
        href: "/employees/all",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "Departments",
        href: "/employees/departments",
        roles: ["Super Admin"],
      },
      { label: "Positions", href: "/employees/positions", roles: ["Super Admin"] },
      {
        label: "Attendance",
        href: "/employees/attendance",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "Leaves",
        href: "/employees/leaves",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "Payroll",
        href: "/employees/payroll",
        roles: ["Super Admin", "Cashier"],
      },
    ],
  },
  {
    label: "Certificate Requests",
    href: "/certificates",
    icon: FileBadge2,
    roles: ["Super Admin", "Priest", "Registrar"],
    children: [
      {
        label: "Certificates",
        href: "/certificates",
        roles: ["Super Admin", "Priest", "Registrar"],
      },
    ],
  },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    roles: ["Super Admin", "Sebeka Gubae", "Cashier"],
    children: [
      {
        label: "Overview",
        href: "/reports",
        roles: ["Super Admin", "Sebeka Gubae", "Cashier"],
      },
      {
        label: "Financial Reports",
        href: "/reports/financial",
        roles: ["Super Admin", "Cashier", "Sebeka Gubae"],
      },
      {
        label: "Member Reports",
        href: "/reports/members",
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Registrar"],
      },
      {
        label: "Sacrament Reports",
        href: "/reports/sacraments",
        roles: ["Super Admin", "Priest"],
      },
      {
        label: "Property Reports",
        href: "/reports/property",
        roles: ["Super Admin", "Sebeka Gubae", "Property Manager"],
      },
      {
        label: "Inventory Reports",
        href: "/reports/inventory",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      {
        label: "Employee Reports",
        href: "/reports/employees",
        roles: ["Super Admin", "Sebeka Gubae"],
      },
      { label: "Custom Reports", href: "/reports/custom", roles: ["Super Admin"] },
    ],
  },
  {
    label: "Church History",
    href: "/history",
    icon: History,
    roles: ["Super Admin", "Priest", "Sebeka Gubae", "Cashier"],
    children: [
      {
        label: "Timeline",
        href: "/history",
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Cashier"],
      },
      {
        label: "Milestones",
        href: "/history/milestones",
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Cashier"],
      },
      {
        label: "Events",
        href: "/history/events",
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Cashier"],
      },
      {
        label: "Gallery",
        href: "/history/gallery",
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Cashier"],
      },
      {
        label: "Documents",
        href: "/history/documents",
        roles: ["Super Admin", "Priest", "Sebeka Gubae", "Cashier"],
      },
    ],
  },
  {
    label: "Bulk Import",
    href: "/bulk-import",
    icon: UploadCloud,
    roles: ["Super Admin", "Registrar"],
    children: [
      { label: "Overview", href: "/bulk-import", roles: ["Super Admin", "Registrar"] },
      {
        label: "Import Members",
        href: "/bulk-import/members",
        roles: ["Super Admin", "Registrar"],
      },
      {
        label: "Import Accounts",
        href: "/bulk-import/accounts",
        roles: ["Super Admin", "Registrar"],
      },
      {
        label: "Import Transactions",
        href: "/bulk-import/transactions",
        roles: ["Super Admin", "Registrar"],
      },
      {
        label: "Import Donations",
        href: "/bulk-import/donations",
        roles: ["Super Admin", "Registrar"],
      },
      { label: "Import Assets", href: "/bulk-import/assets", roles: ["Super Admin", "Registrar"] },
    ],
  },
  {
    label: "Audit Logs",
    href: "/audit-logs",
    icon: ShieldAlert,
    roles: ["Super Admin"],
  },
];

// 3. Settings & User Management - የ Admin ብቻ ክፍሎች
export const settingsNavItems: NavItem[] = [
  {
    label: "Users & Roles",
    href: "/users",
    icon: ShieldCheck,
    roles: ["Super Admin"],
    children: [
      { label: "Users", href: "/users", roles: ["Super Admin"] },
      { label: "Roles & Permissions", href: "/users/roles", roles: ["Super Admin"] },
    ],
  },
  {
    label: "System Settings",
    href: "/settings",
    icon: Settings,
    roles: ["Super Admin"],
    children: [
      { label: "General Settings", href: "/settings", roles: ["Super Admin"] },
      {
        label: "Financial Settings",
        href: "/settings/financial",
        roles: ["Super Admin"],
      },
      {
        label: "Notification Settings",
        href: "/settings/notifications",
        roles: ["Super Admin"],
      },
      {
        label: "Security Settings",
        href: "/settings/security",
        roles: ["Super Admin"],
      },
      { label: "Backup & Restore", href: "/settings/backup", roles: ["Super Admin"] },
    ],
  },
];

