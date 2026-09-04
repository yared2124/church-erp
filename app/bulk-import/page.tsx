import type { Metadata } from "next";
import { Upload, CheckCircle2, AlertTriangle, Clock, FileStack, History, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { requireAuth } from "@/lib/api-helpers";
import { importJobService } from "@/features/bulk-import/import-job.service";

export const metadata: Metadata = {
  title: "Bulk Import — Birhane Genet St. Mary Church",
};

function formatDateTime(iso: Date | string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function BulkImportPage() {
  await requireAuth();
  const s = await importJobService.stats();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Bulk Import" },
        ]}
        title="Bulk Import"
        actions={
          <>
            <Button variant="secondary" icon={<History size={16} />}>Import History</Button>
            <Button icon={<Plus size={16} />}>New Bulk Import</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Imports" value={String(s.totalImports)} icon={Upload} iconBg="bg-primary-light" iconColor="text-primary" />
        <StatCard label="Successful Imports" value={String(s.successfulImports)} icon={CheckCircle2} iconBg="bg-success-bg" iconColor="text-success" />
        <StatCard label="Failed Imports" value={String(s.failedImports)} icon={AlertTriangle} iconBg="bg-warning-bg" iconColor="text-warning" />
        <StatCard label="Last Import" value={s.lastImport ? formatDateTime(s.lastImport.createdAt) : "—"} trend={s.lastImport ? `By ${s.lastImport.createdBy.name}` : undefined} icon={Clock} iconBg="bg-info-bg" iconColor="text-info" />
        <StatCard label="Total Records Imported" value={s.totalRecordsImported.toLocaleString()} icon={FileStack} iconBg="bg-primary-light" iconColor="text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Upload File</CardTitle>
        </CardHeader>
        <p className="-mt-2 mb-4 text-small text-text-secondary">Upload your CSV or Excel file to import data in bulk.</p>
        <FileDropzone />
      </Card>

      <p className="mt-5 text-small text-text-secondary">
        File parsing, column mapping, validation, and the actual database import are not wired up
        yet — the stats above are real (backed by the <code className="mx-1 rounded bg-background-alt px-1.5 py-0.5">ImportJob</code>
        table, currently {s.totalImports === 0 ? "empty on a fresh install" : "reflecting real import history"}), but choosing
        a file here doesn&apos;t process it yet. That&apos;s a genuinely separate, larger feature
        (CSV/Excel parsing, per-row validation, duplicate handling) than what this pass covered.
      </p>
    </PageContainer>
  );
}
