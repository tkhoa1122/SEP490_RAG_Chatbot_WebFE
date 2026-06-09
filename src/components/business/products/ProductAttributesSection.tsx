"use client";

import { X, Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Attribute } from "@/application/hooks/useProductForm";

interface ProductAttributesSectionProps {
  attributes: Attribute[];
  onAddAttribute: () => void;
  onRemoveAttribute: (attrId: string) => void;
  onUpdateName: (attrId: string, name: string) => void;
  onUpdateDraft: (attrId: string, draft: string) => void;
  onConfirmValue: (attrId: string) => void;
  onRemoveValue: (attrId: string, valueId: string) => void;
}

export function ProductAttributesSection({
  attributes,
  onAddAttribute,
  onRemoveAttribute,
  onUpdateName,
  onUpdateDraft,
  onConfirmValue,
  onRemoveValue,
}: ProductAttributesSectionProps) {
  return (
    <div className="space-y-4">
      {attributes.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-10 text-center">
          <Tag className="mb-3 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">Chưa có thuộc tính nào</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Thêm thuộc tính như Màu sắc, Kích cỡ để tạo biến thể sản phẩm
          </p>
        </div>
      )}

      {attributes.map((attr, idx) => (
        <div
          key={attr.id}
          className="group relative rounded-xl border border-border bg-muted/20 p-4 transition-all hover:border-ring/30"
        >
          {/* Header row */}
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
              {idx + 1}
            </div>
            <input
              type="text"
              placeholder="Tên thuộc tính (VD: Màu sắc, Kích cỡ)"
              value={attr.name}
              onChange={(e) => onUpdateName(attr.id, e.target.value)}
              className={cn(
                "flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium",
                "outline-none transition-all placeholder:text-muted-foreground",
                "focus:border-ring focus:ring-2 focus:ring-ring/20"
              )}
            />
            <button
              type="button"
              onClick={() => onRemoveAttribute(attr.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Xóa thuộc tính"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Values area */}
          <div className="flex flex-wrap items-center gap-2">
            {attr.values.map((val) => (
              <Badge
                key={val.id}
                variant="secondary"
                className="group/badge flex h-7 items-center gap-1.5 rounded-full px-3 py-0 text-xs font-medium"
              >
                {val.label}
                <button
                  type="button"
                  onClick={() => onRemoveValue(attr.id, val.id)}
                  className="ml-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`Xóa ${val.label}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}

            {/* Tag input */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Nhập giá trị + Enter"
                value={attr.inputDraft}
                onChange={(e) => onUpdateDraft(attr.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onConfirmValue(attr.id);
                  }
                }}
                className={cn(
                  "h-7 min-w-[140px] rounded-full border border-dashed border-border bg-background px-3 text-xs",
                  "outline-none transition-all placeholder:text-muted-foreground/60",
                  "focus:border-ring focus:bg-background"
                )}
              />
              <button
                type="button"
                onClick={() => onConfirmValue(attr.id)}
                disabled={!attr.inputDraft.trim()}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  attr.inputDraft.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "cursor-not-allowed bg-muted text-muted-foreground"
                )}
                aria-label="Xác nhận giá trị"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {attr.values.length === 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground/60">
              💡 Nhập giá trị rồi nhấn Enter để thêm
            </p>
          )}
        </div>
      ))}

      {/* Add attribute button */}
      <button
        type="button"
        onClick={onAddAttribute}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground",
          "transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        )}
      >
        <Plus className="h-4 w-4" />
        Thêm thuộc tính
      </button>
    </div>
  );
}
