"use client";

import { useState, useTransition, useRef } from "react";
import { CalendarClock, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReport, type ReportType } from "@/features/reports/report.actions";

const REPORT_TYPES: { label: string; type: ReportType }[] = [
  { label: "Financial Report",  type: "Financial"  },
  { label: "Member Report",     type: "Members"    },
  { label: "Sacrament Report",  type: "Sacraments" },
  { label: "Property Report",   type: "Property"   },
  { label: "Inventory Report",  type: "Inventory"  },
  { label: "Employee Report",   type: "Employees"  },
  { label: "Custom Report",     type: "Custom"     },
];

export function ReportActionsBar() {
  const [isPending, startTransition] = useTransition();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  function triggerDownload(url: string) {
    if (!anchorRef.current) return;
    anchorRef.current.href = url;
    anchorRef.current.click();
  }

  function handleGenerate(type: ReportType) {
    setDropdownOpen(false);
    startTransition(async () => {
      const url = await generateReport(type, "CSV");
      triggerDownload(url);
    });
  }

  function handleSchedule() {
    startTransition(async () => {
      const url = await generateReport("Financial", "CSV");
      triggerDownload(url);
    });
  }

  return (
    <>
      {/* Hidden anchor used to trigger file downloads */}
      {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
      <a ref={anchorRef} className="hidden" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Schedule Report — downloads a Financial CSV immediately */}
        <Button
          variant="secondary"
          icon={<CalendarClock size={16} />}
          loading={isPending}
          onClick={handleSchedule}
        >
          Schedule Report
        </Button>

        {/* Create Report dropdown */}
        <div className="relative">
          <Button
            icon={<Plus size={16} />}
            loading={isPending}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            Create Report
            <ChevronDown size={14} className="ml-1" />
          </Button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-md border border-border bg-surface shadow-lg">
                {REPORT_TYPES.map(({ label, type }) => (
                  <button
                    key={type}
                    onClick={() => handleGenerate(type)}
                    className="flex w-full items-center px-4 py-2.5 text-left text-[13.5px] font-medium text-text-primary hover:bg-background-alt"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
