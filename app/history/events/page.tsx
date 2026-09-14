import type { Metadata } from "next";
import { Flag, Plus, Calendar } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HistoryTabs } from "@/components/church-history/history-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Historical Events — Birhane Genet St. Mary Church",
};

export default async function HistoryEventsPage() {
  await requireAuth();
  const events = await prisma.historyEntry.findMany({
    where: { type: "Event" },
    orderBy: { year: "desc" },
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Church History", href: "/history" },
          { label: "Events" },
        ]}
        title="Historical Events"
        description="Chronological record of annual celebrations, feasts, visits, and memorable gatherings."
        actions={
          <Button icon={<Plus size={16} />}>Record Event</Button>
        }
      />

      <HistoryTabs />

      {events.length === 0 ? (
        <Card className="py-12 text-center text-text-secondary">
          <Flag size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium">No historical events recorded yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <Card key={e.id} className="flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[14px] font-bold text-amber-600">
                    <Calendar size={15} />
                    {e.year}
                  </span>
                  <Badge tone="warning">Event</Badge>
                </div>
                <h3 className="mt-3 text-[15px] font-bold text-text-primary">{e.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{e.description}</p>
              </div>
              <div className="mt-4 border-t border-border pt-3 text-[12px] text-text-muted">
                Recorded {new Date(e.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
