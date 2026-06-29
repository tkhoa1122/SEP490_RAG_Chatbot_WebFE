import type { Metadata } from "next";
import { AdminOverviewDashboard } from "@/components/dashboard/AdminOverviewDashboard";

export const metadata: Metadata = { title: "Admin Overview" };

export default function AdminOverviewPage() {
  return (
    <div className="w-full">
      <AdminOverviewDashboard />
    </div>
  );
}
