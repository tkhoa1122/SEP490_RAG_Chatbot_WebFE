"use client";

import { useRef } from "react";
import { ImagePlus, X, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Variant } from "@/application/hooks/useProductForm";

// ─── Currency formatter ──────────────────────────────────────────────────────
function formatCurrency(value: string) {
  const num = parseInt(value.replace(/\D/g, ""), 10);
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
}

// ─── Variant Image Cell ──────────────────────────────────────────────────────
function ImageUploadCell({
  variantId,
  file,
  onUpload,
}: {
  variantId: string;
  file: File | null;
  onUpload: (variantId: string, file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex items-center gap-2">
      {preview ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="variant" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onUpload(variantId, null)}
            className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl-lg bg-destructive/80 text-white"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-border",
            "text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          )}
          aria-label="Thêm ảnh biến thể"
        >
          <ImagePlus className="h-4 w-4" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(variantId, f);
        }}
      />
    </div>
  );
}

// ─── Variants Table Component ─────────────────────────────────────────────────

interface ProductVariantsTableProps {
  variants: Variant[];
  onUpdateField: (variantId: string, field: "sku" | "price" | "stock", value: string) => void;
  onUpdateImage: (variantId: string, file: File | null) => void;
}

export function ProductVariantsTable({
  variants,
  onUpdateField,
  onUpdateImage,
}: ProductVariantsTableProps) {
  if (variants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-14 text-center">
        <Layers className="mb-3 h-9 w-9 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">Chưa có biến thể nào</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Thêm thuộc tính và giá trị ở Phần 2 để tự động tạo biến thể
        </p>
      </div>
    );
  }

  // Derive attribute columns from first variant
  const attrColumns = Object.keys(variants[0]?.combination ?? {});

  const cellInput = cn(
    "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs",
    "outline-none transition-all placeholder:text-muted-foreground/60",
    "focus:border-ring focus:ring-2 focus:ring-ring/20"
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {/* Attribute columns */}
            {attrColumns.map((col) => (
              <TableHead key={col} className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {col}
              </TableHead>
            ))}
            <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Mã SKU
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Giá bán (VNĐ)
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tồn kho
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ảnh biến thể
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id} className="group">
              {/* Combination values */}
              {attrColumns.map((col) => (
                <TableCell key={col} className="px-4">
                  <Badge
                    variant="outline"
                    className="rounded-full px-2.5 text-xs font-medium"
                  >
                    {variant.combination[col]}
                  </Badge>
                </TableCell>
              ))}

              {/* SKU */}
              <TableCell className="px-4 py-2">
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => onUpdateField(variant.id, "sku", e.target.value)}
                  placeholder="SKU-001"
                  className={cn(cellInput, "min-w-[120px] font-mono")}
                />
              </TableCell>

              {/* Price */}
              <TableCell className="px-4 py-2">
                <div className="relative">
                  <input
                    type="text"
                    value={formatCurrency(variant.price)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      onUpdateField(variant.id, "price", raw);
                    }}
                    placeholder="0"
                    className={cn(cellInput, "min-w-[110px] pr-8 text-right")}
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground">
                    ₫
                  </span>
                </div>
              </TableCell>

              {/* Stock */}
              <TableCell className="px-4 py-2">
                <input
                  type="number"
                  min={0}
                  value={variant.stock}
                  onChange={(e) => onUpdateField(variant.id, "stock", e.target.value)}
                  placeholder="0"
                  className={cn(cellInput, "min-w-[80px] text-center")}
                />
              </TableCell>

              {/* Image */}
              <TableCell className="px-4 py-2">
                <ImageUploadCell
                  variantId={variant.id}
                  file={variant.imageFile}
                  onUpload={onUpdateImage}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Footer summary */}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2.5">
        <p className="text-xs text-muted-foreground">
          Tổng cộng <span className="font-semibold text-foreground">{variants.length}</span> biến thể
        </p>
        <p className="text-xs text-muted-foreground">
          Tổng tồn kho:{" "}
          <span className="font-semibold text-foreground">
            {variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0).toLocaleString("vi-VN")}
          </span>{" "}
          sản phẩm
        </p>
      </div>
    </div>
  );
}
