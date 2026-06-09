"use client";

import { Building2, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  accentClass: string;
}

function StatCard({ label, value, subtext, icon: Icon, trend, accentClass }: StatCardProps) {
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
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
          <div className="mt-1 flex items-center gap-1.5">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  trend.positive
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-red-500/10 text-red-600"
                )}
              >
                <TrendingUp
                  className={cn("h-3 w-3", !trend.positive && "rotate-180")}
                />
                {trend.value}
              </span>
            )}
            <span className="truncate text-[11px] text-muted-foreground">{subtext}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TenantStatsCards() {
  const stats: StatCardProps[] = [
    {
      label: "Tổng số doanh nghiệp",
      value: "128",
      subtext: "trên nền tảng",
      icon: Building2,
      trend: { value: "+12%", positive: true },
      accentClass: "bg-indigo-500/10 text-indigo-600",
    },
    {
      label: "Chờ duyệt",
      value: "5",
      subtext: "đang đợi phê duyệt",
      icon: Clock,
      accentClass: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "Doanh thu tháng này",
      value: "₫ 245.6M",
      subtext: "so với tháng trước",
      icon: TrendingUp,
      trend: { value: "+8.2%", positive: true },
      accentClass: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
