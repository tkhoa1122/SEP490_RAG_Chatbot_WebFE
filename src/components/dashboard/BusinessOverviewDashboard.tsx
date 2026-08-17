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
  AlertCircle,
  CalendarIcon,
  Flame
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { dashboardAPI, BusinessAnalyticsResponse } from "@/infrastructure/api/dashboardAPI";


export function BusinessOverviewDashboard({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BusinessAnalyticsResponse | null>(null);
  
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const fetchStats = async (isFilter = false) => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getBusinessAnalytics(
        fromDate || undefined, 
        toDate || undefined
      );
      setData(res.data as BusinessAnalyticsResponse);
      
      if (res.data) {
        if (!fromDate) setFromDate(res.data.from.split('T')[0]);
        if (!toDate) setToDate(res.data.to.split('T')[0]);
      }
    } catch (error) {
      console.error("Lỗi khi tải thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [tenantId]);

  const handleFilter = () => {
    fetchStats(true);
  };

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

  const chartData = data?.chatTraffic?.map(item => ({
    name: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    sessions: item.sessions,
    messages: item.messages
  })) || [];
  const zeroResults = data?.zeroResultQueries?.slice(0, 5) || [];
  const intents = data?.intents || [];
  const trendingKeywords = data?.trendingKeywords?.slice(0, 10) || [];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Tổng quan Cửa hàng</h1>
          <p className="text-sm text-muted-foreground mt-1">Theo dõi hoạt động kinh doanh, chất lượng Chatbot và phản hồi khách hàng.</p>
        </div>
        
        {/* Date Range Picker */}
        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border">
          <div className="flex items-center gap-2 bg-background border rounded-md px-2 shadow-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <input 
              type="date" 
              className="text-sm bg-transparent border-none focus:outline-none py-1.5 w-[120px]" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <span className="text-muted-foreground font-medium">-</span>
          <div className="flex items-center gap-2 bg-background border rounded-md px-2 shadow-sm">
            <input 
              type="date" 
              className="text-sm bg-transparent border-none focus:outline-none py-1.5 w-[120px]"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <Button onClick={handleFilter} size="sm" variant="default" className="ml-1 shadow-sm">
            Lọc
          </Button>
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
            <div className="text-2xl font-bold">{data?.totalProducts?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đang có trong kho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">Tài liệu tri thức</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalKnowledgeDocuments?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              File PDF/Word đã tải lên
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">Phiên Chat</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalChatSessions?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Khách hàng nhắn qua Widget
            </p>
            <div className="mt-2 inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-[10px] font-medium text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              Gồm {data?.totalChatMessages || 0} tin nhắn
            </div>
          </CardContent>
        </Card>

        {/* Row 2: RAG Quality Metrics */}
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-1">Tỷ lệ chính xác (Hit Rate)</CardTitle>
            <Target className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{(data?.averageSearchHitRatePercentage || 0).toFixed(2)}%</div>
            <p className="text-xs text-emerald-600/80 mt-1">
              Truy xuất đúng sản phẩm/tài liệu
            </p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-1">Tốc độ phản hồi (Latency)</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{data?.averageRetrievalLatencyMilliseconds ? (data.averageRetrievalLatencyMilliseconds / 1000).toFixed(2) : 0}s</div>
            <p className="text-xs text-blue-600/80 mt-1">
              Trung bình thời gian bot chat lại
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-1">Tỷ lệ chuyển đổi</CardTitle>
            <ThumbsUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{data?.conversionRate !== undefined ? `${data.conversionRate.toFixed(2)}%` : "N/A"}</div>
            
            <div className="flex gap-1.5 mt-2.5">
              <Badge variant="outline" className="text-[10px] bg-white border-amber-200 text-amber-700 font-medium">
                {data?.totalOrders || 0} Đơn đặt
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-white border-emerald-200 text-emerald-600 font-medium">
                {data?.paidOrders || 0} Thành công
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Lưu lượng Chat (Trong kỳ)</CardTitle>
            <CardDescription>Số lượng phiên chat theo thời gian thực</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" name="Số phiên chat" />
                  <Area type="monotone" dataKey="messages" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorMessages)" name="Số tin nhắn" />
                </AreaChart>
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
              <CardTitle className="text-rose-900 flex items-center gap-2">Câu hỏi không có kết quả (Zero-result)</CardTitle>
            </div>
            <CardDescription className="text-rose-700/80">
              Những câu hỏi bot không tìm thấy sản phẩm/tài liệu để trả lời
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {zeroResults.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Không có dữ liệu.</div>
            ) : (
              <div className="divide-y">
                {zeroResults.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{item.query}</p>
                      <p className="text-xs text-muted-foreground">Lần gặp gần nhất: {new Date(item.lastOccurredAt).toLocaleString("vi-VN")}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">
                        {item.count} lượt hỏi
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intent Chart */}
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Phân loại Ý định (Intents)</CardTitle>
            <CardDescription>Mục đích hỏi của khách hàng</CardDescription>
          </CardHeader>
          <CardContent>
            {intents.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">Không có dữ liệu.</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={intents} margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis dataKey="intent" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }} width={100} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Số lượng" barSize={24} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Từ khóa thịnh hành (Trending Keywords)</CardTitle>
            <CardDescription>Các từ khóa được khách hàng tìm kiếm nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {trendingKeywords.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">Không có dữ liệu.</div>
            ) : (
              <div className="flex flex-wrap gap-3 mt-2">
                {trendingKeywords.map((kw, i) => {
                  const isTop = i < 3;
                  return (
                    <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-all hover:scale-105 ${
                      isTop ? "bg-rose-50/80 border-rose-200" : "bg-card hover:bg-muted/50"
                    }`}>
                      {isTop && <Flame className="h-4 w-4 text-rose-500" />}
                      <span className={`font-semibold text-sm ${isTop ? "text-rose-700" : "text-foreground"}`}>
                        {kw.keyword}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                        isTop ? "bg-white text-rose-600 border-rose-100" : "text-muted-foreground bg-muted/50 border-border"
                      }`}>
                        {kw.count} lượt
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
