"use client";

import { useEffect, useState } from "react";
import { AlertCircle, LineChart as LineChartIcon, TrendingUp, Users, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardAPI, BusinessAnalyticsResponse } from "@/infrastructure/api/dashboardAPI";
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

export default function AnalyticsPage() {
  const [data, setData] = useState<BusinessAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // By default API expects ISO dates. We will just pass undefined to let backend use default range (usually 30 days)
        const res = await dashboardAPI.getBusinessAnalytics();
        setData(res.data as BusinessAnalyticsResponse);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p>Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    );
  }

  const chartData = data?.chatTraffic?.map(item => ({
    name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    sessions: item.sessions,
    messages: item.messages
  })) || [];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doanh thu & Chuyển đổi</h1>
        <p className="mt-1 text-muted-foreground">
          Báo cáo doanh thu, hành vi mua sắm của khách hàng và hiệu quả bán hàng.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lượt tương tác (Messages)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{data?.totalChatMessages?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tin nhắn AI đã phản hồi</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Phiên Chat (Sessions)</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{data?.totalChatSessions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Lượt khách hàng trò chuyện</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{data?.conversionRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Dựa trên đơn hàng thành công</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm bán ra (Đơn)</CardTitle>
            <LineChartIcon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{data?.paidOrders?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng: {data?.totalOrders || 0} đơn hàng</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="min-h-[300px]">
          <CardHeader>
            <CardTitle>Biểu đồ Tương tác (30 ngày gần đây)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="sessions" name="Phiên Chat" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSessions)" />
                  <Area type="monotone" dataKey="messages" name="Tin nhắn" stroke="#8b5cf6" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Bản đồ hành trình khách hàng (Sắp ra mắt)</p>
            <Button variant="outline" className="mt-4" disabled>Xem chi tiết</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
