import { UserPlus, ClipboardCheck, CalendarPlus, Wallet2, FileBarChart2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACTIONS = [
  { label: "Add New Employee", icon: UserPlus },
  { label: "Record Attendance", icon: ClipboardCheck },
  { label: "Request Leave for Employee", icon: CalendarPlus },
  { label: "Manage Payroll", icon: Wallet2 },
  { label: "Generate Employee Report", icon: FileBarChart2 },
];

export function EmployeeQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              className="flex h-11 items-center gap-2.5 rounded-md border border-border px-3.5 text-left text-[13.5px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt"
            >
              <Icon size={16} className="text-primary" />
              {a.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
