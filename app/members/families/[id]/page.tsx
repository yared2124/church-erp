import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, MapPin, Calendar, Users, Wallet2, Pencil } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { familyService } from "@/features/families/family.service";
import { requireAuth, ApiError } from "@/lib/api-helpers";
import { memberFullName } from "@/features/families/family.types";
import type { FamilyMemberSummary, ApiFamilyPayment, SebekaStatus } from "@/features/families/family.types";

const sebekaTone: Record<SebekaStatus, BadgeTone> = {
  Paid: "success",
  Partial: "warning",
  Unpaid: "neutral",
  Overdue: "danger",
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string | Date | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

async function loadFamily(id: string) {
  try {
    return await familyService.getById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const family = await loadFamily(id);
  return { title: family ? `${family.name} — Families` : "Family Not Found" };
}

export default async function FamilyProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const family = await loadFamily(id);
  if (!family) notFound();

  const head = family.members.find((m: FamilyMemberSummary) => m.roleInFamily === "Head") ?? family.members[0] ?? null;

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Members & Families", href: "/members" },
          { label: "Families", href: "/members/families" },
          { label: family.name },
        ]}
        title={family.name}
        description={`${family.id.slice(0, 8)} · ${family.members.length} members`}
        actions={<Button icon={<Pencil size={16} />}>Edit Family</Button>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-[22px] font-bold text-primary">
              {initials(family.name)}
            </div>
            <p className="mt-3 text-[17px] font-bold text-text-primary">{family.name}</p>
            <div className="mt-1.5">
              <Badge tone={sebekaTone[family.sebekaStatus as SebekaStatus]}>{family.sebekaStatus}</Badge>
            </div>
            <p className="mt-1 text-[12.5px] text-text-secondary">
              Head: {head ? memberFullName(head) : "—"}
            </p>
          </div>

          <div className="mt-5 divide-y divide-border-light border-t border-border-light">
            <InfoRow icon={Users} label="Head of Family" value={head ? memberFullName(head) : "—"} />
            <InfoRow icon={Phone} label="Phone" value={family.phone ?? "—"} />
            <InfoRow icon={MapPin} label="Address" value={family.address ?? "—"} />
            <InfoRow icon={Calendar} label="Registration Date" value={formatDate(family.registrationDate)} />
          </div>
        </Card>

        <div className="flex flex-col gap-4 xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            {family.members.length === 0 ? (
              <p className="py-6 text-center text-small text-text-secondary">No members recorded yet.</p>
            ) : (
              <div className="divide-y divide-border-light">
                {family.members.map((m: FamilyMemberSummary) => (
                  <div key={m.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-[12px] font-bold text-primary">
                      {initials(memberFullName(m))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-text-primary">{memberFullName(m)}</p>
                      <p className="text-[12px] text-text-secondary">{m.roleInFamily}</p>
                    </div>
                    <Badge tone={m.status === "Active" ? "success" : "neutral"}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            {family.familyPayments.length === 0 ? (
              <p className="py-6 text-center text-small text-text-secondary">No payment records yet.</p>
            ) : (
              <div className="divide-y divide-border-light">
                {family.familyPayments.map((p: ApiFamilyPayment) => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[13.5px] font-medium text-text-primary">{p.year} Sebeka Payment</p>
                      <p className="text-[12px] text-text-muted">{p.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13.5px] font-semibold text-text-primary">
                        {Number(p.paidAmount).toLocaleString()} / {Number(p.expectedAmount).toLocaleString()} ETB
                      </p>
                      <Badge tone={sebekaTone[p.status as SebekaStatus]}>{p.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sacraments</CardTitle>
            </CardHeader>
            <p className="py-6 text-center text-small text-text-secondary">
              Sacrament records for members of this family will appear here once the Sacraments
              module is connected to the database.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-text-muted" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-text-muted">{label}</p>
        <p className="break-words text-[13.5px] font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}
