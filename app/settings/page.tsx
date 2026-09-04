import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import {
  ChurchInformationCard,
  SystemPreferencesCard,
  OrganizationSettingsCard,
  DocumentSettingsCard,
  EmailSettingsCard,
  SessionSettingsCard,
} from "@/components/settings/general-settings-cards";
import { SystemInformationCard, SettingsActivityLogCard, SettingsQuickActions } from "@/components/settings/settings-side-panels";
import { requireRole } from "@/lib/api-helpers";
import { settingsService } from "@/features/settings/settings.service";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "System Settings — Birhane Genet St. Mary Church",
};

export default async function SystemSettingsPage() {
  await requireRole("Super Admin");

  const [churchInfo, activeUsers, recentAuditLogs] = await Promise.all([
    settingsService.getChurchInformation(),
    prisma.user.count({ where: { status: "Active" } }),
    prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const activityEntries = recentAuditLogs.map((log: { id: string; action: string; user: { name: string }; createdAt: Date }) => ({
    id: log.id,
    action: log.action,
    user: { name: log.user.name },
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "System Settings" },
        ]}
        title="System Settings"
        description="Configure and manage system preferences and configurations"
      />

      <SettingsTabs />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="flex flex-col gap-4 xl:col-span-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ChurchInformationCard info={churchInfo} />
            <SystemPreferencesCard />
            <OrganizationSettingsCard />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DocumentSettingsCard />
            <EmailSettingsCard />
            <SessionSettingsCard />
          </div>
        </div>

        <div className="flex flex-col gap-4 xl:col-span-4">
          <SystemInformationCard activeUsers={activeUsers} />
          <SettingsActivityLogCard entries={activityEntries} />
          <SettingsQuickActions />
        </div>
      </div>
    </PageContainer>
  );
}
