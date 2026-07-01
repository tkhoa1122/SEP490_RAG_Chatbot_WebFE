import type { Metadata } from "next";
import { AlertCircle, MessageSquare, ThumbsUp, ThumbsDown, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Lịch sử Chat & Đánh giá" };

export default function ChatLogsPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử Chat & Phản hồi</h1>
        <p className="mt-1 text-muted-foreground">
          Xem lại các phiên trò chuyện của khách hàng, đánh giá từ khách (Thumbs-up/down) và trích xuất dữ liệu đào tạo.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p><strong>Lưu ý:</strong> Đây chỉ là Demo, tính năng chưa được phát triển. Dữ liệu bên dưới là giả lập.</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <CardTitle>Danh sách Phiên Chat</CardTitle>
              <CardDescription>Các phiên trò chuyện gần đây nhất</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Tìm theo ID, nội dung..." className="pl-8 bg-background" />
              </div>
              <Button variant="outline" size="icon" disabled>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {/* Fake Session 1 */}
            <div className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">#SESS-8A92</Badge>
                  <span className="text-xs text-muted-foreground">Hôm nay, 14:22</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                    <ThumbsUp className="h-3 w-3 mr-1" /> Hữu ích
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" disabled>Xem chi tiết</Button>
                </div>
              </div>
              <div className="bg-muted/30 p-3 rounded-md text-sm space-y-3">
                <div>
                  <span className="font-semibold text-primary mr-2">Khách hàng:</span>
                  <span>Tai nghe Sony WH-1000XM5 còn màu bạc không shop?</span>
                </div>
                <div>
                  <span className="font-semibold text-emerald-600 mr-2">Chatbot:</span>
                  <span>Dạ chào bạn, tai nghe Sony WH-1000XM5 hiện tại cửa hàng đang còn sẵn màu Bạc và màu Đen ạ. Bạn có muốn đặt hàng ngay không?</span>
                </div>
              </div>
            </div>

            {/* Fake Session 2 */}
            <div className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">#SESS-7B11</Badge>
                  <span className="text-xs text-muted-foreground">Hôm qua, 09:15</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20">
                    <ThumbsDown className="h-3 w-3 mr-1" /> Sai thông tin
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" disabled>Xem chi tiết</Button>
                </div>
              </div>
              <div className="bg-muted/30 p-3 rounded-md text-sm space-y-3">
                <div>
                  <span className="font-semibold text-primary mr-2">Khách hàng:</span>
                  <span>Chính sách đổi trả iPhone 15 Promax như thế nào?</span>
                </div>
                <div>
                  <span className="font-semibold text-emerald-600 mr-2">Chatbot:</span>
                  <span>Rất tiếc, tôi không tìm thấy thông tin về chính sách đổi trả cho sản phẩm này trong hệ thống. Vui lòng liên hệ hotline để được hỗ trợ.</span>
                </div>
              </div>
            </div>

            {/* Fake Session 3 */}
            <div className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">#SESS-3C44</Badge>
                  <span className="text-xs text-muted-foreground">28/06/2026, 19:40</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" /> Không đánh giá
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" disabled>Xem chi tiết</Button>
                </div>
              </div>
              <div className="bg-muted/30 p-3 rounded-md text-sm space-y-3">
                <div>
                  <span className="font-semibold text-primary mr-2">Khách hàng:</span>
                  <span>Mình muốn mua áo thun size XL</span>
                </div>
                <div>
                  <span className="font-semibold text-emerald-600 mr-2">Chatbot:</span>
                  <span>Chào bạn, cửa hàng đang có rất nhiều mẫu áo thun size XL. Dưới đây là một số gợi ý bán chạy nhất...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-center">
            <Button variant="outline" disabled>Tải thêm phiên chat cũ</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
