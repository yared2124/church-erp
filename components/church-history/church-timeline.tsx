import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TimelineEntry {
  id: string;
  year: number;
  title: string;
  description: string;
  type: "Milestone" | "Event";
}

export function ChurchTimelineCard({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <Card className="xl:col-span-8">
      <CardHeader>
        <CardTitle>Church Timeline</CardTitle>
      </CardHeader>
      {timeline.length === 0 ? (
        <p className="py-12 text-center text-small text-text-secondary">No historical entries recorded yet.</p>
      ) : (
        <div className="relative pl-6">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
          <div className="flex flex-col gap-6">
            {timeline.map((t) => (
              <div key={t.id} className="relative">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-surface" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-bold text-primary">{t.year}</span>
                  <p className="text-[14px] font-semibold text-text-primary">{t.title}</p>
                  <Badge tone={t.type === "Milestone" ? "success" : "warning"}>{t.type}</Badge>
                </div>
                <p className="mt-1 text-[12.5px] text-text-secondary">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
