"use client";

import { useState, use, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { importJobAPI } from "@/infrastructure/api/importJobAPI";
import type { ImportJob, ImportJobStatus, ImportErrorDetail } from "@/infrastructure/dto/ImportJobDTO";

const STATUS_MAP: Record<ImportJobStatus, { label: string; cls: string; icon: any }> = {
  Pending: { label: "Đang chờ", cls: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: Clock },
  Validating: { label: "Đang kiểm tra", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Loader2 },
  ImportingProducts: { label: "Đang import", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Loader2 },
  Completed: { label: "Hoàn tất", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
  CompletedWithErrors: { label: "Hoàn tất (Có lỗi)", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: AlertCircle },
  Failed: { label: "Thất bại", cls: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
};

export function ImportLogsClient({ tenantIdPromise }: { tenantIdPromise: Promise<string> }) {
  const tenantId = use(tenantIdPromise);
  
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedErrors, setSelectedErrors] = useState<ImportErrorDetail[] | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await importJobAPI.getAll({ PageSize: 50 });
      setJobs(res.data?.items || []);
    } catch (error) {
      toast.error("Không thể tải lịch sử Import");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleViewErrors = (errors: ImportErrorDetail[] | null) => {
    if (!errors || errors.length === 0) return;
    setSelectedErrors(errors);
    setIsErrorModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link 
            href={`/${tenantId}/business/products`} 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Quay lại Danh sách Sản phẩm
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử Import Excel</h1>
          <p className="text-muted-foreground mt-1">
            Xem lại quá trình xử lý các file Excel đã tải lên và chi tiết lỗi nếu có.
          </p>
        </div>
        <Button variant="outline" onClick={fetchJobs} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Làm mới
        </Button>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Tên File</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Chưa có lịch sử Import nào.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => {
                  const statusInfo = STATUS_MAP[job.status] || STATUS_MAP.Pending;
                  const Icon = statusInfo.icon;
                  const hasErrors = job.errors && job.errors.length > 0;

                  return (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                          {job.fileName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusInfo.cls}>
                          <Icon className={`h-3 w-3 mr-1 ${statusInfo.icon === Loader2 ? 'animate-spin' : ''}`} />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-emerald-600 font-medium">{job.successRows}</span> thành công
                          {job.failedRows > 0 && (
                            <>
                              <span className="text-muted-foreground mx-1">/</span>
                              <span className="text-red-600 font-medium">{job.failedRows}</span> thất bại
                            </>
                          )}
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Tổng: {job.totalRows} dòng
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">
                          {new Date(job.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                        </div>
                        {job.completedAt && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Xong: {new Date(job.completedAt).toLocaleTimeString("vi-VN")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {hasErrors ? (
                          <Button variant="ghost" size="sm" onClick={() => handleViewErrors(job.errors)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Xem chi tiết lỗi
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Chi tiết các dòng bị lỗi
            </DialogTitle>
            <DialogDescription>
              Hệ thống đã phát hiện {selectedErrors?.length} lỗi trong quá trình xử lý file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto pr-2 flex-1 mt-4 border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[80px]">Dòng</TableHead>
                  <TableHead className="w-[150px]">Cột bị lỗi</TableHead>
                  <TableHead>Chi tiết lỗi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedErrors?.map((err, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-muted-foreground">#{err.rowNumber}</TableCell>
                    <TableCell className="font-medium">{err.field}</TableCell>
                    <TableCell className="text-red-600">{err.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
