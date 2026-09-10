import { Users, Cross, Church, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CONFIG: { key: "Baptism" | "Marriage" | "Burial"; label: string; icon: LucideIcon; bg: string; color: string }[] = [
  { key: "Baptism", label: "Baptisms", icon: Users, bg: "bg-primary-light", color: "text-primary" },
  { key: "Marriage", label: "Marriages", icon: Cross, bg: "bg-danger-bg", color: "text-danger" },
  { key: "Burial", label: "Burials", icon: Church, bg: "bg-[#F3F0FF]", color: "text-[#7C3AED]" },
];

export function SacramentSummary({ counts, className }: { counts: { Baptism: number; Marriage: number; Burial: number }; className?: string }) {
  return (
    <Card hoverable className={cn("lg:col-span-4", className)}>
      <CardHeader>
        <div>
          <CardTitle>Sacraments This Month</CardTitle>
          <p className="mt-0.5 text-[12px] text-text-muted">Registered spiritual rites</p>
        </div>
        <a
          href="/sacraments/baptisms"
          className="rounded-md px-2 py-1 text-[12.5px] font-semibold text-primary transition-colors duration-150 hover:bg-primary-light"
        >
          View All
        </a>
      </CardHeader>
      <div className="grid grid-cols-3 gap-2">
        {CONFIG.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="text-center">
              <div className={`mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                <Icon size={18} className={s.color} strokeWidth={1.8} />
              </div>
              <p className="text-[12px] text-text-secondary">{s.label}</p>
              <p className="text-[17px] font-semibold text-text-primary">{counts[s.key]}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
