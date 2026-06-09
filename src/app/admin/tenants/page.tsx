"use client";

import { TenantStatsCards } from "@/components/dashboard/TenantStatsCards";
import { TenantDataTable } from "@/components/dashboard/TenantDataTable";

export default function TenantsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Quản lý Doanh nghiệp
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem, duyệt, và quản lý tất cả cửa hàng đang thuê nền tảng Smart Shopping SaaS.
        </p>
      </div>

      {/* Stats cards */}
      <TenantStatsCards />

      {/* Data table */}
      <TenantDataTable />
    </div>
  );
}
