"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, Bot, CheckCircle2, Loader2, FileUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { documentAPI } from "@/infrastructure/api/documentAPI";

// Dummy status for display (Backend doesn't provide GET documents yet)
const MOCK_DOCUMENTS = [
  { id: 1, name: "Chính sách bảo hành.pdf", time: "10:30, 24/06/2026", status: "Hoàn tất" },
  { id: 2, name: "Hướng dẫn sử dụng.docx", time: "15:45, 23/06/2026", status: "Hoàn tất" },
];

export default function CatalogPage() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    // Basic validation
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        toast.error(`File "${file.name}" vượt quá dung lượng 10MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      await documentAPI.upload(files);
      toast.success(`Đã tải lên thành công ${files.length} tài liệu!`);
      // Since backend doesn't have a GET endpoint for uploaded docs yet, we can't refresh the list dynamically.
    } catch (err: any) {
      toast.error("Tải lên thất bại", { description: err.response?.data?.message || err.message });
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kho tri thức & Huấn luyện AI</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý tài liệu và huấn luyện chatbot để trả lời câu hỏi của khách hàng.
        </p>
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
            <div 
              onClick={!uploading ? handleUploadClick : undefined}
              className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center transition-colors
                ${uploading ? "border-muted-foreground/30 bg-muted/20 opacity-70 cursor-not-allowed" : "border-border hover:bg-muted/50 cursor-pointer"}
              `}
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              ) : (
                <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
              )}
              
              <p className="text-sm font-medium mb-1">
                {uploading ? "Đang tải lên tài liệu..." : "Bấm vào đây để chọn file"}
              </p>
              <p className="text-xs text-muted-foreground mb-4">Hỗ trợ PDF, DOCX, TXT, EXCEL, CSV (tối đa 10MB)</p>
              
              <Button disabled={uploading} onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}>
                {uploading ? "Đang xử lý..." : "Chọn tài liệu"}
              </Button>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv" 
                onChange={handleFileChange}
              />
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
            {MOCK_DOCUMENTS.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">Đã tải lên lúc {doc.time}</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> {doc.status}
                </Badge>
              </div>
            ))}

            <Button className="w-full mt-2" variant="outline" disabled>
              Huấn luyện lại toàn bộ dữ liệu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
