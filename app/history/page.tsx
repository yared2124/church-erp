import type { Metadata } from "next";
import { Calendar, Trophy, Flag, FileText } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ChurchTimelineCard } from "@/components/church-history/church-timeline";
import { MilestonesByCategoryCard, HistoricalDocumentsCard } from "@/components/church-history/history-panels";
import { ChurchHistoryQuickActions } from "@/components/church-history/history-quick-actions";
import { requireAuth } from "@/lib/api-helpers";
import { historyService } from "@/features/church-history/history.service";

export const metadata: Metadata = {
  title: "Church History — Birhane Genet St. Mary Church",
};

export default async function ChurchHistoryPage() {
  await requireAuth();
  const s = await historyService.overview();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Church History", href: "/history" },
          { label: "Timeline" },
        ]}
        title="Church History"
      />

      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Years of History" value={String(s.yearsOfHistory)} trend={s.oldestYear ? `Since ${s.oldestYear}` : undefined} icon={Calendar} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Major Milestones" value={String(s.majorMilestones)} icon={Trophy} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Historical Events" value={String(s.historicalEvents)} icon={Flag} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Documents" value={String(s.documents)} icon={FileText} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <ChurchTimelineCard timeline={s.timeline} />
        <MilestonesByCategoryCard data={s.milestonesByCategory} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HistoricalDocumentsCard documents={s.documentList as unknown as { id: string; title: string; uploadedAt: string }[]} />
        <ChurchHistoryQuickActions />
      </div>
    </PageContainer>
  );
}
