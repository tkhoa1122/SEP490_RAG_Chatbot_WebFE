import type { Metadata } from "next";
import { ChatLogsClient } from "@/components/business/chat-logs/ChatLogsClient";

export const metadata: Metadata = { title: "Lịch sử Chat Khách hàng" };

export default function ChatLogsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
  // Pass the promise directly to the client component to be unwrapped with React.use()
  const tenantIdPromise = params.then(p => p.tenant_id);

  return <ChatLogsClient tenantIdPromise={tenantIdPromise} />;
}
