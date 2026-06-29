import type { Metadata } from "next";
import { ApiKeysManager } from "@/components/business/settings/ApiKeysManager";

export const metadata: Metadata = { title: "API Keys | Smart Shopping Chatbot" };

export default function ApiKeysPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Tích hợp & API Keys
        </h1>
        <p className="text-muted-foreground mt-2">
          Quản lý các khóa bí mật để tích hợp hệ thống của bạn (ERP, POS) với chatbot.
        </p>
      </div>

      <div className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
        <ApiKeysManager />
      </div>
    </div>
  );
}
