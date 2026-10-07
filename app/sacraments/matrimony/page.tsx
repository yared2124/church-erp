import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { CanonicalVectorStudio } from "@/components/sacraments/canonical-vector-studio";
import { requireAuth } from "@/lib/api-helpers";

export const metadata: Metadata = {
  title: "የተክሊልና የፍትሐት ቀኖናዊ መዛግብት — Chagni Birhane Genet Kidist Ba'ata Lemariyam",
};

export default async function MatrimonyPage() {
  await requireAuth();
  return (
    <PageContainer>
      <CanonicalVectorStudio />
    </PageContainer>
  );
}
