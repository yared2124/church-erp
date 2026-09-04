"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mail, MapPin, Cake, Users, Droplet, BadgeCheck, Pencil } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import { memberFullName, type ApiMember } from "@/features/members/member.types";

const statusTone: Record<ApiMember["status"], BadgeTone> = {
  Active: "success",
  Inactive: "neutral",
  Transferred: "info",
  Deceased: "neutral",
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function MemberProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [member, setMember] = React.useState<ApiMember | null>(null);
  const [familyMembers, setFamilyMembers] = React.useState<ApiMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await apiFetch<{ data: ApiMember }>(`/api/members/${params.id}`);
      setMember(res.data);
      const siblings = await apiFetch<Paginated<ApiMember>>(`/api/members?familyId=${res.data.familyId}&limit=50`);
      setFamilyMembers(siblings.data.filter((m) => m.id !== res.data.id));
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) setNotFound(true);
      else setError(err instanceof ApiClientError ? err.message : "Failed to load member.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const breadcrumbBase = [
    { label: "Home", href: "/dashboard" },
    { label: "Members & Families", href: "/members" },
    { label: "Members", href: "/members" },
  ];

  if (loading) {
    return (
      <PageContainer>
        <PageHeader breadcrumb={breadcrumbBase} title="Loading…" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <Skeleton className="h-96 xl:col-span-4" />
          <Skeleton className="h-96 xl:col-span-8" />
        </div>
      </PageContainer>
    );
  }

  if (notFound) {
    return (
      <PageContainer>
        <PageHeader breadcrumb={[...breadcrumbBase, { label: "Not Found" }]} title="Member Not Found" />
        <EmptyState title="Member not found" description="This member record may have been removed." actionLabel="Back to Members" onAction={() => router.push("/members")} />
      </PageContainer>
    );
  }

  if (error || !member) {
    return (
      <PageContainer>
        <PageHeader breadcrumb={breadcrumbBase} title="Member" />
        <ErrorState description={error ?? "Something went wrong."} onRetry={fetchAll} />
      </PageContainer>
    );
  }

  const fullName = memberFullName(member);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[...breadcrumbBase, { label: fullName }]}
        title={fullName}
        description={`${member.family.name}`}
        actions={<Button icon={<Pencil size={16} />} href={`/members/${member.id}/edit`}>Edit Member</Button>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-[22px] font-bold text-primary">
              {initials(fullName)}
            </div>
            <p className="mt-3 text-[17px] font-bold text-text-primary">{fullName}</p>
            <div className="mt-1.5">
              <Badge tone={statusTone[member.status]}>{member.status}</Badge>
            </div>
            <p className="mt-1 text-[12.5px] text-text-secondary">{member.roleInFamily} · {member.family.name}</p>
          </div>

          <div className="mt-5 divide-y divide-border-light border-t border-border-light">
            <InfoRow icon={Cake} label="Date of Birth" value={formatDate(member.dateOfBirth)} />
            <InfoRow icon={Phone} label="Phone" value={member.phone ?? "—"} />
            <InfoRow icon={Mail} label="Email" value={member.email ?? "—"} />
            <InfoRow icon={MapPin} label="Address" value={member.address ?? "—"} />
            {member.baptizedDate && <InfoRow icon={Droplet} label="Baptized Date" value={formatDate(member.baptizedDate)} />}
            <InfoRow icon={BadgeCheck} label="Membership Date" value={formatDate(member.membershipDate)} />
          </div>
        </Card>

        <div className="flex flex-col gap-4 xl:col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
            </CardHeader>
            {familyMembers.length === 0 ? (
              <p className="py-6 text-center text-small text-text-secondary">No other family members on record.</p>
            ) : (
              <div className="divide-y divide-border-light">
                {familyMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-[12px] font-bold text-primary">
                      {initials(memberFullName(m))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-text-primary">{memberFullName(m)}</p>
                      <p className="text-[12px] text-text-secondary">{m.roleInFamily}</p>
                    </div>
                    <Badge tone={statusTone[m.status]}>{m.status}</Badge>
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
              Sacrament records will appear here once the Sacraments module is connected to the database (Phase 4).
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <p className="py-6 text-center text-small text-text-secondary">
              Sebeka Gubae payments belong to this member&apos;s family — see the Families module.
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
