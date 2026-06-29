"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Building2, Save, Loader2, Phone, Globe, MapPin, AtSign, Building } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { businessAPI, type UpdateBusinessCommand } from "@/infrastructure/api/businessAPI";
import { cn } from "@/lib/utils";

export function TenantSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{ email: string; name: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<UpdateBusinessCommand>({
    defaultValues: {
      businessName: "",
      hotLine: "",
      websiteUrl: "",
      addressLine: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await businessAPI.getProfile();
        if (res.data) {
          reset({
            businessName: res.data.businessName || "",
            hotLine: res.data.hotLine || "",
            websiteUrl: res.data.websiteUrl || "",
            addressLine: res.data.addressLine || "",
          });
          setOwnerInfo({
            email: res.data.businessOwnerEmail || "",
            name: res.data.businessOwnerName || "",
          });
        }
      } catch (err) {
        toast.error("Không thể tải thông tin doanh nghiệp");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: UpdateBusinessCommand) => {
    setSaving(true);
    try {
      await businessAPI.updateProfile(data);
      toast.success("Cập nhật thông tin thành công");
      // Reset isDirty state by re-setting current values
      reset(data);
    } catch (err: any) {
      toast.error("Cập nhật thất bại", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    id: keyof UpdateBusinessCommand,
    icon: React.ElementType,
    placeholder: string,
    required: boolean = false
  ) => {
    const Icon = icon;
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={id}
            placeholder={placeholder}
            className={cn("pl-9 bg-background", errors[id] && "border-red-500 focus-visible:ring-red-500")}
            {...register(id, { required: required ? "Trường này là bắt buộc" : false })}
          />
        </div>
        {errors[id] && <p className="text-xs text-red-500">{errors[id]?.message}</p>}
      </div>
    );
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/50">
      <CardHeader className="border-b bg-muted/20 pb-5">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="h-5 w-5 text-primary" />
          Hồ sơ doanh nghiệp
        </CardTitle>
        <CardDescription className="text-sm">
          Cập nhật thông tin hiển thị của cửa hàng trên widget chatbot. Các trường có dấu <span className="text-red-500">*</span> là bắt buộc.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-8 pb-8">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                {field("Tên doanh nghiệp / Cửa hàng", "businessName", Building, "VD: Eco Fashion", true)}
                {field("Hotline hỗ trợ", "hotLine", Phone, "VD: 0901234567")}
              </div>
              <div className="space-y-6">
                {field("Website", "websiteUrl", Globe, "VD: https://ecofashion.vn", true)}
                {field("Địa chỉ", "addressLine", MapPin, "VD: 123 Đường ABC, Quận 1, TP.HCM")}
              </div>
            </div>

            {/* Read-only Owner Info */}
            <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-primary/5 p-6 mt-8">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Building2 className="h-24 w-24" />
              </div>
              <h4 className="text-sm font-semibold mb-4 text-foreground/80 flex items-center gap-2">
                <AtSign className="h-4 w-4" /> Thông tin người đại diện (Chủ sở hữu)
              </h4>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 relative z-10">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tên hiển thị</p>
                  <p className="text-sm font-medium text-foreground">{ownerInfo?.name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email liên hệ</p>
                  <p className="text-sm font-medium text-foreground">{ownerInfo?.email || "—"}</p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-muted-foreground/70 italic">
                * Thông tin đại diện được tạo ban đầu và không thể tự thay đổi. Vui lòng liên hệ Admin nếu cần hỗ trợ.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={!isDirty || saving} className="gap-2 min-w-32 shadow-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
