"use client";

import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { MemberForm } from "@/components/members/member-form";
import { apiFetch } from "@/lib/api-client";
import type { MemberFormValues } from "@/features/members/validation";

export default function NewMemberPage() {
  const router = useRouter();

  const handleSubmit = async (values: MemberFormValues) => {
    const created = await apiFetch<{ data: { id: string } }>("/api/members", {
      method: "POST",
      body: JSON.stringify({
        familyId: values.familyId,
        firstName: values.firstName,
        middleName: values.middleName || undefined,
        lastName: values.lastName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        roleInFamily: values.roleInFamily,
        status: values.membershipStatus,
        membershipDate: values.registrationDate,
        // NOTE: confessorPriest is currently a free-text field in the UI,
        // but the schema stores confessorPriestId as a FK to a priest User.
        // Wiring a real priest lookup is a Users & Roles (Phase 16) item —
        // not sent here yet rather than silently faking the relationship.
      }),
    });

    router.push(`/members/${created.data.id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Members & Families", href: "/members" },
          { label: "Members", href: "/members" },
          { label: "Add Member" },
        ]}
        title="Add Member"
        description="Register a new church member"
      />
      <div className="max-w-3xl">
        <MemberForm mode="create" onCancel={() => router.push("/members")} onSubmit={handleSubmit} />
      </div>
    </PageContainer>
  );
}
