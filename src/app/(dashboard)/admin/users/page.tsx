import type { Metadata } from "next";
export const metadata: Metadata = { title: "Quản lý Users" };
export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Quản lý Người dùng</h1>
      {/* TODO: UsersDataTable, RoleManagement */}
    </div>
  );
}
