"use client";

import * as React from "react";
import { Home, Monitor, Users, FileText, Mail, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Switch } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ChurchInformation } from "@/features/settings/settings.service";

// These five settings groups don't have write-back API routes wired yet
// (only Church Information reads from the real SystemSetting table so
// far) — these are sensible application defaults, not fabricated
// business data, shown until each group gets its own settings endpoint.
const systemPreferences = {
  defaultLanguage: "English",
  numberFormat: "1,234.56",
  currency: "ETB - Ethiopian Birr",
  itemsPerPage: "10",
  maintenanceMode: false,
  allowNewRegistrations: true,
  requireEmailVerification: true,
  enableAuditLogging: true,
  enableTwoFactorAuth: false,
};

const organizationSettings = {
  defaultPriestAssignment: "By Family",
  memberIdPrefix: "MEM",
  familyIdPrefix: "FAM",
  transactionIdPrefix: "TRX",
  certificateIdPrefix: "CER",
  financialYearStart: "January",
  autoAssignMemberIds: true,
  allowFamilyHeadChanges: true,
};

const documentSettings = {
  storageProvider: "Local Storage",
  maxFileSize: "10 MB",
  allowedFileTypes: "jpg, jpeg, png, pdf, doc, docx, xls, xlsx",
  compressUploadedFiles: true,
  watermarkCertificates: true,
};

const emailSettings = {
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
  username: "noreply@bgsmmchurch.et",
  fromEmail: "noreply@bgsmmchurch.et",
  fromName: "Birhane Genet St. Mary Church",
  testEmail: "admin@bgsmmchurch.et",
};

const sessionSettings = {
  sessionTimeout: "30 minutes",
  maxLoginAttempts: "5 attempts",
  lockoutDuration: "30 minutes",
  rememberMeDuration: "7 days",
  forceLogoutOnPasswordChange: true,
  notifyOnNewLogin: true,
};

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <Icon size={18} className="text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-4">{children}</div>
      <Button size="sm" className="mt-4">Save Changes</Button>
    </Card>
  );
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[13.5px] font-medium text-text-primary">{label}</p>
        {description && <p className="text-[12px] text-text-secondary">{description}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

export function ChurchInformationCard({ info }: { info: ChurchInformation }) {
  const c = info;
  return (
    <SettingsCard icon={Home} title="Church Information">
      <Input label="Church Name" defaultValue={c.churchName} />
      <Input label="Church Short Name" defaultValue={c.shortName} />
      <Input label="Address" defaultValue={c.address} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Phone" defaultValue={c.phone} />
        <Input label="Email" defaultValue={c.email} />
      </div>
      <Input label="Website" defaultValue={c.website} />
    </SettingsCard>
  );
}

export function SystemPreferencesCard() {
  const s = systemPreferences;
  const [maintenance, setMaintenance] = React.useState(s.maintenanceMode);
  const [registrations, setRegistrations] = React.useState(s.allowNewRegistrations);
  const [emailVerification, setEmailVerification] = React.useState(s.requireEmailVerification);
  const [auditLogging, setAuditLogging] = React.useState(s.enableAuditLogging);
  const [twoFactor, setTwoFactor] = React.useState(s.enableTwoFactorAuth);

  return (
    <SettingsCard icon={Monitor} title="System Preferences">
      <Select label="Default Language" defaultValue={s.defaultLanguage} options={[{ value: "English", label: "English" }, { value: "Amharic", label: "Amharic" }]} />
      <Select label="Number Format" defaultValue={s.numberFormat} options={[{ value: s.numberFormat, label: s.numberFormat }]} />
      <Select label="Currency" defaultValue={s.currency} options={[{ value: s.currency, label: s.currency }]} />
      <Select label="Items Per Page" defaultValue={s.itemsPerPage} options={["10", "25", "50"].map((v) => ({ value: v, label: v }))} />
      <ToggleRow label="Enable Maintenance Mode" description="Temporarily disable system for maintenance" checked={maintenance} onChange={setMaintenance} />
      <ToggleRow label="Allow New Registrations" description="Allow new member registrations" checked={registrations} onChange={setRegistrations} />
      <ToggleRow label="Require Email Verification" description="Require email verification for new users" checked={emailVerification} onChange={setEmailVerification} />
      <ToggleRow label="Enable Audit Logging" description="Log all system activities" checked={auditLogging} onChange={setAuditLogging} />
      <ToggleRow label="Enable Two-Factor Authentication" description="Require 2FA for admin users" checked={twoFactor} onChange={setTwoFactor} />
    </SettingsCard>
  );
}

export function OrganizationSettingsCard() {
  const o = organizationSettings;
  const [autoAssign, setAutoAssign] = React.useState(o.autoAssignMemberIds);
  const [headChanges, setHeadChanges] = React.useState(o.allowFamilyHeadChanges);

  return (
    <SettingsCard icon={Users} title="Organization Settings">
      <Select label="Default Priest Assignment" defaultValue={o.defaultPriestAssignment} options={[{ value: "By Family", label: "By Family" }, { value: "By Region", label: "By Region" }]} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Member ID Prefix" defaultValue={o.memberIdPrefix} />
        <Input label="Family ID Prefix" defaultValue={o.familyIdPrefix} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Transaction ID Prefix" defaultValue={o.transactionIdPrefix} />
        <Input label="Certificate ID Prefix" defaultValue={o.certificateIdPrefix} />
      </div>
      <Select label="Financial Year Start" defaultValue={o.financialYearStart} options={["January", "July"].map((v) => ({ value: v, label: v }))} />
      <ToggleRow label="Auto-assign Member IDs" description="Automatically generate member IDs" checked={autoAssign} onChange={setAutoAssign} />
      <ToggleRow label="Allow Family Head Changes" description="Allow changing family head" checked={headChanges} onChange={setHeadChanges} />
    </SettingsCard>
  );
}

export function DocumentSettingsCard() {
  const d = documentSettings;
  const [compress, setCompress] = React.useState(d.compressUploadedFiles);
  const [watermark, setWatermark] = React.useState(d.watermarkCertificates);

  return (
    <SettingsCard icon={FileText} title="Document Settings">
      <Select label="Storage Provider" defaultValue={d.storageProvider} options={[{ value: "Local Storage", label: "Local Storage" }, { value: "Cloud Storage", label: "Cloud Storage" }]} />
      <Select label="Max File Size" defaultValue={d.maxFileSize} options={["5 MB", "10 MB", "25 MB"].map((v) => ({ value: v, label: v }))} />
      <Input label="Allowed File Types" defaultValue={d.allowedFileTypes} />
      <ToggleRow label="Compress Uploaded Files" description="Automatically compress uploaded files" checked={compress} onChange={setCompress} />
      <ToggleRow label="Watermark Certificates" description="Add watermark to generated certificates" checked={watermark} onChange={setWatermark} />
    </SettingsCard>
  );
}

export function EmailSettingsCard() {
  const e = emailSettings;
  return (
    <SettingsCard icon={Mail} title="Email Settings">
      <div className="grid grid-cols-2 gap-3">
        <Input label="SMTP Host" defaultValue={e.smtpHost} />
        <Input label="SMTP Port" defaultValue={e.smtpPort} />
      </div>
      <Input label="Username" defaultValue={e.username} />
      <Input label="Password" type="password" defaultValue="••••••••" />
      <Input label="From Email" defaultValue={e.fromEmail} />
      <Input label="From Name" defaultValue={e.fromName} />
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input label="Test Email" defaultValue={e.testEmail} />
        </div>
        <Button type="button" variant="secondary" size="md">Send Test</Button>
      </div>
    </SettingsCard>
  );
}

export function SessionSettingsCard() {
  const s = sessionSettings;
  const [forceLogout, setForceLogout] = React.useState(s.forceLogoutOnPasswordChange);
  const [notifyLogin, setNotifyLogin] = React.useState(s.notifyOnNewLogin);

  return (
    <SettingsCard icon={Lock} title="Session Settings">
      <Select label="Session Timeout" defaultValue={s.sessionTimeout} options={["15 minutes", "30 minutes", "60 minutes"].map((v) => ({ value: v, label: v }))} />
      <Select label="Maximum Login Attempts" defaultValue={s.maxLoginAttempts} options={["3 attempts", "5 attempts", "10 attempts"].map((v) => ({ value: v, label: v }))} />
      <Select label="Lockout Duration" defaultValue={s.lockoutDuration} options={["15 minutes", "30 minutes", "60 minutes"].map((v) => ({ value: v, label: v }))} />
      <Select label="Remember Me Duration" defaultValue={s.rememberMeDuration} options={["7 days", "14 days", "30 days"].map((v) => ({ value: v, label: v }))} />
      <ToggleRow label="Force Logout on Password Change" description="Log out user on password change" checked={forceLogout} onChange={setForceLogout} />
      <ToggleRow label="Notify on New Login" description="Send email on new login" checked={notifyLogin} onChange={setNotifyLogin} />
    </SettingsCard>
  );
}
