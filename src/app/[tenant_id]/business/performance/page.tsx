import type { Metadata } from "next";
import { AlertCircle, Cpu, Coins, Zap, Target, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Hiệu suất AI" };

export default function PerformancePage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hiệu suất & Chi phí AI (RAG)</h1>
        <p className="mt-1 text-muted-foreground">
          Theo dõi mức sử dụng token, chi phí API LLM, và tốc độ phản hồi của chatbot.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p><strong>Lưu ý:</strong> Đây chỉ là Demo, tính năng chưa được phát triển. Dữ liệu bên dưới là giả lập.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chi phí AI ước tính</CardTitle>
            <Coins className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">$12.45</div>
            <p className="text-xs text-muted-foreground mt-1">Đã dùng trong tháng này</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lượng Token tiêu thụ</CardTitle>
            <Cpu className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1.2M</div>
            <p className="text-xs text-muted-foreground mt-1">Prompt & Completion Tokens</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tốc độ phản hồi (Latency)</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">1.2s</div>
            <p className="text-xs text-muted-foreground mt-1">Trung bình mỗi tin nhắn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ chính xác (Hit Rate)</CardTitle>
            <Target className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">92.5%</div>
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
