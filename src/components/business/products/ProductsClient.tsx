"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, UploadCloud, History } from "lucide-react";
import { ProductDataTable } from "@/components/business/products/ProductDataTable";
import { ProductFormModal } from "@/components/business/products/ProductFormModal";
import { ImportProductsModal } from "@/components/business/products/ImportProductsModal";
import { ProductDTO } from "@/infrastructure/dto/ProductDTO";

export function ProductsClient({ tenantIdPromise }: { tenantIdPromise: Promise<string> }) {
  const tenantId = use(tenantIdPromise);
  const router = useRouter();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: ProductDTO) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý danh mục hàng hóa, thêm sửa xóa và import hàng loạt.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/${tenantId}/business/products/import-logs`)} 
            className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
          >
            <History className="h-4 w-4" />
            Lịch sử Import
          </Button>
          <Button variant="outline" onClick={() => setIsImportOpen(true)} className="gap-2">
            <UploadCloud className="h-4 w-4" />
            Import CSV
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <ProductDataTable 
        tenantId={tenantId} 
        onEdit={handleEdit} 
        refreshTrigger={refreshTrigger}
      />

      <ProductFormModal
        tenantId={tenantId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSuccess}
        product={editingProduct}
      />

      <ImportProductsModal
        tenantId={tenantId}
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
