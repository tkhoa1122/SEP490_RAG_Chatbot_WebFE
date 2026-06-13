import React from "react";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { FloatingChatbot } from "@/components/chat/FloatingChatbot";

export default async function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant_id: string }>;
}) {
  const { tenant_id } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer tenantId={tenant_id} />
      <FloatingChatbot />
    </div>
  );
}
