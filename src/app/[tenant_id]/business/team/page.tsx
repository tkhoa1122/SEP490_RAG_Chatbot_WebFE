import type { Metadata } from "next";
import { CatalogTeamManager } from "@/components/business/settings/CatalogTeamManager";

export const metadata: Metadata = { title: "Quản lý nhân sự | Smart Shopping Chatbot" };

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Quản lý nhân sự
        </h1>
        <p className="text-muted-foreground mt-2">
          Quản lý nhân viên vận hành và phân quyền truy cập.
        </p>
      </div>

      <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
        <CatalogTeamManager />
      </div>
    </div>
  );
}
