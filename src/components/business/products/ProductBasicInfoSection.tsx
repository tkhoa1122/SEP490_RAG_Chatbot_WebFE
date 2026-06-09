"use client";

import { cn } from "@/lib/utils";
import type { BasicInfo, Category } from "@/application/hooks/useProductForm";

interface ProductBasicInfoSectionProps {
  basicInfo: BasicInfo;
  categories: Category[];
  onChange: <K extends keyof BasicInfo>(key: K, value: BasicInfo[K]) => void;
}

export function ProductBasicInfoSection({
  basicInfo,
  categories,
  onChange,
}: ProductBasicInfoSectionProps) {
  const inputBase = cn(
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
    "placeholder:text-muted-foreground outline-none transition-all",
    "focus:border-ring focus:ring-2 focus:ring-ring/20"
  );

  return (
    <div className="space-y-5">
      {/* Product Name */}
      <div className="space-y-1.5">
        <label htmlFor="product-name" className="text-sm font-medium text-foreground">
          Tên sản phẩm <span className="text-destructive">*</span>
        </label>
        <input
          id="product-name"
          type="text"
          placeholder="VD: Áo Thun Cotton Oversize Unisex"
          value={basicInfo.name}
          onChange={(e) => onChange("name", e.target.value)}
          className={cn(inputBase, "h-10")}
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label htmlFor="category" className="text-sm font-medium text-foreground">
          Danh mục <span className="text-destructive">*</span>
        </label>
        <select
          id="category"
          value={basicInfo.categoryId}
          onChange={(e) => onChange("categoryId", e.target.value)}
          className={cn(
            inputBase,
            "h-10 cursor-pointer appearance-none bg-background pr-8",
            "[background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
            "[background-repeat:no-repeat] [background-position:right_0.75rem_center]"
          )}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          Mô tả sản phẩm
        </label>
        <textarea
          id="description"
          rows={4}
          placeholder="Mô tả chi tiết về sản phẩm, chất liệu, xuất xứ..."
          value={basicInfo.description}
          onChange={(e) => onChange("description", e.target.value)}
          className={cn(inputBase, "resize-none leading-relaxed")}
        />
        <p className="text-xs text-muted-foreground text-right">
          {basicInfo.description.length} / 500 ký tự
        </p>
      </div>
    </div>
  );
}
