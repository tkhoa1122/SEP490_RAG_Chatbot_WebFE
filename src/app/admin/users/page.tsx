import type { Metadata } from "next";
import { UsersDataTable } from "@/components/dashboard/UsersDataTable";

export const metadata: Metadata = { title: "Quản lý Users" };

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý Người dùng</h1>
      <UsersDataTable />
    </div>
  );
}
