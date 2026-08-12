"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Building2, Save, Loader2, Phone, Globe, MapPin, AtSign,
  Building, User, Lock, Eye, EyeOff, KeyRound, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { businessAPI, type UpdateBusinessCommand } from "@/infrastructure/api/businessAPI";
import { mainAuthAPI } from "@/infrastructure/api/mainAuthAPI";
import { cn } from "@/lib/utils";

// ── Form Types ────────────────────────────────────────────────────────────────

interface PersonalProfileForm {
  fullName: string;
  phoneNumber?: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function TenantSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{ email: string; name: string } | null>(null);

  // Business form
  const { register: regBiz, handleSubmit: handleBiz, reset: resetBiz, formState: { errors: errBiz, isDirty: isDirtyBiz } } =
    useForm<UpdateBusinessCommand>({
      defaultValues: { businessName: "", hotLine: "", websiteUrl: "", addressLine: "" },
    });

  // Personal profile form
  const { register: regPersonal, handleSubmit: handlePersonal, reset: resetPersonal, formState: { errors: errPersonal, isDirty: isDirtyPersonal } } =
    useForm<PersonalProfileForm>({ defaultValues: { fullName: "", phoneNumber: "" } });

  // Change password form
  const { register: regPw, handleSubmit: handlePw, reset: resetPw, formState: { errors: errPw }, watch } =
    useForm<ChangePasswordForm>({ defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" } });

  const newPassword = watch("newPassword");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, meRes] = await Promise.all([
          businessAPI.getProfile(),
          mainAuthAPI.getMe()
        ]);

        if (profileRes.data) {
          resetBiz({
            businessName: profileRes.data.businessName || "",
            hotLine: profileRes.data.hotLine || "",
            websiteUrl: profileRes.data.websiteUrl || "",
            addressLine: profileRes.data.addressLine || "",
          });
        }

        if (meRes.data) {
          setOwnerInfo({ email: meRes.data.email || "", name: meRes.data.fullName || "" });
          resetPersonal({
            fullName: meRes.data.fullName || "",
            phoneNumber: (meRes.data as any).phoneNumber || "",
          });
        }
      } catch (err) {
        toast.error("Không thể tải thông tin doanh nghiệp");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [resetBiz, resetPersonal]);

  // ── Submit Handlers ──────────────────────────────────────────────────────────

  const onSubmitBiz = async (data: UpdateBusinessCommand) => {
    setSaving(true);
    try {
      await businessAPI.updateProfile(data);
      toast.success("Cập nhật thông tin doanh nghiệp thành công");
      resetBiz(data);
    } catch (err: any) {
      toast.error("Cập nhật thất bại", { description: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  };

  const onSubmitPersonal = async (data: PersonalProfileForm) => {
    setSavingPersonal(true);
    try {
      await mainAuthAPI.updateProfile(data);
      toast.success("Cập nhật thông tin cá nhân thành công");
      setOwnerInfo(prev => ({ ...prev!, name: data.fullName }));
      resetPersonal(data);
    } catch (err: any) {
      toast.error("Cập nhật thất bại", { description: err.response?.data?.message || err.message });
    } finally {
      setSavingPersonal(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordForm) => {
    setSavingPassword(true);
    try {
      await mainAuthAPI.changePassword(data);
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      resetPw();
    } catch (err: any) {
      toast.error("Đổi mật khẩu thất bại", { description: err.response?.data?.message || err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Field Helper ──────────────────────────────────────────────────────────────

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
            className={cn("pl-9 bg-background", errBiz[id] && "border-red-500 focus-visible:ring-red-500")}
            {...regBiz(id, { required: required ? "Trường này là bắt buộc" : false })}
          />
        </div>
        {errBiz[id] && <p className="text-xs text-red-500">{errBiz[id]?.message}</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Card 1: Hồ sơ doanh nghiệp ──────────────────────────────────── */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-primary" />
            Hồ sơ doanh nghiệp
          </CardTitle>
          <CardDescription>
            Cập nhật thông tin hiển thị của cửa hàng trên widget chatbot.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <form onSubmit={handleBiz(onSubmitBiz)} className="space-y-8">
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
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={!isDirtyBiz || saving} className="gap-2 min-w-32 shadow-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Card 2: Thông tin cá nhân ─────────────────────────────────────── */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>
            Cập nhật họ tên và số điện thoại cá nhân của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <form onSubmit={handlePersonal(onSubmitPersonal)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Họ tên */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className={cn("pl-9 bg-background", errPersonal.fullName && "border-red-500")}
                    placeholder="Nguyễn Văn A"
                    {...regPersonal("fullName", { required: "Vui lòng nhập họ tên" })}
                  />
                </div>
                {errPersonal.fullName && <p className="text-xs text-red-500">{errPersonal.fullName.message}</p>}
              </div>

              {/* Số điện thoại */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9 bg-background"
                    placeholder="0901234567"
                    {...regPersonal("phoneNumber")}
                  />
                </div>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9 bg-background text-muted-foreground"
                  value={ownerInfo?.email || ""}
                  readOnly
                  disabled
                />
              </div>
              <p className="text-[11px] text-muted-foreground/70 italic">Email không thể thay đổi.</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={!isDirtyPersonal || savingPersonal} className="gap-2 min-w-32 shadow-sm">
                {savingPersonal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {savingPersonal ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── Card 3: Đổi mật khẩu ─────────────────────────────────────────── */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-5">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-primary" />
            Đổi mật khẩu
          </CardTitle>
          <CardDescription>
            Bảo mật tài khoản bằng cách thay đổi mật khẩu định kỳ.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-8">
          <div className="flex justify-center">
            <form onSubmit={handlePw(onSubmitPassword)} className="space-y-4 w-full max-w-md">
              {/* Mật khẩu hiện tại */}
              <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  className={cn("pl-9 pr-10 bg-background", errPw.currentPassword && "border-red-500")}
                  placeholder="Nhập mật khẩu hiện tại"
                  {...regPw("currentPassword", { required: "Vui lòng nhập mật khẩu hiện tại" })}
                />
                <button type="button" onClick={() => setShowCurrentPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errPw.currentPassword && <p className="text-xs text-red-500">{errPw.currentPassword.message}</p>}
            </div>

            {/* Mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showNewPw ? "text" : "password"}
                  className={cn("pl-9 pr-10 bg-background", errPw.newPassword && "border-red-500")}
                  placeholder="Ít nhất 8 ký tự"
                  {...regPw("newPassword", {
                    required: "Vui lòng nhập mật khẩu mới",
                    minLength: { value: 8, message: "Mật khẩu tối thiểu 8 ký tự" }
                  })}
                />
                <button type="button" onClick={() => setShowNewPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errPw.newPassword && <p className="text-xs text-red-500">{errPw.newPassword.message}</p>}
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showConfirmPw ? "text" : "password"}
                  className={cn("pl-9 pr-10 bg-background", errPw.confirmNewPassword && "border-red-500")}
                  placeholder="Nhập lại mật khẩu mới"
                  {...regPw("confirmNewPassword", {
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: v => v === newPassword || "Mật khẩu xác nhận không khớp"
                  })}
                />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errPw.confirmNewPassword && <p className="text-xs text-red-500">{errPw.confirmNewPassword.message}</p>}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={savingPassword} variant="destructive" className="gap-2 w-full shadow-sm">
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {savingPassword ? "Đang đổi..." : "Xác nhận đổi mật khẩu"}
              </Button>
            </div>
            </form>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
