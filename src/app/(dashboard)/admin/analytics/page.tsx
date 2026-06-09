import type { Metadata } from "next";
export const metadata: Metadata = { title: "Platform Analytics" };
export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
      {/* TODO: PlatformRevenueChart, TenantGrowthChart, AIUsageStats */}
    </div>
  );
}
