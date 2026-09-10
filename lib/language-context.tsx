"use client";

import * as React from "react";

export type Locale = "en" | "am";

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Top Nav / Header
    "nav.welcome": "Welcome back",
    "nav.search_placeholder": "Search members, transactions, reports...",
    "nav.search_shortcut": "Ctrl + K",
    "nav.calendar": "Calendar",
    "nav.messages": "Messages",
    "nav.notifications": "Notifications",
    "nav.language": "Language",
    "nav.sign_out": "Sign Out",
    "nav.no_notifications": "No notifications",
    "nav.no_notifications_desc": "You are all caught up! There are no unread notifications.",

    // Sidebar Sections & Items
    "sidebar.main_modules": "Main Modules",
    "sidebar.settings": "Settings",
    "sidebar.dashboard": "Dashboard",
    "sidebar.members": "Members & Families",
    "sidebar.members_list": "Members",
    "sidebar.families": "Families",
    "sidebar.family_payments": "Family Payments",
    "sidebar.sacraments": "Sacraments",
    "sidebar.baptisms": "Baptisms",
    "sidebar.marriages": "Marriages",
    "sidebar.burials": "Burials",
    "sidebar.finance": "Financial Management",
    "sidebar.income": "Income",
    "sidebar.expenses": "Expenses",
    "sidebar.transactions": "Transactions",
    "sidebar.sebeka_payments": "Sebeka Payments",
    "sidebar.finance_reports": "Financial Reports",
    "sidebar.certificates": "Certificates",
    "sidebar.property": "Property & Inventory",
    "sidebar.employees": "Clergy & Employees",
    "sidebar.history": "Church History",
    "sidebar.reports": "Reports & Analytics",
    "sidebar.audit_logs": "Audit Logs",
    "sidebar.users": "Users & Roles",
    "sidebar.system_settings": "System Settings",
    "sidebar.spiritual_children": "Spiritual Children",
    "sidebar.my_spiritual_children": "My Spiritual Children",
    "sidebar.sacrament_requests": "Sacrament Requests",
    "priest.total_children": "Total Spiritual Children",
    "priest.sebeka_paid": "Sebeka Paid",
    "priest.sebeka_unpaid": "Sebeka Unpaid",
    "priest.pending_requests": "Pending Requests",

    // Common Actions
    "action.add_member": "Add Member",
    "action.request_baptism": "Request Baptism",
    "action.request_marriage": "Request Matrimony",
    "action.report_burial": "Report Repose",
    "action.add_new_user": "Add New User",
    "action.import": "Import Members",
    "action.export": "Export",
    "action.cancel": "Cancel",
    "action.save": "Save",
    "action.delete": "Delete",
    "action.edit": "Edit",
    "action.view": "View",
    "action.confirm": "Confirm",
    "action.close": "Close",

    // Language names
    "lang.english": "English (US)",
    "lang.amharic": "አማርኛ (Amharic)",
  },
  am: {
    // Top Nav / Header
    "nav.welcome": "እንኳን ደህና መጡ",
    "nav.search_placeholder": "አባላትን፣ ሂሳቦችን፣ ሪፖርቶችን ፈልግ...",
    "nav.search_shortcut": "Ctrl + K",
    "nav.calendar": "ቀን መቁጠሪያ",
    "nav.messages": "መልእክቶች",
    "nav.notifications": "ማሳወቂያዎች",
    "nav.language": "ቋንቋ",
    "nav.sign_out": "ውጣ (Sign Out)",
    "nav.no_notifications": "ምንም ማሳወቂያ የለም",
    "nav.no_notifications_desc": "ሁሉም ማሳወቂያዎች ታይተዋል። አዲስ ያልተነበበ መልእክት የለም።",

    // Sidebar Sections & Items
    "sidebar.main_modules": "ዋና ክፍሎች",
    "sidebar.settings": "ማስተካከያዎች",
    "sidebar.dashboard": "ዋና ዳሽቦርድ",
    "sidebar.members": "አባላት እና ቤተሰቦች",
    "sidebar.members_list": "የአባላት ዝርዝር",
    "sidebar.families": "ቤተሰቦች",
    "sidebar.family_payments": "የቤተሰብ ክፍያዎች",
    "sidebar.sacraments": "ምስጢራተ ቤተክርስቲያን",
    "sidebar.baptisms": "ጥምቀት",
    "sidebar.marriages": "ተክሊል (ጋብቻ)",
    "sidebar.burials": "ፍትሐት (ቀብር)",
    "sidebar.finance": "የፋይናንስ አስተዳደር",
    "sidebar.income": "ገቢዎች",
    "sidebar.expenses": "ወጪዎች",
    "sidebar.transactions": "የሂሳብ እንቅስቃሴዎች",
    "sidebar.sebeka_payments": "የሰንበት/ሰበካ ክፍያዎች",
    "sidebar.finance_reports": "የፋይናንስ ሪፖርቶች",
    "sidebar.certificates": "የምስክር ወረቀቶች",
    "sidebar.property": "የንብረት አስተዳደር",
    "sidebar.employees": "ካህናትና ሠራተኞች",
    "sidebar.history": "የቤተክርስቲያን ታሪክ",
    "sidebar.reports": "ሪፖርቶችና ትንተናዎች",
    "sidebar.bulk_import": "በጅምላ መረጃ ማስገቢያ",
    "sidebar.audit_logs": "የስርዓት ቁጥጥር መዝገብ",
    "sidebar.users": "ተጠቃሚዎች እና ፈቃዶች",
    "sidebar.system_settings": "የስርዓት ማስተካከያ",
    "sidebar.spiritual_children": "የንስሃ ልጆች",
    "sidebar.my_spiritual_children": "የንስሃ ልጆቼ ዝርዝር",
    "sidebar.sacrament_requests": "የምስጢራት ማመልከቻዎች",
    "priest.total_children": "የንስሃ ልጆች ብዛት",
    "priest.sebeka_paid": "የሰበካ ጉባኤ የከፈሉ",
    "priest.sebeka_unpaid": "የሰበካ ጉባኤ ያልከፈሉ",
    "priest.pending_requests": "በሂደት ላይ ያሉ ማመልከቻዎች",

    // Common Actions
    "action.add_member": "አዲስ አባል መዝግብ",
    "action.request_baptism": "የክርስትና ጥያቄ አቅርብ",
    "action.request_marriage": "የተክሊል ጥያቄ አቅርብ",
    "action.report_burial": "የእረፍት/ፍትሐት ማሳወቂያ",
    "action.add_new_user": "አዲስ ተጠቃሚ ጨምር",
    "action.import": "አባላትን አስገባ",
    "action.export": "ወደ ውጭ ላክ",
    "action.cancel": "ይቅር",
    "action.save": "መዝግብ",
    "action.delete": "ሰርዝ",
    "action.edit": "አስተካክል",
    "action.view": "ተመልከት",
    "action.confirm": "አረጋግጥ",
    "action.close": "ዝጋ",

    // Language names
    "lang.english": "English (US)",
    "lang.amharic": "አማርኛ (Amharic)",
  },
};

const LanguageContext = React.createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (k: string) => k,
});

const STORAGE_KEY = "church_erp_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "en" || saved === "am") {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const t = React.useCallback(
    (key: string): string => {
      const dict = translations[locale];
      if (dict && dict[key]) {
        return dict[key];
      }
      return translations.en[key] ?? key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}
