import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Notification Settings — Birhane Genet St. Mary Church" };

export default function NotificationSettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/dashboard" }, { label: "System Settings", href: "/settings" }, { label: "Notification Settings" }]}
        title="System Settings"
        description="Configure and manage system preferences and configurations"
      />
      <SettingsTabs />
      <Card className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
          <Bell size={24} className="text-primary" />
        </div>
        <p className="text-card-title text-text-primary">Notification Settings</p>
        <p className="max-w-sm text-small text-text-secondary">
          No design was provided for this tab yet — SMS/email notification triggers and templates
          would live here. Let me know if you&apos;d like this built out next.
        </p>
      </Card>
    </PageContainer>
  );
}
