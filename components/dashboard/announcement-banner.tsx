import { Church, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AnnouncementBanner() {
  return (
    <Card hoverable className="col-span-12 flex flex-wrap items-center justify-between gap-3 border-primary/20 bg-gradient-to-r from-primary-light via-[#F0F4FF] to-surface p-3 sm:p-3.5 shadow-card">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/20">
          <Church size={16} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13.5px] font-semibold text-text-primary">Sunday Service Reminder</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-medium text-primary">Announcement</span>
          </div>
          <p className="mt-0.5 text-[12px] text-text-secondary">Don&apos;t forget! Sunday divine liturgy and fellowship starts at 8:00 AM.</p>
        </div>
      </div>
      <Button variant="secondary" icon={<Megaphone size={14} />} className="h-8 rounded-lg border-primary/20 hover:border-primary/40 text-[12.5px]">
        View Announcements
      </Button>
    </Card>
  );
}
