"use client";

import { ArrowLeft, Save, Loader2, Package, Layers, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProductForm } from "@/application/hooks/useProductForm";
import { ProductBasicInfoSection } from "@/components/business/products/ProductBasicInfoSection";
import { ProductAttributesSection } from "@/components/business/products/ProductAttributesSection";
import { ProductVariantsTable } from "@/components/business/products/ProductVariantsTable";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    label: "Thông tin cơ bản",
    desc: "Tên, mô tả, danh mục",
    icon: Package,
  },
  {
    id: 2,
    label: "Thuộc tính",
    desc: "Màu sắc, kích cỡ, ...",
    icon: Tag,
  },
  {
    id: 3,
    label: "Biến thể & Giá",
    desc: "SKU, giá, tồn kho",
    icon: Layers,
  },
];

// ─── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({
  currentStep,
  onNavigate,
}: {
  currentStep: number;
  onNavigate: (step: number) => void;
}) {
  return (
    <nav aria-label="Progress" className="flex items-center gap-1">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onNavigate(step.id)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : isDone
                  ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  : "cursor-default text-muted-foreground/50"
              )}
              disabled={step.id > currentStep}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isDone ? "✓" : <Icon className="h-3.5 w-3.5" />}
              </div>
              <div className="hidden text-left sm:block">
                <p className={cn("text-sm font-semibold leading-tight", isActive && "text-primary")}>
                  {step.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{step.desc}</p>
              </div>
            </button>

            {idx < STEPS.length - 1 && (
              <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-muted-foreground/30" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductCreatePage() {
  const params = useParams();
  const tenantId = params.tenant_id as string;
  const {
    basicInfo,
    updateBasicInfo,
    categories,
    attributes,
    addAttribute,
    removeAttribute,
    updateAttributeName,
    updateAttributeDraft,
    confirmAttributeValue,
    removeAttributeValue,
    variants,
    updateVariantField,
    updateVariantImage,
    isSubmitting,
    currentStep,
    setCurrentStep,
    handleSubmit,
  } = useProductForm();

  return (
    <div className="min-h-screen bg-muted/20">
      {/* ── Top Header Bar ── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Breadcrumb + Title */}
            <div className="flex items-center gap-3">
              <Link
                href={`/${tenantId}/dashboard/products`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Link href={`/${tenantId}/dashboard/products`} className="hover:text-foreground">
                    Sản phẩm
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-foreground">Tạo mới</span>
                </div>
                <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
                  Tạo sản phẩm mới
                </h1>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/${tenantId}/dashboard/products`}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium",
                  "text-foreground transition-colors hover:bg-muted"
                )}
              >
                Hủy bỏ
              </Link>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-primary-foreground",
                  "bg-primary transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20",
                  "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu sản phẩm
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-4">
            <Stepper currentStep={currentStep} onNavigate={setCurrentStep} />
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Main form sections */}
          <div className="space-y-6 lg:col-span-2">

            {/* ── Section 1: Basic Info ── */}
            <Card
              className={cn(
                "transition-all duration-200",
                currentStep !== 1 && "opacity-60 ring-0"
              )}
              onClick={() => setCurrentStep(1)}
            >
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Package className="h-4.5 w-4.5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Phần 1 — Thông tin cơ bản</CardTitle>
                    <CardDescription>Tên sản phẩm, danh mục và mô tả</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ProductBasicInfoSection
                  basicInfo={basicInfo}
                  categories={categories}
                  onChange={updateBasicInfo}
                />
              </CardContent>
            </Card>

            {/* ── Section 2: Attributes ── */}
            <Card
              className={cn(
                "transition-all duration-200",
                currentStep !== 2 && "opacity-60 ring-0"
              )}
              onClick={() => setCurrentStep(2)}
            >
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
                      <Tag className="h-4.5 w-4.5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Phần 2 — Thuộc tính & Tùy chọn</CardTitle>
                      <CardDescription>
                        Thêm các thuộc tính để hệ thống tự động sinh biến thể
                      </CardDescription>
                    </div>
                  </div>
                  {attributes.length > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500/15 px-1.5 text-[11px] font-bold text-amber-600">
                      {attributes.length}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ProductAttributesSection
                  attributes={attributes}
                  onAddAttribute={addAttribute}
                  onRemoveAttribute={removeAttribute}
                  onUpdateName={updateAttributeName}
                  onUpdateDraft={updateAttributeDraft}
                  onConfirmValue={confirmAttributeValue}
                  onRemoveValue={removeAttributeValue}
                />
              </CardContent>
            </Card>

            {/* ── Section 3: Variants Table ── */}
            <Card
              className={cn(
                "transition-all duration-200",
                currentStep !== 3 && "opacity-60 ring-0"
              )}
              onClick={() => setCurrentStep(3)}
            >
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
                      <Layers className="h-4.5 w-4.5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Phần 3 — Bảng Biến thể & Giá</CardTitle>
                      <CardDescription>
                        Được tự động tạo từ tổ hợp thuộc tính. Chỉnh SKU, giá và tồn kho trực tiếp.
                      </CardDescription>
                    </div>
                  </div>
                  {variants.length > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-500/15 px-1.5 text-[11px] font-bold text-violet-600">
                      {variants.length}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ProductVariantsTable
                  variants={variants}
                  onUpdateField={updateVariantField}
                  onUpdateImage={updateVariantImage}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary sidebar */}
          <div className="space-y-4">
            {/* Summary card */}
            <Card>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-sm">Tóm tắt sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-3">
                  <SummaryRow
                    label="Tên sản phẩm"
                    value={basicInfo.name || "—"}
                    mono={false}
                  />
                  <SummaryRow
                    label="Danh mục"
                    value={
                      categories.find((c) => c.id === basicInfo.categoryId)?.name || "—"
                    }
                    mono={false}
                  />
                  <Separator />
                  <SummaryRow label="Thuộc tính" value={`${attributes.length} thuộc tính`} />
                  <SummaryRow
                    label="Tổng giá trị"
                    value={`${attributes.reduce((s, a) => s + a.values.length, 0)} tùy chọn`}
                  />
                  <Separator />
                  <SummaryRow label="Tổng biến thể" value={`${variants.length} biến thể`} />
                  <SummaryRow
                    label="Tổng tồn kho"
                    value={`${variants.reduce((s, v) => s + (parseInt(v.stock) || 0), 0).toLocaleString("vi-VN")} sản phẩm`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Attributes overview card */}
            {attributes.some((a) => a.values.length > 0) && (
              <Card>
                <CardHeader className="border-b pb-3">
                  <CardTitle className="text-sm">Thuộc tính đã thêm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {attributes
                    .filter((a) => a.name && a.values.length > 0)
                    .map((attr) => (
                      <div key={attr.id}>
                        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                          {attr.name}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {attr.values.map((v) => (
                            <span
                              key={v.id}
                              className="inline-flex h-5 items-center rounded-full border border-border px-2 text-[10px] font-medium text-foreground"
                            >
                              {v.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Tips card */}
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <p className="mb-2 text-xs font-semibold text-foreground">💡 Hướng dẫn nhanh</p>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li>• Thêm thuộc tính "Màu sắc" với giá trị Đen, Trắng, Xám</li>
                <li>• Thêm thuộc tính "Kích cỡ" với giá trị S, M, L, XL</li>
                <li>• Biến thể sẽ được tự động sinh: 3 màu × 4 size = 12 biến thể</li>
                <li>• Chỉnh SKU, giá và tồn kho ngay trên bảng</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Summary Row helper ───────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right text-xs font-medium text-foreground",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}
