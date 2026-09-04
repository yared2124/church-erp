import { Database, Server, Users, ExternalLink, Settings, DatabaseBackup, HardDriveDownload, AlertCircle, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

// Static software metadata — legitimate constants, not fabricated
// business data. Live infra metrics (uptime, active sessions) would need
// real monitoring wired up, which is out of scope for this pass.
const systemInformation = {
  version: "v2.1.0",
  environment: process.env.NODE_ENV === "production" ? "Production" : "Development",
  database: "PostgreSQL",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function SystemInformationCard({ activeUsers }: { activeUsers: number }) {
  const s = systemInformation;
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Information</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2.5 text-[13px]">
        <Row icon={Server} label="System Version" value={s.version} />
        <Row icon={Zap} label="Environment" value={s.environment} />
        <Row icon={Database} label="Database" value={s.database} />
        <Row icon={Users} label="Active Users" value={`${activeUsers} total`} />
      </div>
      <button className="mt-4 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover">
        View System Health <ExternalLink size={13} />
      </button>
    </Card>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-text-muted" />
      <div>
        <p className="text-[11.5px] text-text-muted">{label}</p>
        <p className="font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}

interface ActivityLogItem {
  id: string;
  action: string;
  user: { name: string };
  createdAt: string;
}

export function SettingsActivityLogCard({ entries }: { entries: ActivityLogItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <a href="/audit-logs" className="text-[13px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover">View All</a>
      </CardHeader>
      {entries.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">No recent activity yet.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {entries.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-light">
                <Settings size={15} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-text-primary">{a.action}</p>
                <p className="text-[11.5px] text-text-secondary">{a.user.name}</p>
              </div>
              <span className="shrink-0 text-[11.5px] text-text-muted">{formatDateTime(a.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const QUICK_ACTIONS = [
  { label: "Clear System Cache", icon: AlertCircle },
  { label: "Optimize Database", icon: Zap },
  { label: "Generate Backup", icon: HardDriveDownload },
  { label: "View Error Logs", icon: AlertCircle },
];

export function SettingsQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} className="flex h-10 items-center gap-2.5 rounded-md border border-border px-3 text-left text-[13px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt">
              <Icon size={15} className="text-primary" />
              {a.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
