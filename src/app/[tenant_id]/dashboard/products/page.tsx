import type { Metadata } from "next";
export const metadata: Metadata = { title: "Quản lý sản phẩm" };
export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
      {/* TODO: ProductsDataTable, AddProductButton */}
    </div>
  );
}
