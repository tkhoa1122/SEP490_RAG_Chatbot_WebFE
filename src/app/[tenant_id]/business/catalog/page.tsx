import type { Metadata } from "next";
export const metadata: Metadata = { title: "Danh mục & RAG" };
export default function CatalogPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Danh mục & Huấn luyện AI</h1>
      {/* TODO: CatalogUploader, RAGIndexStatus */}
    </div>
  );
}
