"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ProductDTO } from "@/infrastructure/dto/ProductDTO";
import { productAPI } from "@/infrastructure/api/productAPI";
import { toast } from "react-hot-toast";

interface ProductFormModalProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: ProductDTO | null; // If null, it's create mode
}

export function ProductFormModal({ tenantId, isOpen, onClose, onSuccess, product }: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    p_name: "",
    p_description: "",
    p_price: 0,
    p_currency: "VND",
    p_category: "",
    in_stock: 0,
    is_active: true,
  });

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        p_name: product.p_name || "",
        p_description: product.p_description || "",
        p_price: product.p_price || 0,
        p_currency: product.p_currency || "VND",
        p_category: product.p_category || "",
        in_stock: product.in_stock || 0,
        is_active: product.is_active ?? true,
      });
    } else if (isOpen && !product) {
      setFormData({
        p_name: "",
        p_description: "",
        p_price: 0,
        p_currency: "VND",
        p_category: "",
        in_stock: 0,
        is_active: true,
      });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: Partial<ProductDTO> = {
        ...formData,
        tenant_id: tenantId,
      };

      if (isEdit && product?.product_id) {
        await productAPI.updateProduct(product.product_id, payload);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await productAPI.createProduct(payload);
        toast.success("Thêm mới sản phẩm thành công");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Save product failed:", error);
      toast.error(isEdit ? "Không thể cập nhật sản phẩm" : "Không thể thêm mới sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Chỉnh sửa thông tin chi tiết của sản phẩm." : "Điền thông tin bên dưới để thêm sản phẩm vào Catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên sản phẩm *</label>
            <Input name="p_name" value={formData.p_name} onChange={handleChange} required placeholder="VD: iPhone 15 Pro Max" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá bán *</label>
              <Input name="p_price" type="number" min="0" value={formData.p_price} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiền tệ</label>
              <Input name="p_currency" value={formData.p_currency} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục</label>
              <Input name="p_category" value={formData.p_category} onChange={handleChange} placeholder="VD: Điện thoại" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số lượng kho (Tồn)</label>
              <Input name="in_stock" type="number" min="0" value={formData.in_stock} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả sản phẩm</label>
            <textarea
              name="p_description"
              value={formData.p_description}
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Mô tả chi tiết tính năng, thông số..."
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
              Sản phẩm đang được bán (Active)
            </label>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
