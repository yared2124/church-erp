"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { MemberForm } from "@/components/members/member-form";
import { ErrorState } from "@/components/ui/empty-state";
import { apiFetch } from "@/lib/api-client";
import type { MemberFormValues } from "@/features/members/validation";

export default function NewMemberPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userRoles = session?.user?.roles ?? [];
  const isAdmin = userRoles.includes("Super Admin");

  if (status === "loading") {
    return (
      <PageContainer>
        <div className="py-16 text-center text-text-muted">Checking permissions...</div>
      </PageContainer>
    );
  }

  if (!isAdmin) {
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
        <div className="max-w-xl">
          <ErrorState
            title="Access Restricted"
            description="Only Super Administrators are authorized to add new members to the system."
            actionLabel="Return to Members"
            onRetry={() => router.push("/members")}
          />
        </div>
      </PageContainer>
    );
  }

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
