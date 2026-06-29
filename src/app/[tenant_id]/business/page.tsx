import type { Metadata } from "next";
import { BusinessOverviewDashboard } from "@/components/dashboard/BusinessOverviewDashboard";

export const metadata: Metadata = { title: "Tổng quan" };

// Business Dashboard — BUSINESS_OWNER + CATALOG_MARKETING
// Middleware + layout đã guard, page chỉ render UI
export default async function BusinessDashboardPage({ params }: { params: Promise<{ tenant_id: string }> }) {
  const { tenant_id } = await params;
  
  return (
    <BusinessOverviewDashboard tenantId={tenant_id} />
  );
}
