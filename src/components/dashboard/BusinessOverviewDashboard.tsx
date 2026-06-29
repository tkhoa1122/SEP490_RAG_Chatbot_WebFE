"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Box,
  MessageSquare,
  ArrowUpRight,
  Loader2,
  FileText,
  Target,
  Activity,
  ThumbsUp,
  AlertCircle
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
  Legend
} from "recharts";
import { getRoleFromCookie } from "@/infrastructure/api/mainAuthAPI";

// Mock data until real API is integrated
const MOCK_CHAT_DATA = [
  { name: "T2", count: 120 },
  { name: "T3", count: 210 },
  { name: "T4", count: 150 },
  { name: "T5", count: 320 },
  { name: "T6", count: 420 },
  { name: "T7", count: 530 },
  { name: "CN", count: 380 },
];

const MOCK_INTENT_DATA = [
  { name: "Hỏi giá", count: 1500, fill: "#3b82f6" },
  { name: "Hỗ trợ", count: 800, fill: "#10b981" },
  { name: "Đổi trả", count: 400, fill: "#f59e0b" },
  { name: "Khác", count: 200, fill: "#8b5cf6" },
];

const MOCK_FEEDBACK_DATA = [
  { name: "T2", up: 85, down: 12 },
  { name: "T3", up: 110, down: 8 },
  { name: "T4", up: 95, down: 15 },
  { name: "T5", up: 130, down: 10 },
  { name: "T6", up: 180, down: 14 },
  { name: "T7", up: 210, down: 25 },
  { name: "CN", up: 160, down: 20 },
];

const MOCK_ZERO_RESULT = [
  { query: "Bao giờ có hàng iPhone 16 Pro Max 1TB?", count: 45, date: "29/06/2026" },
  { query: "Có hỗ trợ trả góp qua thẻ tín dụng Techcombank không?", count: 32, date: "28/06/2026" },
  { query: "Cách bảo hành tai nghe Sony WF-1000XM5", count: 18, date: "29/06/2026" },
  { query: "Khuyến mãi 20/10 có áp dụng cho chi nhánh mới?", count: 12, date: "25/06/2026" },
];

export function BusinessOverviewDashboard({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalDocuments: 0,
    totalChats: 0,
    hitRate: 0,
    avgLatency: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setStats({
        totalProducts: 342,
        totalDocuments: 56,
        totalChats: 12845,
        hitRate: 92.5,
        avgLatency: 1.2,
        satisfaction: 88,
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Đang tải dữ liệu tổng quan doanh nghiệp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan Cửa hàng</h1>
          <p className="text-muted-foreground mt-1">Theo dõi hoạt động kinh doanh, chất lượng Chatbot và phản hồi khách hàng.</p>
        </div>
      </div>

      {/* Stats Overview - 6 Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1: Basic Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +12
              </span>{" "}
              trong tháng này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tài liệu tri thức</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đã vector hóa & sẵn sàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Phiên Chat</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChats.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 inline-flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +24%
              </span>{" "}
              so với tuần trước
            </p>
          </CardContent>
        </Card>

        {/* Row 2: RAG Quality Metrics */}
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Tỷ lệ chính xác (Hit Rate)</CardTitle>
            <Target className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{stats.hitRate}%</div>
            <p className="text-xs text-emerald-600/80 mt-1">
              Khả năng tìm thấy tài liệu phù hợp
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Tốc độ phản hồi (Latency)</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.avgLatency}s</div>
            <p className="text-xs text-blue-600/80 mt-1">
              Thời gian xử lý trung bình mỗi tin nhắn
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Độ hài lòng (CSAT)</CardTitle>
            <ThumbsUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats.satisfaction}%</div>
            <p className="text-xs text-amber-600/80 mt-1">
              Tỷ lệ Thumbs-up / Tổng lượt đánh giá
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Lưu lượng Chat (7 ngày qua)</CardTitle>
            <CardDescription>Số lượng tin nhắn xử lý hằng ngày</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_CHAT_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorChats)" name="Số lượt chat" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Chất lượng phản hồi</CardTitle>
            <CardDescription>Theo dõi mức độ hài lòng (Thumbs-up/down)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_FEEDBACK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                  <Bar dataKey="up" name="Hài lòng (Up)" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="down" name="Không hài lòng (Down)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced RAG Insights Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Zero-result queries list */}
        <Card className="col-span-1 lg:col-span-4 border-rose-200">
          <CardHeader className="bg-rose-50/50 border-b border-rose-100 pb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-rose-900">Zero-result Queries (Cần bổ sung dữ liệu)</CardTitle>
            </div>
            <CardDescription className="text-rose-700/80">
              Top các câu hỏi phổ biến nhất mà chatbot không tìm thấy câu trả lời trong kho tri thức.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {MOCK_ZERO_RESULT.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{item.query}</p>
                    <p className="text-xs text-muted-foreground">Lần gặp gần nhất: {item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                      {item.count} lượt hỏi
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Intent Chart moved down */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Phân loại Ý định (Intents)</CardTitle>
            <CardDescription>Các chủ đề khách quan tâm nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={MOCK_INTENT_DATA} margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Số lượng" barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
