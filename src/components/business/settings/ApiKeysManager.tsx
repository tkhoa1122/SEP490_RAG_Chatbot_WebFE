"use client";

import { useState, useEffect } from "react";
import { Plus, Key, Copy, CheckCircle2, Trash2, Loader2, Eye, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiKeyAPI, type ApiKeyDto } from "@/infrastructure/api/apiKeyAPI";
import { toast } from "sonner";

export function ApiKeysManager() {
  const [keys, setKeys] = useState<ApiKeyDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Create
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Modal View Details
  const [viewKeyId, setViewKeyId] = useState<string | null>(null);
  const [viewKeyName, setViewKeyName] = useState<string>("");
  const [fullKeyValue, setFullKeyValue] = useState<string | null>(null);
  const [viewing, setViewing] = useState(false);

  // Modal Revoke
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await apiKeyAPI.getAll();
      if (res.data) {
        setKeys(res.data);
      }
    } catch (err: any) {
      toast.error("Lỗi khi tải danh sách API Keys", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // --- Handlers ---

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error("Vui lòng nhập tên cho API Key");
      return;
    }
    try {
      setCreating(true);
      const res = await apiKeyAPI.create({ name: newKeyName.trim() });
      if (res.data) {
        toast.success("Tạo API Key thành công");
        setNewlyCreatedKey(res.data.keyValue);
        setNewKeyName("");
        fetchKeys();
      }
    } catch (err: any) {
      toast.error("Không thể tạo API Key", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setCreating(false);
    }
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    setNewlyCreatedKey(null);
    setNewKeyName("");
  };

  const handleViewDetails = async (id: string, name: string) => {
    setViewKeyId(id);
    setViewKeyName(name);
    setFullKeyValue(null);
    setViewing(true);
    try {
      const res = await apiKeyAPI.getById(id);
      if (res.data) {
        setFullKeyValue(res.data.keyValue);
      }
    } catch (err: any) {
      toast.error("Không thể lấy chi tiết API Key", {
        description: err.response?.data?.message || err.message,
      });
      setViewKeyId(null); // đóng modal nếu lỗi
    } finally {
      setViewing(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeKeyId) return;
    try {
      setRevoking(true);
      await apiKeyAPI.revoke(revokeKeyId);
      toast.success("Đã thu hồi API Key thành công");
      setRevokeKeyId(null);
      fetchKeys();
    } catch (err: any) {
      toast.error("Không thể thu hồi API Key", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/50 mt-6">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-5">
        <div className="space-y-1.5">
          <CardTitle className="text-xl flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Secret API Keys
          </CardTitle>
          <CardDescription className="text-sm">
            Quản lý các khóa bí mật để tích hợp hệ thống của bạn (ERP, POS) với chatbot.
          </CardDescription>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Tạo API Key
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-50 pl-6 font-semibold uppercase tracking-wider text-xs">Tên Key</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Mã (Masked)</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Ngày tạo</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Trạng thái</TableHead>
              <TableHead className="text-right pr-6 font-semibold uppercase tracking-wider text-xs">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/60" /></TableCell></TableRow>
            ) : keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Key className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm">Chưa có API Key nào được tạo.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              keys.map((k) => (
                <TableRow key={k.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium pl-6">{k.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground border border-border/50">
                      {k.keyMasked || `${k.keyPrefix || "sk_live_"}••••••••`}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(k.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    {k.isActive ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        Đang hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                        Đã thu hồi
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {k.isActive && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-primary border-primary/20 hover:bg-primary/10"
                            onClick={() => handleViewDetails(k.id, k.name)}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Xem
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => setRevokeKeyId(k.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Thu hồi
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </CardContent>

      {/* ── Modal Create Key ── */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && closeCreateModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo API Key mới</DialogTitle>
            <DialogDescription>
              Tạo khóa bí mật để xác thực các yêu cầu API từ ứng dụng của bạn.
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4 py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex gap-3 items-start">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Hãy sao chép mã khóa này và lưu trữ an toàn. Bạn sẽ <b>không thể</b> xem lại mã khóa này đầy đủ một lần nữa vì lý do bảo mật.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input value={newlyCreatedKey} readOnly className="font-mono text-sm bg-muted" />
                <Button variant="secondary" size="icon" onClick={() => copyToClipboard(newlyCreatedKey)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tên định danh (Ví dụ: ERP System, Mobile App)</label>
                <Input
                  placeholder="Nhập tên khóa..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {newlyCreatedKey ? (
              <Button onClick={closeCreateModal}>Đóng</Button>
            ) : (
              <>
                <Button variant="outline" onClick={closeCreateModal} disabled={creating}>
                  Hủy
                </Button>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Tạo khóa
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal View Key Details ── */}
      <Dialog open={!!viewKeyId} onOpenChange={(open) => !open && setViewKeyId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết API Key: {viewKeyName}</DialogTitle>
            <DialogDescription>
              Mã khóa bảo mật của bạn. Đừng chia sẻ cho bất cứ ai.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {viewing ? (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Đang giải mã...
              </div>
            ) : fullKeyValue ? (
              <div className="flex items-center gap-2">
                <Input value={fullKeyValue} readOnly className="font-mono text-sm bg-muted" />
                <Button variant="secondary" size="icon" onClick={() => copyToClipboard(fullKeyValue)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-red-500">Không thể lấy dữ liệu khóa.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setViewKeyId(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Revoke Key ── */}
      <Dialog open={!!revokeKeyId} onOpenChange={(open) => !open && setRevokeKeyId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận thu hồi API Key</DialogTitle>
            <DialogDescription>
              Hành động này sẽ vô hiệu hóa khóa ngay lập tức. Mọi tích hợp sử dụng khóa này sẽ bị lỗi truy cập.
              Bạn có chắc chắn không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRevokeKeyId(null)} disabled={revoking}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={revoking}>
              {revoking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Đồng ý, thu hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
