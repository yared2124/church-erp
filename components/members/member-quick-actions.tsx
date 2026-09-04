import { UserPlus, Upload, Users2, FileBarChart2, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { memberFullName, type MemberStatsResponse } from "@/features/members/member.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function RecentMembersCard({ stats, loading }: { stats: MemberStatsResponse | null; loading: boolean }) {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Recent Members</CardTitle>
        <button className="text-[13px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover">
          View All
        </button>
      </CardHeader>
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : !stats || stats.recent.length === 0 ? (
        <p className="py-6 text-center text-small text-text-secondary">No members registered yet.</p>
      ) : (
        <div className="flex flex-col">
          {stats.recent.map((m, i) => (
            <div
              key={m.id}
              className={`flex items-center gap-3 py-2.5 ${i < stats.recent.length - 1 ? "border-b border-border-light" : ""}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-light">
                <Users size={18} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-text-primary">{memberFullName(m)}</p>
                <p className="text-[12px] text-text-secondary">{m.family.name}</p>
              </div>
              <p className="shrink-0 text-[12px] text-text-muted">{formatDate(m.membershipDate)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

const QUICK_ACTIONS = [
  { label: "Add New Member", icon: UserPlus, href: "/members/new" },
  { label: "Import Members (Excel)", icon: Upload, href: "/bulk-import/members" },
  { label: "Bulk Family Assignment", icon: Users2, href: "/members/families" },
  { label: "Generate Member Report", icon: FileBarChart2, href: "/reports/members" },
];

export function MemberQuickActions() {
  return (
    <Card className="lg:col-span-4">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex h-11 items-center gap-2.5 rounded-md border border-border px-3.5 text-left text-[13.5px] font-medium text-text-primary transition-colors duration-150 hover:bg-background-alt"
            >
              <Icon size={16} className="text-primary" />
              {a.label}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
