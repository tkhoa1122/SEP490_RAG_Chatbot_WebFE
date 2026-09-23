"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardAPI } from "@/infrastructure/api/dashboardAPI";
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
    totalMessages: 0,
    totalRevenue: 0,
  });

  const [businessStatusData, setBusinessStatusData] = useState<any[]>([]);
  const [revenueHistoryData, setRevenueHistoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [
          summaryRes,
          revenueRes,
          subscriptionsRes,
          aiUsageRes
        ] = await Promise.all([
          dashboardAPI.getSummary(),
          dashboardAPI.getRevenue(),
          dashboardAPI.getSubscriptions(),
          dashboardAPI.getAiUsage().catch(err => {
            console.warn("AI Usage error:", err);
            return { data: { totalTokenUsed: 0, chartData: [] } } as any;
          })
        ]);

        const summaryData = summaryRes.data;
        const revData = revenueRes.data?.items?.[0] || { totalRevenue: 0, totalRevenueThisMonth: 0, activeSubscriptionCount: 0 };
        
        setStats({
          totalBusinesses: summaryData?.totalBusiness || 0,
          totalSubscriptions: summaryData?.activeSubscriptionCount || 0,
          totalMessages: summaryData?.totalMessage || 0,
          totalRevenue: revData.totalRevenue || 0,
        });

        // Format data for Business Status Bar Chart
        const totalBus = summaryData?.totalBusiness || 0;
        const activeBus = summaryData?.activeBusiness || 0;
        setBusinessStatusData([
          {
            name: "Hoạt động",
            count: activeBus,
            fill: "#10b981", // Emerald 500
          },
          {
            name: "Khác (Chờ/Từ chối)",
            count: Math.max(0, totalBus - activeBus),
            fill: "#f59e0b", // Amber 500
          }
        ]);

        // Calculate Revenue History from AI Usage Chart as a placeholder, 
        // since GET /revenue only gives total, not time series!
        if (aiUsageRes.data?.chartData) {
           const historyData = aiUsageRes.data.chartData.map((item: any) => {
             const d = new Date(item.date);
             return {
               name: `${d.getDate()}/${d.getMonth()+1}`,
               total: item.totalTokenUsed, // Map tokens instead of revenue for now since API lacks revenue time series
             };
           });
           setRevenueHistoryData(historyData);
        } else {
           setRevenueHistoryData([]);
        }

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
            <CardTitle className="text-sm font-medium">Tin nhắn AI</CardTitle>
            <Package className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Đã được phản hồi</p>
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
            <CardTitle>Biểu đồ Tiêu thụ Token AI (Theo ngày)</CardTitle>
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
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => {
                      if (typeof value !== "number") return value;
                      return [`${value.toLocaleString()} tokens`, 'Tiêu thụ'];
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
