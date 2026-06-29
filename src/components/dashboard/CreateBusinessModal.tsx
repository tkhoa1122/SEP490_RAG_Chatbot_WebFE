"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { businessAPI } from "@/infrastructure/api/businessAPI";
import type { BusinessRegistrationCommand } from "@/infrastructure/dto/BusinessDTO";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateBusinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateBusinessModal({ open, onOpenChange, onSuccess }: CreateBusinessModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessRegistrationCommand>();

  const onSubmit = async (data: BusinessRegistrationCommand) => {
    try {
      setLoading(true);
      
      const payload = { ...data };
      if (!payload.hotLine) delete payload.hotLine;
      if (!payload.addressLine) delete payload.addressLine;
      
      await businessAPI.create(payload);
      toast.success("Tạo doanh nghiệp mới thành công!");
      reset(); // Xóa form
      onSuccess(); // Refresh bảng
      onOpenChange(false); // Đóng modal
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Đã xảy ra lỗi khi tạo doanh nghiệp.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Thêm doanh nghiệp mới</DialogTitle>
          <DialogDescription>
            Tạo tài khoản doanh nghiệp (tenant) mới trên nền tảng. Doanh nghiệp sẽ được tạo ở trạng thái Chờ duyệt.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">
                Tên doanh nghiệp <span className="text-red-500">*</span>
              </label>
              <input
                {...register("businessName", { required: "Vui lòng nhập tên doanh nghiệp" })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="VD: Smart Shop"
                disabled={loading}
              />
              {errors.businessName && (
                <p className="text-[11px] text-red-500">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium">
                Email chủ shop <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("businessOwnerEmail", {
                  required: "Vui lòng nhập email",
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không hợp lệ" }
                })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="owner@example.com"
                disabled={loading}
              />
              {errors.businessOwnerEmail && (
                <p className="text-[11px] text-red-500">{errors.businessOwnerEmail.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium">
                Tên chủ shop <span className="text-red-500">*</span>
              </label>
              <input
                {...register("businessOwnerName", { required: "Vui lòng nhập tên chủ shop" })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Nguyễn Văn A"
                disabled={loading}
              />
              {errors.businessOwnerName && (
                <p className="text-[11px] text-red-500">{errors.businessOwnerName.message}</p>
              )}
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium">Hotline</label>
              <input
                {...register("hotLine")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="0912345678"
                disabled={loading}
              />
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium">URL Website</label>
              <input
                {...register("websiteUrl")}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Địa chỉ</label>
              <input
                {...register("addressLine")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="123 Nguyễn Văn Cừ, Q5, TP.HCM"
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo doanh nghiệp
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
