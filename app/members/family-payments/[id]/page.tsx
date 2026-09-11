import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Wallet2, Calendar, CreditCard, Home, Phone, ArrowLeft, FileText, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { requireAuth, ApiError } from "@/lib/api-helpers";
import { familyPaymentService } from "@/features/family-payments/family-payment.service";
import { paymentMethodLabel, type PaymentStatus } from "@/features/family-payments/family-payment.types";

const statusTone: Record<PaymentStatus, BadgeTone> = {
  Paid: "success",
  Partial: "warning",
  Unpaid: "neutral",
  Overdue: "danger",
};

function formatDate(iso: string | Date | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

async function loadPayment(id: string) {
  try {
    return await familyPaymentService.getById(id);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const payment = await loadPayment(id);
  const receiptNo = payment?.receiptNumber || payment?.id.slice(0, 8) || "Not Found";
  return { title: payment ? `Receipt ${receiptNo}` : "Receipt Not Found" };
}

export default async function FamilyPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const payment = await loadPayment(id);
  if (!payment) notFound();

  const expected = Number(payment.expectedAmount);
  const paid = Number(payment.paidAmount);
  const balance = expected - paid;
  const receiptNo = payment.receiptNumber || payment.id.slice(0, 8);
  const isPdf = payment.receiptUrl?.toLowerCase().endsWith(".pdf");

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Members & Families", href: "/members" },
          { label: "Family Payments", href: "/members/family-payments" },
          { label: receiptNo },
        ]}
        title={`Receipt ${receiptNo}`}
        description={`${payment.year} Sebeka Gubae payment for ${payment.family.name}`}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <Badge tone={statusTone[payment.status as PaymentStatus]}>{payment.status}</Badge>
          </CardHeader>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SummaryField icon={FileText} label="Receipt Number" value={receiptNo} highlight />
            <SummaryField icon={Home} label="Family" value={payment.family.name} />
            <SummaryField icon={Phone} label="Phone" value={payment.family.phone ?? "—"} />
            <SummaryField icon={Calendar} label="Payment Year" value={String(payment.year)} />
            <SummaryField icon={Calendar} label="Payment Date" value={formatDate(payment.paymentDate)} />
            <SummaryField icon={CreditCard} label="Payment Method" value={paymentMethodLabel(payment.paymentMethod)} />
            <SummaryField icon={ShieldCheck} label="Recorded / Approved By" value={payment.recordedBy?.name ?? "Cashier"} />
            <SummaryField icon={Wallet2} label="Balance" value={`${balance.toLocaleString()} ETB`} />
          </div>

          {/* Receipt Attachment */}
          {payment.receiptUrl && (
            <div className="mt-6 border-t border-border-light pt-5">
              <h3 className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-text-primary">
                <ImageIcon size={16} className="text-gold" />
                <span>Attached Paper Receipt</span>
              </h3>
              {isPdf ? (
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background-alt/50 p-3 text-[13px] font-medium text-primary hover:underline"
                >
                  <FileText size={16} />
                  <span>Open Receipt PDF</span>
                </a>
              ) : (
                <div className="max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.receiptUrl}
                    alt="Receipt attachment"
                    className="max-h-80 w-full object-contain bg-black/5"
                  />
                </div>
              )}
            </div>
          )}

          {payment.notes && (
            <div className="mt-5 border-t border-border-light pt-4">
              <p className="text-[12px] text-text-muted">Notes</p>
              <p className="mt-0.5 text-[13.5px] text-text-primary">{payment.notes}</p>
            </div>
          )}
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle>Amounts</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-4">
            <AmountRow label="Expected Amount" value={expected} />
            <AmountRow label="Paid Amount" value={paid} highlight />
            <div className="border-t border-border-light pt-4">
              <AmountRow label="Balance" value={balance} danger={balance > 0} />
            </div>
          </div>
        </Card>
      </div>

      <Link
        href="/members/family-payments"
        className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover"
      >
        <ArrowLeft size={15} />
        Back to Family Payments
      </Link>
    </PageContainer>
  );
}

function SummaryField({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-text-muted" />
      <div>
        <p className="text-[12px] text-text-muted">{label}</p>
        <p className={`text-[13.5px] ${highlight ? "font-bold text-primary" : "font-medium text-text-primary"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function AmountRow({ label, value, highlight, danger }: { label: string; value: number; highlight?: boolean; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13.5px] text-text-secondary">{label}</span>
      <span
        className={
          danger
            ? "text-[15px] font-bold text-danger"
            : highlight
              ? "text-[15px] font-bold text-success"
              : "text-[15px] font-bold text-text-primary"
        }
      >
        {value.toLocaleString()} ETB
      </span>
    </div>
  );
}
