"use client";

import { useEffect, useState } from "react";
import { Building2, Clock, ShieldOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { businessAPI } from "@/infrastructure/api/businessAPI";

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  accentClass: string;
  loading?: boolean;
}

function StatCard({ label, value, subtext, icon: Icon, accentClass, loading }: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start gap-4 pt-5">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            accentClass
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {loading ? (
            <div className="mt-1 h-8 w-16 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          )}
          <p className="mt-1 truncate text-[11px] text-muted-foreground">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function TenantStatsCards() {
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [suspended, setSuspended] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Gọi 3 request song song để lấy tổng mỗi nhóm
        const [allRes, pendingRes, suspendedRes] = await Promise.all([
          businessAPI.getAll({ PageSize: 1 }),
          businessAPI.getAll({ Status: "PENDING_APPROVAL", PageSize: 1 }),
          businessAPI.getAll({ Status: "DELETED", PageSize: 1 }),
        ]);
        setTotal(allRes.data?.totalItems ?? allRes.data?.totalCount ?? 0);
        setPending(pendingRes.data?.totalItems ?? pendingRes.data?.totalCount ?? 0);
        setSuspended(suspendedRes.data?.totalItems ?? suspendedRes.data?.totalCount ?? 0);
      } catch {
        // Giữ nguyên 0 nếu lỗi
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard
        label="Tổng số doanh nghiệp"
        value={total.toString()}
        subtext="đang thuê nền tảng"
        icon={Building2}
        accentClass="bg-indigo-500/10 text-indigo-600"
        loading={loading}
      />
      <StatCard
        label="Chờ phê duyệt"
        value={pending.toString()}
        subtext="cần xét duyệt"
        icon={Clock}
        accentClass="bg-amber-500/10 text-amber-600"
        loading={loading}
      />
      <StatCard
        label="Bị khóa / Từ chối"
        value={suspended.toString()}
        subtext="tài khoản bị hạn chế"
        icon={ShieldOff}
        accentClass="bg-red-500/10 text-red-600"
        loading={loading}
      />
    </div>
  );
}
