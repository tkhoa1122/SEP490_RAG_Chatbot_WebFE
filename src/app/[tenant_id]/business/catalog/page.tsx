import type { Metadata } from "next";
import { AlertCircle, UploadCloud, FileText, Bot, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Kho tri thức & RAG" };

export default function CatalogPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kho tri thức & Huấn luyện AI</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý tài liệu và huấn luyện chatbot để trả lời câu hỏi của khách hàng.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-3 text-sm flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p><strong>Lưu ý:</strong> Đây chỉ là Demo, tính năng chưa được phát triển. Giao diện dưới đây chỉ là giả lập.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" /> Tải lên tài liệu
            </CardTitle>
            <CardDescription>
              Tải lên các tài liệu PDF, DOCX, hoặc TXT để bổ sung kiến thức cho AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">Kéo thả file vào đây hoặc bấm để chọn</p>
              <p className="text-xs text-muted-foreground mb-4">Hỗ trợ PDF, DOCX, TXT (tối đa 10MB)</p>
              <Button disabled>Chọn tài liệu</Button>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> Trạng thái Huấn luyện (RAG)
            </CardTitle>
            <CardDescription>
              Tiến trình đồng bộ và vector hóa dữ liệu vào hệ thống AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Chính sách bảo hành.pdf</p>
                  <p className="text-xs text-muted-foreground">Đã tải lên lúc 10:30, 24/06/2026</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Hoàn tất
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Hướng dẫn sử dụng.docx</p>
                  <p className="text-xs text-muted-foreground">Đã tải lên lúc 15:45, 23/06/2026</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Hoàn tất
              </Badge>
            </div>

            <Button className="w-full mt-2" variant="outline" disabled>
              Huấn luyện lại toàn bộ dữ liệu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
