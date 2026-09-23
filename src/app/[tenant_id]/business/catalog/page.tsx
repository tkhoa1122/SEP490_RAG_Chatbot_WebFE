"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, Bot, CheckCircle2, Loader2, FileUp, Trash2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { documentAPI } from "@/infrastructure/api/documentAPI";
import type { DocumentDto, DocumentStatus } from "@/infrastructure/dto/DocumentDTO";

export default function CatalogPage() {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await documentAPI.getAll({ PageIndex: 1, PageSize: 50 }) as any;
      const items = res.data?.items || res.items || (Array.isArray(res.data) ? res.data : []);
      setDocuments(items);
    } catch (err: any) {
      toast.error("Không thể tải danh sách tài liệu", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này? Hành động không thể hoàn tác.")) return;
    
    setDeletingId(id);
    try {
      await documentAPI.delete(id);
      toast.success("Xóa tài liệu thành công");
      fetchDocuments();
    } catch (err: any) {
      toast.error("Không thể xóa tài liệu", { description: err.response?.data?.message || err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderStatus = (doc: any) => {
    // API hiện tại không trả về trường trạng thái nào (status/state), nên mặc định hiển thị "Đã tải lên"
    const status = doc.status || doc.documentStatus || doc.knowledgeDocumentStatus || doc.state;
    switch (status) {
      case "Embedded":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Đã nhúng (Hoàn tất)</Badge>;
      case "Processing":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Đang xử lý</Badge>;
      case "Failed":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="h-3 w-3 mr-1" /> Bị lỗi</Badge>;
      case "Deleted":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">Đã xóa</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Đã tải lên</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Không rõ thời gian";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

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
      fetchDocuments(); // refresh list after upload
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
          <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : documents.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground text-sm border-2 border-dashed rounded-lg">Chưa có tài liệu nào.</div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      {doc.fileUrl ? (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                          {doc.fileName || doc.title || doc.name || "Không rõ tên tài liệu"}
                        </a>
                      ) : (
                        <p className="text-sm font-medium">{doc.fileName || doc.title || doc.name || "Không rõ tên tài liệu"}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(doc.sizeInBytes)} • Đã tải lên lúc {formatDate(doc.createdAt || doc.createdDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                    {renderStatus(doc)}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deletingId === doc.id}
                    >
                      {deletingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))
            )}

            <Button className="w-full mt-2" variant="outline" disabled>
              Huấn luyện lại toàn bộ dữ liệu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
