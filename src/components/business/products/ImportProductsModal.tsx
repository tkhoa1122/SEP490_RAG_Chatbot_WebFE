"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileSpreadsheet, CheckCircle2, Loader2, AlertCircle, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { productAPI } from "@/infrastructure/api/productAPI";

interface ImportProductsModalProps {
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadStatus = "idle" | "uploading" | "validating" | "indexing" | "success" | "error";

export function ImportProductsModal({ tenantId, isOpen, onClose, onSuccess }: ImportProductsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Basic validation for extension
      const validExtensions = [".csv", ".xls", ".xlsx", ".json"];
      const isValid = validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext));
      
      if (!isValid) {
        toast.error("Vui lòng tải lên file CSV, Excel hoặc JSON");
        return;
      }
      
      setFile(selectedFile);
      setStatus("idle");
      setProgress(0);
      setErrorMessage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = [".csv", ".xls", ".xlsx", ".json"];
      const isValid = validExtensions.some(ext => droppedFile.name.toLowerCase().endsWith(ext));
      
      if (!isValid) {
        toast.error("Vui lòng tải lên file CSV, Excel hoặc JSON");
        return;
      }
      
      setFile(droppedFile);
      setStatus("idle");
      setProgress(0);
      setErrorMessage(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(30);

    try {
      await productAPI.importProducts(file);
      setStatus("success");
      setProgress(100);
      toast.success("Import dữ liệu sản phẩm thành công!");

      setTimeout(() => {
        onSuccess();
        onClose();
        clearFile();
      }, 1500);
    } catch (error: any) {
      console.error("Import error:", error);
      let msg = error?.response?.data?.message || error?.response?.data?.title || (typeof error?.response?.data === "string" ? error.response.data : null) || error?.message || "Đã xảy ra lỗi khi tải file lên.";
      if (error?.response?.data?.errors && typeof error.response.data.errors === "object") {
        const errDetails = Object.values(error.response.data.errors).flat().join(" ");
        if (errDetails) msg = `${msg} (${errDetails})`;
      }
      setErrorMessage(msg);
      toast.error(msg);
      setStatus("error");
    }
  };

  const handleClose = () => {
    if (status !== "idle" && status !== "success" && status !== "error") {
      if (!window.confirm("Quá trình import đang diễn ra. Bạn có chắc chắn muốn hủy?")) {
        return;
      }
    }
    clearFile();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Catalog</DialogTitle>
          <DialogDescription>
            Tải lên file CSV hoặc Excel chứa danh sách sản phẩm để thêm hàng loạt. Hệ thống sẽ tự động cập nhật và index dữ liệu.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {!file ? (
            <div 
              className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-1">Nhấn để tải lên hoặc kéo thả file vào đây</p>
              <p className="text-xs text-muted-foreground">Hỗ trợ: .csv, .xls, .xlsx, .json (Tối đa 5MB)</p>
              
              <div className="mt-4 pt-4 border-t w-full">
                <Button variant="link" size="sm" className="h-auto p-0" onClick={(e) => { e.stopPropagation(); toast("Tính năng tải template đang phát triển"); }}>
                  Tải file template mẫu (.csv)
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-muted/20">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                {status === "idle" && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {status !== "idle" && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2">
                      {status === "uploading" && <><Loader2 className="h-3 w-3 animate-spin text-blue-500" /> Đang tải lên...</>}
                      {status === "validating" && <><Loader2 className="h-3 w-3 animate-spin text-amber-500" /> Đang kiểm tra dữ liệu...</>}
                      {status === "indexing" && <><Loader2 className="h-3 w-3 animate-spin text-purple-500" /> Đang xử lý dữ liệu...</>}
                      {status === "success" && <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Hoàn tất</>}
                      {status === "error" && <><AlertCircle className="h-3 w-3 text-red-500" /> Có lỗi xảy ra</>}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ease-in-out ${
                        status === "success" ? "bg-emerald-500" : 
                        status === "error" ? "bg-red-500" : 
                        status === "indexing" ? "bg-purple-500" :
                        "bg-primary"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              {/* Error Message Display in Progress View */}
              {status === "error" && errorMessage && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-sm text-red-600">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv, .json, application/json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
            onChange={handleFileChange}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={status !== "idle" && status !== "error" && status !== "success"}>
            {status === "success" ? "Đóng" : "Hủy"}
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || status !== "idle"}
          >
            Bắt đầu Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
