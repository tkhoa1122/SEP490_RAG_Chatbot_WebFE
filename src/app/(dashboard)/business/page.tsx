import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tổng quan" };

// Business Dashboard — BUSINESS_OWNER + CATALOG_MARKETING
// Middleware + layout đã guard, page chỉ render UI
export default function BusinessDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý sản phẩm, danh mục và xem phân tích kinh doanh.
        </p>
      </div>
      {/* TODO: StatsCard grid, RecentActivity, QuickActions */}
    </div>
  );
}
