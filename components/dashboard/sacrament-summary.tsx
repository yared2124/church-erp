import { Users, Cross, Church, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const CONFIG: { key: "Baptism" | "Marriage" | "Burial"; label: string; icon: LucideIcon; bg: string; color: string }[] = [
  { key: "Baptism", label: "Baptisms", icon: Users, bg: "bg-primary-light", color: "text-primary" },
  { key: "Marriage", label: "Marriages", icon: Cross, bg: "bg-danger-bg", color: "text-danger" },
  { key: "Burial", label: "Burials", icon: Church, bg: "bg-[#F3F0FF]", color: "text-[#7C3AED]" },
];

export function SacramentSummary({ counts }: { counts: { Baptism: number; Marriage: number; Burial: number } }) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Sacraments This Month</CardTitle>
        <a href="/sacraments/baptisms" className="text-[13px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover">
          View All
        </a>
      </CardHeader>
      <div className="grid grid-cols-3 gap-3">
        {CONFIG.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="text-center">
              <div className={`mx-auto mb-2.5 flex h-[52px] w-[52px] items-center justify-center rounded-full ${s.bg}`}>
                <Icon size={24} className={s.color} strokeWidth={1.8} />
              </div>
              <p className="text-[12.5px] text-text-secondary">{s.label}</p>
              <p className="text-[22px] font-bold text-text-primary">{counts[s.key]}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
