import type { Metadata } from "next";
import { Filter, Download, Printer, FileBarChart2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReportTabs } from "@/components/reports/report-tabs";
import { requireAuth } from "@/lib/api-helpers";

export const metadata: Metadata = {
  title: "Custom Reports — Birhane Genet St. Mary Church",
};

export default async function CustomReportPage() {
  await requireAuth();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports & Analytics", href: "/reports" },
          { label: "Custom Reports" },
        ]}
        title="Custom Report Builder"
        description="Filter and export tailored analytics across financial, pastoral, and inventory data"
      />

      <ReportTabs />

      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10 text-gold shadow-sm mb-4">
            <FileBarChart2 size={28} />
          </div>
          <h3 className="text-[17px] font-semibold text-text-primary">Interactive Custom Query & Report Generator</h3>
          <p className="mt-1 max-w-md text-[13px] text-text-secondary">
            Select date ranges, department scopes, and data entities to generate consolidated analytical reports in PDF or Excel format.
          </p>
          <div className="mt-6 flex gap-3">
            <Button icon={<Download size={15} />}>Generate Consolidated Report</Button>
            <Button variant="secondary" icon={<Filter size={15} />}>Configure Filters</Button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
