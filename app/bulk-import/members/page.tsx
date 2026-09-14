import type { Metadata } from "next";
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { BulkImportTabs } from "@/components/bulk-import/bulk-import-tabs";
import { requireAuth } from "@/lib/api-helpers";

export const metadata: Metadata = {
  title: "Bulk Import Members — Birhane Genet St. Mary Church",
};

export default async function BulkImportMembersPage() {
  await requireAuth();

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Bulk Import", href: "/bulk-import" },
          { label: "Members" },
        ]}
        title="Bulk Import Members"
        description="Upload and batch import parish member records into the church directory."
        actions={
          <Button variant="secondary" icon={<Download size={16} />}>Download CSV Template</Button>
        }
      />

      <BulkImportTabs />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="p-6">
            <h3 className="mb-2 text-[15px] font-bold text-text-primary">1. Upload CSV / Excel File</h3>
            <p className="mb-4 text-small text-text-secondary">
              Select or drop your spreadsheet containing formatted members records.
            </p>
            <FileDropzone />
          </Card>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-4">
          <Card className="p-5">
            <h4 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-text-primary">
              <FileSpreadsheet size={16} className="text-primary" />
              Template Headers
            </h4>
            <p className="mb-3 text-[12.5px] text-text-secondary">
              Ensure your file headers match the following format exactly:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["fullName","christianName","phone","gender","birthDate","confessionFather","address"].map((h) => (
                <code key={h} className="rounded bg-background-alt px-2 py-1 text-[11.5px] font-mono text-primary font-medium">
                  {h}
                </code>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-text-primary">
              <CheckCircle2 size={16} className="text-success" />
              Guidelines
            </h4>
            <ul className="space-y-2 text-[12.5px] text-text-secondary">
              <li>• UTF-8 encoded CSV or Excel (.xlsx) formats supported.</li>
              <li>• Ensure required identification fields are non-empty.</li>
              <li>• Duplicate records with existing phone numbers or IDs will be skipped or updated.</li>
            </ul>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
