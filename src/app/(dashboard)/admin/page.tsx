import type { Metadata } from "next";
export const metadata: Metadata = { title: "Admin Overview" };
export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
      <p className="text-muted-foreground">Quản lý toàn bộ nền tảng SaaS.</p>
      {/* TODO: PlatformStats, ActiveTenants, SystemHealth */}
    </div>
  );
}
