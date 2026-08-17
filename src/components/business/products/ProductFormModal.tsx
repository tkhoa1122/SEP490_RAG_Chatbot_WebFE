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
    externalId: "",
    name: "",
    description: "",
    externalProductUrl: "",
    price: 0,
    currency: "VND",
    brand: "",
    category: "",
    stockQuantity: 0,
    images: "",
    metadataStr: "",
  });

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        externalId: product.externalId || "",
        name: product.name || product.p_name || "",
        description: product.description || product.p_description || "",
        externalProductUrl: (product as any).externalProductUrl || "",
        price: product.price ?? product.p_price ?? 0,
        currency: product.currency || product.p_currency || "VND",
        brand: product.brand || "",
        category: product.category || product.p_category || "",
        stockQuantity: product.stockQuantity ?? product.in_stock ?? 0,
        images: product.images ? product.images.join(", ") : (product.p_image_url || ""),
        metadataStr: product.metadata ? Object.entries(product.metadata).map(([k, v]) => `${k}: ${v}`).join("\n") : "",
      });
    } else if (isOpen && !product) {
      setFormData({
        externalId: "",
        name: "",
        description: "",
        externalProductUrl: "",
        price: 0,
        currency: "VND",
        brand: "",
        category: "",
        stockQuantity: 0,
        images: "",
        metadataStr: "",
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
      // Validate metadata
      const metadataLines = formData.metadataStr.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const hasInvalidMetadata = metadataLines.some(line => !line.includes(':'));
      
      if (hasInvalidMetadata) {
        toast.error("Vui lòng nhập Metadata đúng định dạng 'Tên: Giá trị'. Dòng không có dấu hai chấm (:) sẽ bị lỗi.");
        setLoading(false);
        return;
      }

      if (formData.price < 0) {
        toast.error("Giá bán không được nhỏ hơn 0");
        setLoading(false);
        return;
      }

      if (formData.stockQuantity < 0) {
        toast.error("Số lượng kho không được nhỏ hơn 0");
        setLoading(false);
        return;
      }

      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

      if (formData.externalProductUrl && !urlRegex.test(formData.externalProductUrl)) {
        toast.error("URL Sản phẩm không hợp lệ");
        setLoading(false);
        return;
      }

      const imageList = formData.images ? formData.images.split(",").map(url => url.trim()).filter(url => url !== "") : [];
      const invalidImages = imageList.filter(url => !urlRegex.test(url));
      if (invalidImages.length > 0) {
        toast.error("Một hoặc nhiều URL Hình ảnh không hợp lệ");
        setLoading(false);
        return;
      }

      const metadataRecord: Record<string, string> = {};
      metadataLines.forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length > 0) {
          metadataRecord[key.trim()] = rest.join(':').trim();
        }
      });

      // Map sang ProductCreateCommand (External API schema)
      const payload: ProductCreateCommand = {
        externalId: formData.externalId || null,
        name: formData.name,
        description: formData.description,
        externalProductUrl: formData.externalProductUrl || null,
        price: formData.price,
        currency: formData.currency,
        brand: formData.brand || null,
        category: formData.category || null,
        stockQuantity: formData.stockQuantity,
        images: imageList.length > 0 ? imageList : null,
        metadata: Object.keys(metadataRecord).length > 0 ? metadataRecord : null,
      };

      if (isEdit && (product?.externalId || product?.id || product?.product_id)) {
        await productAPI.updateProduct(String(product?.externalId || product?.id || product?.product_id), payload);
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

  const metadataLines = formData.metadataStr.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const hasInvalidMetadata = metadataLines.some(line => !line.includes(':'));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Chỉnh sửa thông tin chi tiết của sản phẩm." : "Điền thông tin bên dưới để thêm sản phẩm vào Catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mã sản phẩm (External ID)</label>
              <Input name="externalId" value={formData.externalId} onChange={handleChange} placeholder="VD: SP001" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thương hiệu</label>
              <Input name="brand" value={formData.brand} onChange={handleChange} placeholder="VD: Apple" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tên sản phẩm *</label>
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="VD: iPhone 15 Pro Max" />
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
            <label className="text-sm font-medium">URL Sản phẩm (Link website gốc)</label>
            <Input name="externalProductUrl" value={formData.externalProductUrl} onChange={handleChange} placeholder="VD: https://dienmayxanh.com/iphone-15" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hình ảnh (Cách nhau bởi dấu phẩy)</label>
            <Input name="images" value={formData.images} onChange={handleChange} placeholder="VD: https://img.com/1.jpg, https://img.com/2.jpg" />
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-violet-700">Thuộc tính mở rộng (Metadata)</label>
            <p className="text-[11px] text-muted-foreground mt-0 mb-1">Mỗi thuộc tính 1 dòng theo định dạng "Tên: Giá trị" (VD: Màu sắc: Đỏ)</p>
            <textarea
              name="metadataStr"
              value={formData.metadataStr}
              onChange={handleChange}
              className={`flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                hasInvalidMetadata 
                  ? "border-red-500 bg-red-50/30 text-red-900 focus-visible:ring-red-500" 
                  : "border-violet-200 bg-violet-50/30"
              }`}
              placeholder="Màu sắc: Đen&#10;Kích cỡ: XL&#10;Chất liệu: Cotton"
            />
            {hasInvalidMetadata && (
              <p className="text-[11px] font-medium text-red-500">
                ⚠️ Phát hiện dòng không đúng định dạng. Vui lòng thêm dấu hai chấm (:) hoặc mỗi thuộc tính phải nằm trên một dòng riêng biệt.
              </p>
            )}
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
