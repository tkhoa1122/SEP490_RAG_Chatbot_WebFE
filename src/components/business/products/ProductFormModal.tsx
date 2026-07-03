"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { ProductDTO, ProductCreateCommand } from "@/infrastructure/dto/ProductDTO";
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
    name: "",
    description: "",
    price: 0,
    currency: "VND",
    brand: "",
    category: "",
    stockQuantity: 0,
  });

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || product.p_name || "",
        description: product.description || product.p_description || "",
        price: product.price ?? product.p_price ?? 0,
        currency: product.currency || product.p_currency || "VND",
        brand: product.brand || "",
        category: product.category || product.p_category || "",
        stockQuantity: product.stockQuantity ?? product.in_stock ?? 0,
      });
    } else if (isOpen && !product) {
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "VND",
        brand: "",
        category: "",
        stockQuantity: 0,
      });
    }
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map sang ProductCreateCommand (External API schema)
      const payload: ProductCreateCommand = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        currency: formData.currency,
        brand: formData.brand || null,
        category: formData.category || null,
        stockQuantity: formData.stockQuantity,
      };

      if (isEdit && (product?.id || product?.product_id)) {
        await productAPI.updateProduct(String(product?.id || product?.product_id), payload);
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Chỉnh sửa thông tin chi tiết của sản phẩm." : "Điền thông tin bên dưới để thêm sản phẩm vào Catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên sản phẩm *</label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="VD: iPhone 15 Pro Max" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Thương hiệu</label>
            <Input name="brand" value={formData.brand} onChange={handleChange} placeholder="VD: Apple" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Giá bán *</label>
              <Input name="price" type="number" min="0" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tiền tệ</label>
              <Input name="currency" value={formData.currency} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục</label>
              <Input name="category" value={formData.category} onChange={handleChange} placeholder="VD: Điện thoại" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Số lượng kho</label>
              <Input name="stockQuantity" type="number" min="0" value={formData.stockQuantity} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả sản phẩm</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Mô tả chi tiết tính năng, thông số..."
            />
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
