import type { Metadata } from "next";
import { Trophy, Plus, Calendar, Award } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HistoryTabs } from "@/components/church-history/history-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Church Milestones — Birhane Genet St. Mary Church",
};

export default async function HistoryMilestonesPage() {
  await requireAuth();
  const milestones = await prisma.historyEntry.findMany({
    where: { type: "Milestone" },
    orderBy: { year: "desc" },
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Church History", href: "/history" },
          { label: "Milestones" },
        ]}
        title="Major Milestones"
        description="Historical achievements, consecrations, and significant milestones of Birhane Genet St. Mary Church."
        actions={
          <Button icon={<Plus size={16} />}>Record Milestone</Button>
        }
      />

      <HistoryTabs />

      {milestones.length === 0 ? (
        <Card className="py-12 text-center text-text-secondary">
          <Trophy size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium">No major milestones recorded yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {milestones.map((m) => (
            <Card key={m.id} className="flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[14px] font-bold text-primary">
                    <Calendar size={15} />
                    {m.year}
                  </span>
                  <Badge tone="success">Milestone</Badge>
                </div>
                <h3 className="mt-3 text-[15px] font-bold text-text-primary">{m.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">{m.description}</p>
              </div>
              <div className="mt-4 border-t border-border pt-3 text-[12px] text-text-muted">
                Recorded {new Date(m.createdAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
