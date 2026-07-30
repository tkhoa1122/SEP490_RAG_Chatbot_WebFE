import type { Metadata } from "next";
import { ImportLogsClient } from "@/components/business/products/ImportLogsClient";

export const metadata: Metadata = { title: "Lịch sử Import Sản phẩm" };

export default function ImportLogsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
  // Pass the promise directly to the client component to be unwrapped with React.use()
  const tenantIdPromise = params.then(p => p.tenant_id);

  return <ImportLogsClient tenantIdPromise={tenantIdPromise} />;
}
