import type { Metadata } from "next";
import { FileText, Clock, CheckCircle2, XCircle, BadgeCheck, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { CertificatesWorkspace } from "@/components/certificates/certificates-workspace";
import { requireAuth } from "@/lib/api-helpers";
import { certificateService } from "@/features/certificates/certificate.service";

export const metadata: Metadata = {
  title: "Certificate Requests — Birhane Genet St. Mary Church",
};

export default async function CertificatesPage() {
  await requireAuth();
  const s = await certificateService.stats();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Certificate Requests" },
        ]}
        title="Certificates"
        description="Manage certificate requests and issued certificates"
        actions={<Button icon={<Plus size={16} />}>New Certificate Request</Button>}
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Requests" value={String(s.total)} icon={FileText} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Pending" value={String(s.pending)} icon={Clock} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Approved" value={String(s.approved)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Rejected" value={String(s.rejected)} icon={XCircle} iconBg="bg-danger-bg" iconColor="text-danger" />
        <StatCard label="Issued Certificates" value={String(s.issued)} icon={BadgeCheck} iconBg="bg-info-bg" iconColor="text-info" />
      </div>

      <CertificatesWorkspace />
    </PageContainer>
  );
}
