import { Church, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AnnouncementBanner() {
  return (
    <Card hoverable className="col-span-12 flex flex-wrap items-center justify-between gap-4 border-primary/20 bg-gradient-to-r from-primary-light via-[#F0F4FF] to-surface p-5 sm:p-6 shadow-card">
      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20">
          <Church size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[15px] font-bold text-text-primary">Sunday Service Reminder</p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">Announcement</span>
          </div>
          <p className="mt-0.5 text-[13px] text-text-secondary">Don&apos;t forget! Sunday divine liturgy and fellowship starts at 8:00 AM.</p>
        </div>
      </div>
      <Button variant="secondary" icon={<Megaphone size={16} />} className="rounded-xl border-primary/20 hover:border-primary/40">
        View Announcements
      </Button>
    </Card>
  );
}
