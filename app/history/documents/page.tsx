import type { Metadata } from "next";
import { FileText, Download, Upload, Eye } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { HistoryTabs } from "@/components/church-history/history-tabs";
import { requireAuth } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Historical Documents — Birhane Genet St. Mary Church",
};

export default async function HistoryDocumentsPage() {
  await requireAuth();
  const documents = await prisma.historyDocument.findMany({
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Church History", href: "/history" },
          { label: "Documents" },
        ]}
        title="Historical Documents & Manuscripts"
        description="Official letters, charters, certificates, and historical documentation archive."
        actions={
          <Button icon={<Upload size={16} />}>Upload Document</Button>
        }
      />

      <HistoryTabs />

      <Card>
        {documents.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <FileText size={40} className="mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="font-medium">No historical documents archived yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Title</TableHead>
                <TableHead>Uploaded On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-text-primary">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary shrink-0" />
                      {d.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {new Date(d.uploadedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" icon={<Eye size={14} />}>View</Button>
                      <Button variant="ghost" size="sm" icon={<Download size={14} />}>Download</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </PageContainer>
  );
}
