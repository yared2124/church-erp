import type { Metadata } from "next";
import { Image as ImageIcon, Upload, Calendar, Camera } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HistoryTabs } from "@/components/church-history/history-tabs";
import { requireAuth } from "@/lib/api-helpers";

export const metadata: Metadata = {
  title: "Historical Gallery — Birhane Genet St. Mary Church",
};

export default async function HistoryGalleryPage() {
  await requireAuth();

  const galleryItems = [
    { id: "1", title: "Church Foundation Stone Laying", year: 1985, category: "Construction", count: 12 },
    { id: "2", title: "Holy Ark Consecration Ceremony", year: 1990, category: "Consecration", count: 24 },
    { id: "3", title: "Historic Timkat Celebrations", year: 2000, category: "Celebrations", count: 36 },
    { id: "4", title: "Patriarchal Visit & Blessing", year: 2012, category: "Patriarchal", count: 18 },
    { id: "5", title: "Youth Choir 25th Anniversary", year: 2018, category: "Choir", count: 15 },
    { id: "6", title: "New Sunday School Hall Opening", year: 2022, category: "Inauguration", count: 20 },
  ];

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Church History", href: "/history" },
          { label: "Gallery" },
        ]}
        title="Historical Photo Archives"
        description="Preserved photographs, archives, and visual records capturing the heritage of the church."
        actions={
          <Button icon={<Upload size={16} />}>Upload Photos</Button>
        }
      />

      <HistoryTabs />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <Card key={item.id} className="group overflow-hidden border border-border transition-all hover:shadow-md">
            <div className="flex h-44 items-center justify-center bg-muted/40 text-text-secondary transition-colors group-hover:bg-muted/60">
              <Camera size={36} className="text-muted-foreground opacity-60" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-[12px] text-text-secondary">
                <span className="font-semibold text-primary">{item.year}</span>
                <span>{item.count} photos</span>
              </div>
              <h3 className="mt-2 text-[14.5px] font-bold text-text-primary">{item.title}</h3>
              <p className="mt-1 text-[12px] text-text-secondary">Album • {item.category}</p>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
