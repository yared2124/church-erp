import type { Metadata } from "next";
import { FileText, CheckCircle2, AlertTriangle, Users, Database, Download, SearchCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { AuditLogsWorkspace } from "@/components/audit-logs/audit-logs-workspace";
import { requireRole } from "@/lib/api-helpers";
import { auditLogService } from "@/features/audit-logs/audit-log.service";

export const metadata: Metadata = {
  title: "Audit Logs — Birhane Genet St. Mary Church",
};

export default async function AuditLogsPage() {
  await requireRole("Super Admin");
  const [s, filterOptions] = await Promise.all([auditLogService.stats(), auditLogService.filterOptions()]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Audit Logs" },
        ]}
        title="Audit Logs"
        description="Track all system activities and changes"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={16} />}>Export Logs</Button>
            <Button icon={<SearchCheck size={16} />}>Advanced Search</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Events" value={s.totalEvents.toLocaleString()} icon={FileText} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Successful Events" value={s.successfulEvents.toLocaleString()} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Failed Events" value={String(s.failedEvents)} icon={AlertTriangle} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Unique Users" value={String(s.uniqueUsers)} icon={Users} iconBg="bg-info-bg" iconColor="text-info" />
        <StatCard label="Entities Affected" value={String(s.entitiesAffected)} icon={Database} iconBg="bg-warning-bg" iconColor="text-warning" />
      </div>

      <AuditLogsWorkspace filterOptions={filterOptions} />
    </PageContainer>
  );
}
