"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { MemberForm } from "@/components/members/member-form";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { memberFullName, type ApiMember } from "@/features/members/member.types";
import type { MemberFormValues } from "@/features/members/validation";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [member, setMember] = React.useState<ApiMember | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  const fetchMember = React.useCallback(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    apiFetch<{ data: ApiMember }>(`/api/members/${params.id}`)
      .then((res) => setMember(res.data))
      .catch((err) => {
        if (err instanceof ApiClientError && err.status === 404) setNotFound(true);
        else setError(err instanceof ApiClientError ? err.message : "Failed to load member.");
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  React.useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  const breadcrumbBase = [
    { label: "Home", href: "/dashboard" },
    { label: "Members & Families", href: "/members" },
    { label: "Members", href: "/members" },
  ];

  if (loading) {
    return (
      <PageContainer>
        <PageHeader breadcrumb={[...breadcrumbBase, { label: "Edit Member" }]} title="Edit Member" />
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (notFound) {
    return (
      <PageContainer>
        <PageHeader breadcrumb={[...breadcrumbBase, { label: "Edit Member" }]} title="Member Not Found" />
        <EmptyState title="Member not found" description="This member record may have been removed." actionLabel="Back to Members" onAction={() => router.push("/members")} />
      </PageContainer>
    );
  }

  if (error || !member) {
    return (
      <PageContainer>
        <PageHeader breadcrumb={[...breadcrumbBase, { label: "Edit Member" }]} title="Edit Member" />
        <ErrorState description={error ?? "Something went wrong."} onRetry={fetchMember} />
      </PageContainer>
    );
  }

  const initialValues: Partial<MemberFormValues> = {
    firstName: member.firstName,
    middleName: member.middleName ?? "",
    lastName: member.lastName,
    gender: member.gender,
    dateOfBirth: member.dateOfBirth.slice(0, 10),
    phone: member.phone ?? "",
    email: member.email ?? "",
    address: member.address ?? "",
    familyId: member.familyId,
    roleInFamily: member.roleInFamily,
    isHeadOfFamily: member.roleInFamily === "Head",
    baptismStatus: member.baptizedDate ? "Baptized" : "Not Baptized",
    membershipStatus: member.status === "Deceased" ? "Inactive" : member.status,
    registrationDate: member.membershipDate.slice(0, 10),
    confessorPriest: "",
    notes: "",
  };

  const handleSubmit = async (values: MemberFormValues) => {
    await apiFetch(`/api/members/${member.id}`, {
      method: "PATCH",
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
      }),
    });
    router.push(`/members/${member.id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[...breadcrumbBase, { label: memberFullName(member), href: `/members/${member.id}` }, { label: "Edit" }]}
        title={`Edit ${memberFullName(member)}`}
        description={member.id}
      />
      <div className="max-w-3xl">
        <MemberForm mode="edit" initialValues={initialValues} onCancel={() => router.push(`/members/${member.id}`)} onSubmit={handleSubmit} />
      </div>
      <Link href={`/members/${member.id}`} className="mt-4 inline-block text-[13px] text-text-secondary hover:text-primary">
        ← Back to profile
      </Link>
    </PageContainer>
  );
}
