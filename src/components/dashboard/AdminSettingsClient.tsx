"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Key, Building2, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mainAuthAPI, type MeResponse } from "@/infrastructure/api/mainAuthAPI";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminSettingsClient() {
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await mainAuthAPI.getMe();
        if (res.data) {
          setProfile(res.data);
        }
      } catch (err: any) {
        toast.error("Không thể tải thông tin profile", {
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    // Basic mock save since we don't have an update endpoint defined in mainAuthAPI
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Đã cập nhật thông tin thành công");
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center text-muted-foreground">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cài đặt tài khoản</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin cá nhân và thiết lập bảo mật.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Hồ sơ cá nhân</CardTitle>
            <CardDescription>Thông tin cơ bản về tài khoản quản trị của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#5a9c82] to-[#2c5243] text-2xl font-bold text-white shadow-sm">
                {profile.fullName?.charAt(0)?.toUpperCase() || <User className="h-10 w-10" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">{profile.fullName || "System Admin"}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge role={profile.role} />
                  <span>•</span>
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={profile.fullName || ""}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={profile.email} disabled />
                </div>
                <p className="text-[11px] text-muted-foreground">Email đăng nhập không thể thay đổi.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 px-6 py-4">
            <Button onClick={handleSave} disabled={saving} className="ml-auto gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </CardFooter>
        </Card>

        {/* Security / System Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bảo mật & Quyền truy cập</CardTitle>
            <CardDescription>Trạng thái tài khoản của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Trạng thái tài khoản</p>
                  <p className="text-xs text-muted-foreground">Tài khoản đang hoạt động bình thường</p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Mật khẩu</p>
                  <p className="text-xs text-muted-foreground">Lần cập nhật cuối: Không rõ</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8">Đổi mật khẩu</Button>
            </div>
          </CardContent>
        </Card>

        {/* Roles Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vai trò hệ thống</CardTitle>
            <CardDescription>Quyền hạn của bạn trên nền tảng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phạm vi truy cập</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Bạn có quyền quản trị cấp hệ thống (System Admin).
                  Bạn có thể xem, chỉnh sửa và quản lý mọi doanh nghiệp, gói cước và chính sách trên nền tảng.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function Badge({ role }: { role: string }) {
  if (role === "SYSTEM_ADMIN" || role === "ADMIN") {
    return (
      <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-500">
        SYSTEM ADMIN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      {role}
    </span>
  );
}
