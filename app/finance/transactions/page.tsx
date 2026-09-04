import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FinanceTabs } from "@/components/finance/finance-tabs";
import { TransactionTable } from "@/components/finance/transaction-table";

export const metadata: Metadata = {
  title: "Transactions — Birhane Genet St. Mary Church",
};

export default function TransactionsPage() {
  return (
    <PageContainer>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/dashboard" },
          { label: "Financial Management", href: "/finance" },
          { label: "Transactions" },
        ]}
        title="Financial Management"
        actions={<Button icon={<Plus size={16} />}>Add Transaction</Button>}
      />

      <FinanceTabs />

      <Card>
        <TransactionTable />
      </Card>
    </PageContainer>
  );
}
