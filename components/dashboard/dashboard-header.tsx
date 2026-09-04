import { Calendar, ChevronDown, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-page-title text-text-primary">Dashboard</h1>
        <p className="mt-1 text-body text-text-secondary">
          Overview of church operations and key metrics
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button className="flex h-control-md items-center gap-2 rounded-md border border-border bg-surface px-3.5 text-[13.5px] font-semibold text-text-primary transition-colors duration-150 hover:bg-background-alt">
          <Calendar size={16} className="text-text-secondary" />
          This Month (Aug 1 – Aug 31, 2026)
          <ChevronDown size={14} className="text-text-muted" />
        </button>

        <Button icon={<Plus size={16} />}>Generate Report</Button>

        <button
          aria-label="More options"
          className="flex h-control-md w-control-md items-center justify-center rounded-md border border-border bg-surface text-text-secondary transition-colors duration-150 hover:bg-background-alt"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}
