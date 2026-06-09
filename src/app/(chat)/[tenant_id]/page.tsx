import type { Metadata } from "next";

interface ChatPageProps {
  params: Promise<{ tenant_id: string }>;
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { tenant_id } = await params;
  return {
    title: `Chat | ${tenant_id}`,
    description: `AI-powered shopping assistant`,
  };
}

// ChatPage — layout đã validate tenant, component chỉ lo render UI
// "use client" sẽ được thêm khi cần hook
export default async function ChatPage({ params }: ChatPageProps) {
  const { tenant_id } = await params;

  return (
    <main className="flex flex-1 flex-col">
      {/* TODO: ChatWidget component — sẽ dùng useChat(tenant_id) hook */}
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground text-sm">
          Chat widget cho <strong>{tenant_id}</strong>
        </p>
      </div>
    </main>
  );
}
