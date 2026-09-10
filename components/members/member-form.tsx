"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input, Select, Textarea, Checkbox } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiClientError, type Paginated } from "@/lib/api-client";
import {
  validateMemberForm,
  hasErrors,
  type MemberFormValues,
  type MemberFormErrors,
} from "@/features/members/validation";

interface FamilyOption {
  id: string;
  name: string;
}

const emptyValues: MemberFormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  address: "",
  familyId: "",
  roleInFamily: "",
  isHeadOfFamily: false,
  baptismStatus: "Baptized",
  membershipStatus: "Active",
  registrationDate: new Date().toISOString().slice(0, 10),
  confessorPriest: "",
  notes: "",
};

interface MemberFormProps {
  initialValues?: Partial<MemberFormValues>;
  mode: "create" | "edit";
  onCancel?: () => void;
  onSubmit?: (values: MemberFormValues) => Promise<void> | void;
}

interface PriestOption {
  id: string;
  name: string;
}

export function MemberForm({ initialValues, mode, onCancel, onSubmit }: MemberFormProps) {
  const [values, setValues] = React.useState<MemberFormValues>({ ...emptyValues, ...initialValues });
  const [errors, setErrors] = React.useState<MemberFormErrors>({});
  const [families, setFamilies] = React.useState<FamilyOption[]>([]);
  const [familiesLoading, setFamiliesLoading] = React.useState(true);
  const [priests, setPriests] = React.useState<PriestOption[]>([]);
  const [priestsLoading, setPriestsLoading] = React.useState(true);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    apiFetch<Paginated<FamilyOption>>("/api/families?limit=100")
      .then((res) => setFamilies(res.data))
      .catch(() => setFamilies([]))
      .finally(() => setFamiliesLoading(false));

    apiFetch<Paginated<PriestOption>>("/api/users?role=Priest&limit=50")
      .then((res) => setPriests(res.data))
      .catch(() => setPriests([]))
      .finally(() => setPriestsLoading(false));
  }, []);

  function set<K extends keyof MemberFormValues>(field: K, value: MemberFormValues[K]) {
    setValues((v) => ({ ...v, [field]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = validateMemberForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      await onSubmit?.(values);
    } catch (err) {
      setSubmitError(err instanceof ApiClientError ? err.message : "Failed to save member. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {submitError && (
        <div className="rounded-md border border-danger-bg bg-danger-bg px-4 py-3 text-[13.5px] text-danger">
          {submitError}
        </div>
      )}

      {/* Section 1 — Personal Information */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic identity details for this member.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" required value={values.firstName} onChange={(e) => set("firstName", e.target.value)} error={errors.firstName} />
          <Input label="Middle Name" value={values.middleName} onChange={(e) => set("middleName", e.target.value)} />
          <Input label="Last Name" required value={values.lastName} onChange={(e) => set("lastName", e.target.value)} error={errors.lastName} />
          <Select
            label="Gender"
            required
            value={values.gender}
            onChange={(e) => set("gender", e.target.value)}
            error={errors.gender}
            options={[
              { value: "", label: "Select Gender" },
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
            ]}
          />
          <Input label="Date of Birth" required type="date" value={values.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} error={errors.dateOfBirth} />
          <Input label="Phone" placeholder="0911345678" value={values.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
          <Input label="Email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
          <div className="sm:col-span-2">
            <Input label="Address" value={values.address} onChange={(e) => set("address", e.target.value)} placeholder="Sub city, woreda, house number" />
          </div>
        </div>
      </Card>

      {/* Section 2 — Family Information */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Family Information</CardTitle>
            <CardDescription>Which household this member belongs to.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Family"
            required
            value={values.familyId}
            onChange={(e) => set("familyId", e.target.value)}
            error={errors.familyId}
            hint={familiesLoading ? "Loading families…" : undefined}
            options={[
              { value: "", label: "Select Family" },
              ...families.map((f) => ({ value: f.id, label: f.name })),
            ]}
          />
          <Select
            label="Relationship to Head"
            required
            value={values.roleInFamily}
            onChange={(e) => set("roleInFamily", e.target.value)}
            error={errors.roleInFamily}
            options={[
              { value: "", label: "Select Relationship" },
              { value: "Head", label: "Head" },
              { value: "Wife", label: "Wife" },
              { value: "Husband", label: "Husband" },
              { value: "Son", label: "Son" },
              { value: "Daughter", label: "Daughter" },
            ]}
          />
          <div className="sm:col-span-2">
            <Checkbox
              id="isHeadOfFamily"
              label="This member is the head of the family"
              checked={values.isHeadOfFamily}
              onChange={(e) => set("isHeadOfFamily", e.target.checked)}
            />
          </div>
        </div>
      </Card>

      {/* Section 3 — Church Information */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Church Information</CardTitle>
            <CardDescription>Sacramental and membership status.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Baptism Status"
            value={values.baptismStatus}
            onChange={(e) => set("baptismStatus", e.target.value)}
            options={[
              { value: "Baptized", label: "Baptized" },
              { value: "Not Baptized", label: "Not Baptized" },
              { value: "Pending", label: "Pending" },
            ]}
          />
          <Select
            label="Membership Status"
            required
            value={values.membershipStatus}
            onChange={(e) => set("membershipStatus", e.target.value)}
            error={errors.membershipStatus}
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "Transferred", label: "Transferred" },
            ]}
          />
          <Input label="Registration Date" required type="date" value={values.registrationDate} onChange={(e) => set("registrationDate", e.target.value)} error={errors.registrationDate} />
          <Select
            label="የንስሃ አባት / Confessor Priest"
            value={values.confessorPriestId || ""}
            onChange={(e) => {
              set("confessorPriestId", e.target.value);
              const found = priests.find((p) => p.id === e.target.value);
              set("confessorPriest", found?.name || "");
            }}
            hint={priestsLoading ? "Loading priests..." : undefined}
            options={[
              { value: "", label: "የንስሃ አባት ይምረጡ / Select Priest..." },
              ...priests.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>
      </Card>

      {/* Section 4 — Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <Textarea label="Notes" value={values.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any other relevant information about this member" />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "Save Member" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
