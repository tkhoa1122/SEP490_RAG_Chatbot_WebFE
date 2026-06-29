import type { Metadata } from "next";
import { ProductsClient } from "@/components/business/products/ProductsClient";

export const metadata: Metadata = { title: "Quản lý sản phẩm" };

export default function ProductsPage({ params }: { params: Promise<{ tenant_id: string }> }) {
  // Pass the promise directly to the client component to be unwrapped with React.use()
  const tenantIdPromise = params.then(p => p.tenant_id);

  return <ProductsClient tenantIdPromise={tenantIdPromise} />;
}
