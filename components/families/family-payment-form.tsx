"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReceiptUploader } from "@/components/ui/receipt-uploader";
import { apiFetch, type Paginated } from "@/lib/api-client";
import { useLanguage } from "@/lib/language-context";
import type { ApiFamily } from "@/features/families/family.types";
import { FileCheck, ShieldCheck } from "lucide-react";

export interface FamilyPaymentFormValues {
  familyId: string;
  year: string;
  expectedAmount: string;
  paidAmount: string;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  receiptUrl: string;
  notes: string;
}

const emptyValues: FamilyPaymentFormValues = {
  familyId: "",
  year: String(new Date().getFullYear()),
  expectedAmount: "600",
  paidAmount: "600",
  paymentDate: new Date().toISOString().split("T")[0],
  paymentMethod: "Cash",
  receiptNumber: "",
  receiptUrl: "",
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
 * Cashier / Sebeka Gubae physical receipt entry form.
 * Church payments are issued through official paper receipt booklets.
 * Entering the paper receipt number confirms/approves the payment.
 */
export function FamilyPaymentForm({ initialValues, onCancel, onSubmit, submitError, submitting }: FamilyPaymentFormProps) {
  const { locale } = useLanguage();
  const isAmharic = locale === "am";

  const [values, setValues] = React.useState<FamilyPaymentFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof FamilyPaymentFormValues, string>>>({});
  const [families, setFamilies] = React.useState<ApiFamily[]>([]);
  const [familiesLoading, setFamiliesLoading] = React.useState(true);

  React.useEffect(() => {
    apiFetch<Paginated<ApiFamily>>("/api/families?limit=200")
      .then((res) => setFamilies(res.data))
      .catch(() => setFamilies([]))
      .finally(() => setFamiliesLoading(false));
  }, []);

  const set = (field: keyof FamilyPaymentFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!values.familyId) {
      nextErrors.familyId = isAmharic ? "እባክዎ ቤተሰብ ይምረጡ።" : "Please select a family.";
    }
    if (!values.year) {
      nextErrors.year = isAmharic ? "የክፍያ ዓመት ማስገባት ግዴታ ነው።" : "Payment year is required.";
    }
    if (!values.receiptNumber || !values.receiptNumber.trim()) {
      nextErrors.receiptNumber = isAmharic ? "የተቆረጠው የደረሰኝ / ሪሲት ቁጥር ማስገባት ግዴታ ነው።" : "Physical receipt number is required.";
    }
    if (!values.expectedAmount || Number(values.expectedAmount) <= 0) {
      nextErrors.expectedAmount = isAmharic ? "ትክክለኛ የሚጠበቅ መጠን ያስገቡ።" : "Enter a valid expected amount.";
    }
    if (values.paidAmount && Number(values.paidAmount) < 0) {
      nextErrors.paidAmount = isAmharic ? "የተከፈለው መጠን ከአሉታዊ መሆን የለበትም።" : "Paid amount cannot be negative.";
    }
    if (
      values.paidAmount &&
      values.expectedAmount &&
      Number(values.paidAmount) > Number(values.expectedAmount)
    ) {
      nextErrors.paidAmount = isAmharic ? "የተከፈለው መጠን ከሚጠበቀው መብለጥ የለበትም።" : "Paid amount cannot exceed the expected amount.";
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
          <div className="flex items-center justify-between">
            <CardTitle>{isAmharic ? "የሰበካ ጉባኤ ደረሰኝ ክፍያ ማስገቢያ" : "Record Sebeka Receipt Payment"}</CardTitle>
            <div className="flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/5 px-2.5 py-1 text-[11.5px] font-medium text-gold">
              <ShieldCheck size={14} />
              <span>{isAmharic ? "በካሸር ደረሰኝ የሚጸድቅ" : "Cashier Receipt Approval"}</span>
            </div>
          </div>
        </CardHeader>

        <div className="mb-4 rounded-lg border border-border/80 bg-background-alt/60 p-3 text-[12.5px] text-text-secondary">
          <p>
            {isAmharic
              ? "ማስታወሻ፦ የሰበካ ጉባኤ ክፍያ በቤተክርስቲያኑ የደረሰኝ ደብተር የተቆረጠውን የሪሲት ቁጥር በማስገባት የሚጸድቅ ሲሆን፣ ክፍያው ሲመዘገብ ለንስሃ አባቱ የተከፈለ መሆኑ በቀጥታ ይታያል።"
              : "Note: Sebeka payments are collected in person with physical receipt books. Submitting the receipt number approves the payment and updates the spiritual father's dashboard."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Family Selection */}
          <div className="sm:col-span-2">
            <Select
              label={isAmharic ? "ቤተሰብ" : "Family"}
              required
              value={values.familyId}
              onChange={set("familyId")}
              error={errors.familyId}
              disabled={familiesLoading}
              options={[
                { value: "", label: familiesLoading ? (isAmharic ? "ቤተሰቦችን በመጫን ላይ..." : "Loading families...") : (isAmharic ? "ቤተሰብ ይምረጡ" : "Select Family") },
                ...families.map((f) => ({ value: f.id, label: `${f.name}${f.phone ? ` (${f.phone})` : ""}` })),
              ]}
            />
          </div>

          {/* Receipt Number - PRIMARY FIELD */}
          <div className="sm:col-span-1">
            <Input
              label={isAmharic ? "የደረሰኝ / ሪሲት ቁጥር (ከደብተሩ)" : "Physical Receipt Number"}
              required
              placeholder={isAmharic ? "ምሳሌ፦ REC-2017-0842" : "e.g. REC-2017-0842"}
              value={values.receiptNumber}
              onChange={set("receiptNumber")}
              error={errors.receiptNumber}
            />
          </div>

          {/* Payment Year */}
          <div className="sm:col-span-1">
            <Input
              label={isAmharic ? "የክፍያ ዓመተ ምሕረት" : "Payment Year"}
              required
              type="number"
              value={values.year}
              onChange={set("year")}
              error={errors.year}
            />
          </div>

          {/* Payment Method - Offline manual options only */}
          <div className="sm:col-span-1">
            <Select
              label={isAmharic ? "የክፍያ ዘዴ" : "Payment Method"}
              value={values.paymentMethod}
              onChange={set("paymentMethod")}
              options={[
                { value: "Cash", label: isAmharic ? "ጥሬ ገንዘብ (በካሸር ደረሰኝ)" : "Cash (Cashier Paper Receipt)" },
                { value: "BankTransfer", label: isAmharic ? "በባንክ የተከፈለ (ስሊፕ/ደረሰኝ)" : "Bank Transfer (Deposit Slip)" },
              ]}
            />
          </div>

          {/* Payment Date */}
          <div className="sm:col-span-1">
            <Input
              label={isAmharic ? "የተከፈለበት ቀን" : "Payment Date"}
              type="date"
              value={values.paymentDate}
              onChange={set("paymentDate")}
            />
          </div>

          {/* Expected Amount */}
          <div className="sm:col-span-1">
            <Input
              label={isAmharic ? "የሚጠበቅ መጠን (ETB)" : "Expected Amount (ETB)"}
              required
              type="number"
              value={values.expectedAmount}
              onChange={set("expectedAmount")}
              error={errors.expectedAmount}
            />
          </div>

          {/* Paid Amount */}
          <div className="sm:col-span-1">
            <Input
              label={isAmharic ? "የተከፈለ መጠን (ETB)" : "Paid Amount (ETB)"}
              required
              type="number"
              value={values.paidAmount}
              onChange={set("paidAmount")}
              error={errors.paidAmount}
            />
          </div>

          {/* Drag & Drop Receipt Photo Attachment */}
          <div className="sm:col-span-2 pt-1">
            <ReceiptUploader
              value={values.receiptUrl || null}
              onChange={(url) => setValues((v) => ({ ...v, receiptUrl: url || "" }))}
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <Textarea
              label={isAmharic ? "ተጨማሪ ማስታወሻ (አማራጭ)" : "Notes (Optional)"}
              value={values.notes}
              onChange={set("notes")}
              placeholder={isAmharic ? "ስለ ክፍያው ተጨማሪ መረጃ..." : "Optional notes regarding this receipt or cashier remarks..."}
            />
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
          {isAmharic ? "ይቅር" : "Cancel"}
        </Button>
        <Button type="submit" loading={submitting} icon={<FileCheck size={16} />}>
          {isAmharic ? "ክፍያውን አጽድቅና መዝግብ" : "Approve & Save Payment"}
        </Button>
      </div>
    </form>
  );
}
