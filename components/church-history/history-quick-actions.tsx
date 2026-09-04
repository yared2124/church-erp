import { Flag, CalendarPlus, ImagePlus, FileUp, Mic, BarChart3, Download, Tags } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const ACTIONS = [
  { label: "Add Milestone", icon: Flag },
  { label: "Add Event", icon: CalendarPlus },
  { label: "Upload Photo", icon: ImagePlus },
  { label: "Upload Document", icon: FileUp },
  { label: "Record Interview", icon: Mic },
  { label: "Timeline Report", icon: BarChart3 },
  { label: "Export History", icon: Download },
  { label: "Manage Categories", icon: Tags },
];

export function ChurchHistoryQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} className="flex flex-col items-center gap-2 rounded-md border border-border px-3 py-3 text-center transition-colors duration-150 hover:bg-background-alt">
              <Icon size={18} className="text-primary" />
              <span className="text-[12px] font-medium text-text-primary">{a.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
