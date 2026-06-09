import type { Metadata } from "next";
export const metadata: Metadata = { title: "Phân tích" };
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Phân tích kinh doanh</h1>
      {/* TODO: RevenueChart, ChatAnalytics, ConversionRate */}
    </div>
  );
}
