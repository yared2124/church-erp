"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { Users, UserCheck, UserX, UserPlus, Upload, Download, Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { MembersWorkspace } from "@/components/members/members-workspace";
import { MembersByGenderCard, MembersByAgeGroupCard } from "@/components/members/member-insights";
import { RecentMembersCard, MemberQuickActions } from "@/components/members/member-quick-actions";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { MemberStatsResponse } from "@/features/members/member.types";

import { useLanguage } from "@/lib/language-context";
import { PriestSacramentDialog } from "@/components/sacraments/priest-sacrament-dialog";

export default function MembersPage() {
  const { data: session } = useSession();
  const { locale, t } = useLanguage();
  const isAmharic = locale === "am";
  const userRoles = session?.user?.roles ?? [];
  const isAdmin = userRoles.includes("Super Admin");
  const isPriest = userRoles.includes("Priest") && !isAdmin;

  const [stats, setStats] = React.useState<MemberStatsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sacramentOpen, setSacramentOpen] = React.useState(false);

  const fetchStats = React.useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<{ data: MemberStatsResponse }>("/api/members/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof ApiClientError ? err.message : "Failed to load member statistics."))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: isPriest ? (isAmharic ? "የንስሃ ልጆች" : "Spiritual Children") : (isAmharic ? "አባላትና ቤተሰቦች" : "Members & Families"), href: "/members" },
          { label: isPriest ? (isAmharic ? "የንስሃ ልጆቼ" : "My Spiritual Children") : (isAmharic ? "የምዕመናን ዝርዝር" : "Members") },
        ]}
        title={isPriest ? (isAmharic ? "የንስሃ ልጆቼ ዝርዝር" : "My Spiritual Children") : (isAmharic ? "የምዕመናን ዝርዝር" : "Members")}
        description={
          isPriest
            ? (isAmharic ? "የንስሃ ልጆችዎን ይከታተሉ፣ የሰበካ ክፍያቸውን ያረጋግጡ፣ የቅዱሳት ምስጢራት ማመልከቻ ያቅርቡ" : "Oversee your spiritual children, track their Sebeka status, and request sacraments.")
            : (isAmharic ? "የቤተክርስቲያን አባላት መረጃ ማስተዳደሪያ" : "Manage church members and their information")
        }
        actions={
          <>
            {isPriest && (
              <Button
                onClick={() => setSacramentOpen(true)}
                icon={<Plus size={16} />}
                className="shadow-card"
              >
                {isAmharic ? "የምስጢራት ጥያቄ አቅርብ" : "Request Sacrament"}
              </Button>
            )}
            {isAdmin && (
              <>
                <Button variant="secondary" icon={<Upload size={16} />}>
                  {isAmharic ? "አባላትን አስገባ" : "Import Members"}
                </Button>
                <Button variant="secondary" icon={<Download size={16} />}>
                  {isAmharic ? "ወደ ውጭ ላክ" : "Export"}
                </Button>
                <Button icon={<Plus size={16} />} href="/members/new">
                  {isAmharic ? "አዲስ አባል መዝግብ" : "Add Member"}
                </Button>
              </>
            )}
          </>
        }
      />

      {error && (
        <div className="mb-5 rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">
          {error}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={isPriest ? (isAmharic ? "የንስሃ ልጆቼ ብዛት" : "Spiritual Children") : (isAmharic ? "ጠቅላላ ምዕመናን" : "Total Members")}
          value={loading ? "…" : (stats?.total ?? 0).toLocaleString()}
          icon={Users}
          iconBg="bg-primary-light"
          iconColor="text-primary"
        />
        <StatCard
          label={isPriest ? (isAmharic ? "የሰበካ ጉባኤ የከፈሉ" : "Sebeka Paid") : (isAmharic ? "ንቁ ምዕመናን" : "Active Members")}
          value={loading ? "…" : (isPriest ? (stats?.sebekaPaid ?? 0) : (stats?.active ?? 0)).toLocaleString()}
          icon={UserCheck}
          iconBg="bg-success-bg"
          iconColor="text-success"
        />
        <StatCard
          label={isPriest ? (isAmharic ? "የሰበካ ጉባኤ ያልከፈሉ" : "Sebeka Unpaid") : (isAmharic ? "ያልነቁ ምዕመናን" : "Inactive Members")}
          value={loading ? "…" : (isPriest ? (stats?.sebekaUnpaid ?? 0) : (stats?.inactive ?? 0)).toLocaleString()}
          icon={UserX}
          iconBg="bg-warning-bg"
          iconColor="text-warning"
        />
        <StatCard
          label={isAmharic ? "አዲስ በዚህ ወር" : "New This Month"}
          value={loading ? "…" : (stats?.newThisMonth ?? 0).toLocaleString()}
          icon={UserPlus}
          iconBg="bg-info-bg"
          iconColor="text-info"
        />
      </div>

      <div className="mb-5">
        <MembersWorkspace />
      </div>

      {!isPriest && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <MembersByGenderCard stats={stats} loading={loading} />
            <MembersByAgeGroupCard stats={stats} loading={loading} />
            <RecentMembersCard stats={stats} loading={loading} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <MemberQuickActions />
          </div>
        </>
      )}

      <PriestSacramentDialog
        open={sacramentOpen}
        onOpenChange={setSacramentOpen}
        onSuccess={fetchStats}
      />
    </PageContainer>
  );
}
