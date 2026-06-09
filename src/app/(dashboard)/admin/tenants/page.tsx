import type { Metadata } from "next";
export const metadata: Metadata = { title: "Quản lý Tenants" };
export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Quản lý Doanh nghiệp</h1>
      {/* TODO: TenantsDataTable, CreateTenantButton */}
    </div>
  );
}
