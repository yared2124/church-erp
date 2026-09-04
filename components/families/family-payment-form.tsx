"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import type { ApiFamily } from "@/features/families/family.types";

export interface FamilyPaymentFormValues {
  familyId: string;
  year: string;
  expectedAmount: string;
  paidAmount: string;
  paymentDate: string;
  paymentMethod: string;
  notes: string;
}

const emptyValues: FamilyPaymentFormValues = {
  familyId: "",
  year: String(new Date().getFullYear()),
  expectedAmount: "",
  paidAmount: "",
  paymentDate: "",
  paymentMethod: "Cash",
  notes: "",
};

interface FamilyPaymentFormProps {
  initialValues?: Partial<FamilyPaymentFormValues>;
  onCancel?: () => void;
  onSubmit?: (values: FamilyPaymentFormValues) => void;
  submitError?: string | null;
  submitting?: boolean;
}

/**
 * Family-based Sebeka payment form. This records a payment against a
 * FAMILY, not an individual member — the family selector is the anchor
 * field, consistent with the Family → Payment data relationship.
 */
export function FamilyPaymentForm({ initialValues, onCancel, onSubmit, submitError, submitting }: FamilyPaymentFormProps) {
  const [values, setValues] = React.useState<FamilyPaymentFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FamilyPaymentFormValues, string>>>({});
  const [families, setFamilies] = React.useState<ApiFamily[]>([]);
  const [familiesLoading, setFamiliesLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<Paginated<ApiFamily>>("/api/families?limit=100")
      .then((res) => setFamilies(res.data))
      .catch(() => setFamilies([]))
      .finally(() => setFamiliesLoading(false));
  }, []);

  const set = (field: keyof FamilyPaymentFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.familyId) nextErrors.familyId = "Please select a family.";
    if (!values.year) nextErrors.year = "Payment year is required.";
    if (!values.expectedAmount || Number(values.expectedAmount) <= 0)
      nextErrors.expectedAmount = "Enter a valid expected amount.";
    if (values.paidAmount && Number(values.paidAmount) < 0)
      nextErrors.paidAmount = "Paid amount cannot be negative.";
    if (
      values.paidAmount &&
      values.expectedAmount &&
      Number(values.paidAmount) > Number(values.expectedAmount)
    ) {
      nextErrors.paidAmount = "Paid amount cannot exceed the expected amount.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit?.(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Sebeka Payment</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Select
              label="Family"
              required
              value={values.familyId}
              onChange={set("familyId")}
              error={errors.familyId}
              disabled={familiesLoading}
              options={[
                { value: "", label: familiesLoading ? "Loading families..." : "Select Family" },
                ...families.map((f) => ({ value: f.id, label: f.name })),
              ]}
            />
          </div>
          <Input label="Payment Year" required type="number" value={values.year} onChange={set("year")} error={errors.year} />
          <Select
            label="Payment Method"
            value={values.paymentMethod}
            onChange={set("paymentMethod")}
            options={[
              { value: "Cash", label: "Cash" },
              { value: "BankTransfer", label: "Bank Transfer" },
              { value: "MobileMoney", label: "Mobile Money" },
            ]}
          />
          <Input
            label="Expected Amount (ETB)"
            required
            type="number"
            value={values.expectedAmount}
            onChange={set("expectedAmount")}
            error={errors.expectedAmount}
          />
          <Input
            label="Paid Amount (ETB)"
            type="number"
            value={values.paidAmount}
            onChange={set("paidAmount")}
            error={errors.paidAmount}
          />
          <Input label="Payment Date" type="date" value={values.paymentDate} onChange={set("paymentDate")} />
          <div className="sm:col-span-2">
            <Textarea label="Notes" value={values.notes} onChange={set("notes")} placeholder="Optional notes about this payment" />
          </div>
        </div>
      </Card>

      {submitError && (
        <div className="rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">
          {submitError}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>Save Payment</Button>
      </div>
    </form>
  );
}
