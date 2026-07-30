"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { businessAPI } from "@/infrastructure/api/businessAPI";
import type { UsageLog, UsageLogSourceType } from "@/infrastructure/dto/UsageLogDTO";
import { toast } from "sonner";
import { Loader2, MessageSquare, Database, Zap, Clock } from "lucide-react";

export function UsageLogsClient() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await businessAPI.getUsageLogs({ PageSize: 50 });
      setLogs(res.data?.items || []);
    } catch (err) {
      toast.error("Không thể tải lịch sử tiêu hao token");
    } finally {
      setLoading(false);
    }
  };

  const renderSourceType = (type: string) => {
    switch (type) {
      case "Chat":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20"><MessageSquare className="h-3 w-3 mr-1" /> Chat</Badge>;
      case "EmbeddingProduct":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20"><Database className="h-3 w-3 mr-1" /> Vector Sản phẩm</Badge>;
      case "EmbeddingDocument":
        return <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/20"><Database className="h-3 w-3 mr-1" /> Vector Tài liệu</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-amber-500" />
          Lịch sử tiêu hao Token & Tin nhắn
        </CardTitle>
        <CardDescription>Danh sách chi tiết các lần sử dụng AI trong hệ thống.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="pl-6 font-semibold w-[200px]">Thời gian</TableHead>
              <TableHead className="font-semibold">Phân loại</TableHead>
              <TableHead className="font-semibold">Nội dung</TableHead>
              <TableHead className="font-semibold text-right">Tokens đã dùng</TableHead>
              <TableHead className="font-semibold text-right pr-6">Tin nhắn đã dùng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Chưa có dữ liệu tiêu hao.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="group">
                  <TableCell className="pl-6 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell>{renderSourceType(log.sourceType)}</TableCell>
                  <TableCell className="max-w-[300px] truncate" title={log.description}>{log.description}</TableCell>
                  <TableCell className="text-right font-medium text-amber-600">
                    {log.usedTokens > 0 ? `-${log.usedTokens.toLocaleString()}` : "-"}
                  </TableCell>
                  <TableCell className="text-right pr-6 font-medium text-blue-600">
                    {log.usedMessages > 0 ? `-${log.usedMessages.toLocaleString()}` : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
