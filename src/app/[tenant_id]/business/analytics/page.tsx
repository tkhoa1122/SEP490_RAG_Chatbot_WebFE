import type { Metadata } from "next";
import { AlertCircle, LineChart as LineChartIcon, TrendingUp, Users, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Phân tích" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phân tích kinh doanh</h1>
        <p className="mt-1 text-muted-foreground">
          Báo cáo doanh thu, hành vi khách hàng và hiệu suất hoạt động của chatbot.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p><strong>Lưu ý:</strong> Đây chỉ là Demo, tính năng chưa được phát triển. Dữ liệu bên dưới là giả lập.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu giả định</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">124,500,000 ₫</div>
            <p className="text-xs text-muted-foreground mt-1">+15.2% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">+1,234</div>
            <p className="text-xs text-muted-foreground mt-1">+5.4% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">3.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Chatbot đã hỗ trợ chốt 210 đơn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Lượt tương tác</CardTitle>
            <LineChartIcon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">12,450</div>
            <p className="text-xs text-muted-foreground mt-1">Tin nhắn xử lý trong tháng</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="min-h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <LineChartIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Biểu đồ doanh thu (Chưa khả dụng)</p>
            <Button variant="outline" className="mt-4" disabled>Xuất báo cáo</Button>
          </div>
        </Card>

        <Card className="min-h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Bản đồ hành trình khách hàng (Chưa khả dụng)</p>
            <Button variant="outline" className="mt-4" disabled>Xem chi tiết</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
