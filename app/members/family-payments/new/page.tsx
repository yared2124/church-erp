"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FamilyPaymentForm, type FamilyPaymentFormValues } from "@/components/families/family-payment-form";
import { apiFetch, ApiClientError } from "@/lib/api-client";

export default function NewFamilyPaymentPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (values: FamilyPaymentFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch("/api/family-payments", {
        method: "POST",
        body: JSON.stringify({
          familyId: values.familyId,
          year: Number(values.year),
          expectedAmount: Number(values.expectedAmount),
          paidAmount: Number(values.paidAmount || 0),
          paymentDate: values.paymentDate || undefined,
          paymentMethod: values.paymentMethod || undefined,
          receiptNumber: values.receiptNumber.trim(),
          receiptUrl: values.receiptUrl || undefined,
          notes: values.notes || undefined,
        }),
      });
      router.push("/members/family-payments");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : "Failed to save the payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Members & Families", href: "/members" },
          { label: "Family Payments", href: "/members/family-payments" },
          { label: "Record Payment" },
        ]}
        title="Record Payment"
        description="Record a Sebeka Gubae payment for a family"
      />
      <div className="max-w-2xl">
        <FamilyPaymentForm
          onCancel={() => router.push("/members/family-payments")}
          onSubmit={handleSubmit}
          submitError={submitError}
          submitting={submitting}
        />
      </div>
    </PageContainer>
  );
}
