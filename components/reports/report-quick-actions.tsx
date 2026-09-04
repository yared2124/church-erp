import { TrendingUp, Users, Home, Church, UserCog, FilePlus2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACTIONS = [
  { label: "Generate Financial Report", icon: TrendingUp },
  { label: "Generate Member Report", icon: Users },
  { label: "Generate Property Report", icon: Home },
  { label: "Generate Sacrament Report", icon: Church },
  { label: "Generate Employee Report", icon: UserCog },
  { label: "Create Custom Report", icon: FilePlus2 },
];

export function ReportQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} className="flex h-11 items-center gap-2.5 rounded-md border border-border px-3.5 text-left text-[13.5px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt">
              <Icon size={16} className="text-primary" />
              {a.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
