"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { businessAPI } from "@/infrastructure/api/businessAPI";
import { subscriptionAPI, paymentAPI } from "@/infrastructure/api/subscriptionAPI";
import {
  Building2,
  CreditCard,
  Package,
  Activity,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export function AdminOverviewDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalSubscriptions: 0,
    totalPayments: 0,
    totalRevenue: 0,
  });

  const [businessStatusData, setBusinessStatusData] = useState<any[]>([]);
  const [revenueHistoryData, setRevenueHistoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch counts from APIs
        const [
          businessesRes,
          activeBusRes,
          pendingBusRes,
          rejectedBusRes,
          subsRes,
          paymentsRes,
        ] = await Promise.all([
          businessAPI.getAll({ PageSize: 1 }),
          businessAPI.getAll({ PageSize: 1, Status: "ACTIVE" }),
          businessAPI.getAll({ PageSize: 1, Status: "PENDING_APPROVAL" }),
          businessAPI.getAll({ PageSize: 1, Status: "REJECTED" }),
          subscriptionAPI.getAll({ "Filter.PageSize": 1 }),
          paymentAPI.getAll({ "Filter.PageSize": 100 }), // Fetch more to aggregate revenue
        ]);

        const payments = paymentsRes.data?.items || [];
        const totalRevenue = payments
          .filter((p) => p.status === "Completed")
          .reduce((sum, p) => sum + (p.amount || 0), 0);

        setStats({
          totalBusinesses: businessesRes.data?.totalItems ?? businessesRes.data?.totalCount ?? 0,
          totalSubscriptions: subsRes.data?.totalItems ?? subsRes.data?.totalCount ?? 0,
          totalPayments: paymentsRes.data?.totalItems ?? paymentsRes.data?.totalCount ?? 0,
          totalRevenue,
        });

        // Format data for Business Status Bar Chart
        setBusinessStatusData([
          {
            name: "Hoạt động",
            count: activeBusRes.data?.totalItems ?? activeBusRes.data?.totalCount ?? 0,
            fill: "#10b981", // Emerald 500
          },
          {
            name: "Chờ duyệt",
            count: pendingBusRes.data?.totalItems ?? pendingBusRes.data?.totalCount ?? 0,
            fill: "#f59e0b", // Amber 500
          },
          {
            name: "Từ chối",
            count: rejectedBusRes.data?.totalItems ?? rejectedBusRes.data?.totalCount ?? 0,
            fill: "#ef4444", // Red 500
          },
        ]);

        // Calculate Revenue History for the last 6 months
        const monthlyRevenue = new Map<string, number>();
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
          monthlyRevenue.set(key, 0);
        }

        payments
          .filter((p) => p.status === "Completed" && p.createdAt)
          .forEach((p) => {
            const d = new Date(p.createdAt!);
            const key = `T${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
            if (monthlyRevenue.has(key)) {
              monthlyRevenue.set(key, monthlyRevenue.get(key)! + (p.amount || 0));
            }
          });

        const historyData = Array.from(monthlyRevenue.entries()).map(([name, total]) => ({
          name,
          total,
        }));
        setRevenueHistoryData(historyData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p>Đang tải dữ liệu tổng quan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground">Quản lý toàn bộ nền tảng SaaS.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh nghiệp</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Các doanh nghiệp đăng ký nền tảng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gói cước hoạt động</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Gói Subscription trên hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lượt giao dịch</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Thanh toán được ghi nhận
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu ước tính</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +12%
              </span>{" "}
              so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Tình hình Doanh thu (Mô phỏng 6 tháng)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueHistoryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `${value}k`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => {
                      if (typeof value !== "number") return value;
                      return [`${value.toLocaleString()}k ₫`, 'Doanh thu'];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Trạng thái Doanh nghiệp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={businessStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    name="Số lượng"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
