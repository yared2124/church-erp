"use client";

import * as React from "react";
import { Eye, Wrench, AlertTriangle, CheckCircle2, Clock, X, ArrowLeft } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataToolbar } from "@/components/ui/data-toolbar";
import { Button } from "@/components/ui/button";
import { EthiopicCross } from "@/components/ui/ethiopic-cross";
import { useLanguage } from "@/lib/language-context";

interface MaintenanceReq {
  id: string;
  issue: string;
  priority: "Low" | "Medium" | "Urgent";
  status: "Scheduled" | "InProgress" | "Completed";
  createdAt: string;
  property: { unitName: string };
}

export function PropertyMaintenanceTable({ requests }: { requests: MaintenanceReq[] }) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [selectedReq, setSelectedReq] = React.useState<MaintenanceReq | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return requests.filter((r) => {
      const matchSearch = r.issue.toLowerCase().includes(search.toLowerCase()) ||
        r.property.unitName.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === "all" || r.priority === priorityFilter;
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchPriority && matchStatus;
    });
  }, [requests, search, priorityFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isAmharic ? "የችግሩን ዓይነት ወይም የቤት ስም ፈልግ..." : "Search issue or unit name..."}
        filters={[
          {
            key: "priority",
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              { value: "all", label: isAmharic ? "ሁሉም ቅድሚያዎች" : "All Priorities" },
              { value: "Urgent", label: isAmharic ? "አስቸኳይ (Urgent)" : "Urgent" },
              { value: "Medium", label: isAmharic ? "መካከለኛ" : "Medium" },
              { value: "Low", label: isAmharic ? "ዝቅተኛ" : "Low" },
            ],
          },
          {
            key: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: isAmharic ? "ሁሉም ሁኔታዎች" : "All Status" },
              { value: "Scheduled", label: isAmharic ? "ቀጠሮ የተያዘ" : "Scheduled" },
              { value: "InProgress", label: isAmharic ? "በሂደት ላይ" : "InProgress" },
              { value: "Completed", label: isAmharic ? "የተጠናቀቀ" : "Completed" },
            ],
          },
        ]}
        onClearFilters={() => {
          setSearch("");
          setPriorityFilter("all");
          setStatusFilter("all");
        }}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isAmharic ? "የቤቱ / ክፍል ስም" : "Property Unit"}</TableHead>
              <TableHead>{isAmharic ? "የተፈጠረው ችግር / ጥገና" : "Issue / Request"}</TableHead>
              <TableHead>{isAmharic ? "ቅድሚያ" : "Priority"}</TableHead>
              <TableHead>{isAmharic ? "ሁኔታ" : "Status"}</TableHead>
              <TableHead>{isAmharic ? "ቀን" : "Date"}</TableHead>
              <TableHead className="text-right">{isAmharic ? "ተግባር" : "Actions"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-text-muted">
                  {isAmharic ? "ምንም የጥገና ጥያቄ አልተገኘም።" : "No maintenance requests found."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => {
                    setSelectedReq(r);
                    setDetailOpen(true);
                  }}
                  className="cursor-pointer transition-colors hover:bg-background-alt/60"
                >
                  <TableCell className="font-semibold text-text-primary">{r.property.unitName}</TableCell>
                  <TableCell className="max-w-xs truncate text-text-secondary">{r.issue}</TableCell>
                  <TableCell>
                    <Badge tone={r.priority === "Urgent" ? "danger" : r.priority === "Medium" ? "warning" : "neutral"}>
                      {r.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge tone={r.status === "Completed" ? "success" : r.status === "InProgress" ? "warning" : "neutral"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-text-secondary">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReq(r);
                        setDetailOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-text-primary transition-colors hover:bg-background-alt shadow-sm"
                    >
                      <Eye size={13} className="text-primary" />
                      <span>{isAmharic ? "ዝርዝር" : "Detail"}</span>
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {detailOpen && selectedReq && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setDetailOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-surface p-5 shadow-modal animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-primary/90 to-sidebar shadow-glow-gold">
                  <EthiopicCross size={20} variant="gold" />
                </div>
                <div>
                  <h3 className="text-[16.5px] font-semibold text-text-primary">{isAmharic ? "የጥገና ጥያቄ ዝርዝር" : "Maintenance Detail"}</h3>
                  <p className="text-[12.5px] text-text-secondary">{selectedReq.property.unitName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-background-alt"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-5 space-y-3">
              <div className="rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[12px] font-semibold text-text-muted uppercase">{isAmharic ? "የችግሩ ዝርዝር መግለጫ" : "Issue Description"}</span>
                <p className="mt-1 font-medium text-text-primary text-[13.5px]">{selectedReq.issue}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የቅድሚያ ደረጃ" : "Priority"}</span>
                <Badge tone={selectedReq.priority === "Urgent" ? "danger" : "warning"}>{selectedReq.priority}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የጥገና ሁኔታ" : "Status"}</span>
                <Badge tone={selectedReq.status === "Completed" ? "success" : "warning"}>{selectedReq.status}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-background-alt/40 p-3">
                <span className="text-[13px] text-text-secondary">{isAmharic ? "የተመዘገበበት ቀን" : "Created At"}</span>
                <span className="font-medium text-text-primary">{new Date(selectedReq.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <Button variant="secondary" onClick={() => setDetailOpen(false)} icon={<ArrowLeft size={16} />}>
                {isAmharic ? "ተመለስ (Back)" : "Back to Table"}
              </Button>
              <Button onClick={() => setDetailOpen(false)}>
                {isAmharic ? "እሺ" : "Done"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
