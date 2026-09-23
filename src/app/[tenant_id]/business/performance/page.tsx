"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Cpu, Coins, Zap, Target, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dashboardAPI, BusinessAnalyticsResponse } from "@/infrastructure/api/dashboardAPI";

export default function PerformancePage() {
  const [data, setData] = useState<BusinessAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getBusinessAnalytics();
        setData(res.data as BusinessAnalyticsResponse);
      } catch (err) {
        console.error("Failed to fetch performance analytics:", err);
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
          <p>Đang tải dữ liệu hiệu suất AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hiệu suất & Chi phí AI (RAG)</h1>
        <p className="mt-1 text-muted-foreground">
          Theo dõi mức sử dụng token, chi phí API LLM, và tốc độ phản hồi của chatbot.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chi phí AI ước tính</CardTitle>
            <Coins className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600/50">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">Đang phát triển API Token</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lượng Token tiêu thụ</CardTitle>
            <Cpu className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600/50">N/A</div>
            <p className="text-xs text-muted-foreground mt-1">Đang phát triển API Token</p>
          </CardContent>
        </Card>
        
        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tốc độ phản hồi (Latency)</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{data?.averageRetrievalLatencyMilliseconds ? (data.averageRetrievalLatencyMilliseconds / 1000).toFixed(2) : 0}s</div>
            <p className="text-xs text-muted-foreground mt-1">Trung bình mỗi tin nhắn</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ chính xác (Hit Rate)</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{data?.averageSearchHitRatePercentage || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tìm thấy tài liệu RAG phù hợp</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="min-h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Biểu đồ chi phí Token theo ngày (Chưa khả dụng)</p>
            <Button variant="outline" className="mt-4" disabled>Xem chi tiết</Button>
          </div>
        </Card>

        <Card className="min-h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Giám sát độ trễ & Lỗi API (Chưa khả dụng)</p>
            <Button variant="outline" className="mt-4" disabled>Xem log hệ thống</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
