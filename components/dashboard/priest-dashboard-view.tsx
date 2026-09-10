"use client";

import * as React from "react";
import Link from "next/link";
import { Users, CheckCircle2, AlertCircle, Cross, Heart, FileText, Plus, ChevronRight } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PriestSacramentDialog } from "@/components/sacraments/priest-sacrament-dialog";
import { useLanguage } from "@/lib/language-context";

interface PriestDashboardViewProps {
  data: {
    totalSpiritualChildren: number;
    sebekaPaid: number;
    sebekaUnpaid: number;
    pendingRequests: number;
    myChildren: any[];
    sacramentsByType: { Baptism: number; Marriage: number; Burial: number };
  };
}

export function PriestDashboardView({ data }: PriestDashboardViewProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedChildId, setSelectedChildId] = React.useState<string | undefined>();

  return (
    <div className="flex flex-col gap-6">
      {/* Pastoral Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-gradient-to-r from-primary/10 via-gold/10 to-surface p-5 shadow-card">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gradient-to-b from-primary to-sidebar shadow-glow-gold">
            <Cross size={24} className="text-gold" />
          </div>
          <div>
            <h1 className="text-[19px] font-bold text-text-primary">
              {isAmharic ? "የካህኑ መንፈሳዊ አገልግሎት ዳሽቦርድ" : "Pastoral Care Dashboard"}
            </h1>
            <p className="text-[13px] text-text-secondary">
              {isAmharic
                ? "የንስሃ ልጆች ክትትል፣ የሰበካ ጉባኤ ክፍያ ሁኔታ እና የቅዱሳት ምስጢራት ማመልከቻዎች"
                : "Spiritual children oversight, Sebeka contribution status, and sacramental applications"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              setSelectedChildId(undefined);
              setDialogOpen(true);
            }}
            icon={<Plus size={16} />}
            className="rounded-xl shadow-card"
          >
            {isAmharic ? "የምስጢራት ጥያቄ አቅርብ" : "New Sacrament Request"}
          </Button>
          <Button
            variant="secondary"
            href="/members"
            icon={<ChevronRight size={16} />}
            className="rounded-xl"
          >
            {isAmharic ? "ሁሉንም የንስሃ ልጆች እይ" : "View All Children"}
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={isAmharic ? "የንስሃ ልጆቼ ብዛት" : "Total Spiritual Children"}
          value={data.totalSpiritualChildren.toLocaleString()}
          icon={Users}
          iconBg="bg-primary-light"
          iconColor="text-primary"
        />
        <StatCard
          label={isAmharic ? "የሰበካ ጉባኤ የከፈሉ" : "Sebeka Paid"}
          value={data.sebekaPaid.toLocaleString()}
          icon={CheckCircle2}
          iconBg="bg-success-bg"
          iconColor="text-success"
        />
        <StatCard
          label={isAmharic ? "የሰበካ ጉባኤ ያልከፈሉ" : "Sebeka Unpaid"}
          value={data.sebekaUnpaid.toLocaleString()}
          icon={AlertCircle}
          iconBg="bg-warning-bg"
          iconColor="text-warning"
        />
        <StatCard
          label={isAmharic ? "በሂደት ላይ ያሉ ማመልከቻዎች" : "Pending Requests"}
          value={data.pendingRequests.toLocaleString()}
          icon={FileText}
          iconBg="bg-gold-light"
          iconColor="text-gold"
        />
      </div>

      {/* Sacramental Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <Cross size={20} />
          </div>
          <div>
            <p className="text-[12.5px] font-medium text-text-secondary">
              {isAmharic ? "የተከናወኑ ጥምቀቶች" : "Baptisms"}
            </p>
            <p className="text-[20px] font-bold text-text-primary">
              {data.sacramentsByType.Baptism}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Heart size={20} />
          </div>
          <div>
            <p className="text-[12.5px] font-medium text-text-secondary">
              {isAmharic ? "የተከናወኑ ተክሊሎች (ጋብቻ)" : "Marriages"}
            </p>
            <p className="text-[20px] font-bold text-text-primary">
              {data.sacramentsByType.Marriage}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background-alt text-text-secondary">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[12.5px] font-medium text-text-secondary">
              {isAmharic ? "ፍትሐትና የቀብር ጸሎቶች" : "Burials & Repose"}
            </p>
            <p className="text-[20px] font-bold text-text-primary">
              {data.sacramentsByType.Burial}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Spiritual Children Table */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-text-primary">
              {isAmharic ? "የቅርብ ጊዜ የንስሃ ልጆች" : "Recent Spiritual Children"}
            </h2>
            <p className="text-[12.5px] text-text-secondary">
              {isAmharic
                ? "የሰበካ ጉባኤ ክፍያ ሁኔታ እና የምስጢራት ማመልከቻ ማቅረቢያ"
                : "Sebeka status and direct sacramental actions"}
            </p>
          </div>
          <Link
            href="/members"
            className="flex items-center gap-1 text-[13px] font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            <span>{isAmharic ? "ሁሉንም አሳይ" : "View All"}</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {data.myChildren.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-text-secondary">
            {isAmharic ? "ምንም የተመዘገበ የንስሃ ልጅ የለም።" : "No spiritual children assigned yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isAmharic ? "ሙሉ ስም" : "Full Name"}</TableHead>
                  <TableHead>{isAmharic ? "ቤተሰብ" : "Family"}</TableHead>
                  <TableHead>{isAmharic ? "የሰበካ ጉባኤ ክፍያ" : "Sebeka Status"}</TableHead>
                  <TableHead>{isAmharic ? "ስልክ" : "Phone"}</TableHead>
                  <TableHead className="text-right">{isAmharic ? "ተግባር" : "Action"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.myChildren.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-semibold text-text-primary">
                      {m.firstName} {m.middleName ? `${m.middleName} ` : ""}{m.lastName}
                    </TableCell>
                    <TableCell className="text-text-secondary">{m.family?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge tone={m.family?.sebekaStatus === "Paid" ? "success" : "warning"}>
                        {m.family?.sebekaStatus === "Paid"
                          ? isAmharic
                            ? "የተከፈለ"
                            : "Paid"
                          : isAmharic
                          ? "ያልተከፈለ"
                          : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-secondary">{m.phone || "—"}</TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChildId(m.id);
                          setDialogOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gold/50 bg-gold/5 px-2.5 py-1 text-[12px] font-semibold text-gold transition-colors hover:bg-gold/15"
                      >
                        <Cross size={13} />
                        <span>{isAmharic ? "የምስጢራት ጥያቄ" : "Request"}</span>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <PriestSacramentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultMemberId={selectedChildId}
      />
    </div>
  );
}
