import { Church, Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AnnouncementBanner() {
  return (
    <Card className="col-span-12 flex flex-wrap items-center justify-between gap-4 border-[#E0E7FF] bg-primary-light">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary">
          <Church size={20} className="text-white" />
        </div>
        <div>
          <p className="text-[14.5px] font-bold text-text-primary">Sunday Service Reminder</p>
          <p className="text-[13px] text-text-secondary">Don&apos;t forget! Sunday service starts in 2 days.</p>
        </div>
      </div>
      <Button variant="secondary" icon={<Megaphone size={16} />}>
        View Announcements
      </Button>
    </Card>
  );
}
