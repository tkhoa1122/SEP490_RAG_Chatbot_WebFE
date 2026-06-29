"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  Users, Plus, Search, Trash2, Pencil, ShieldCheck, Mail, ShieldAlert,
  Loader2, RefreshCw, ChevronDown, ChevronUp, UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  catalogTeamAPI,
  type CatalogMember,
  type MemberRegistrationCommand,
  type UpdateMemberCommand,
  type UserStatus
} from "@/infrastructure/api/businessAPI";

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<UserStatus, { label: string; cls: string }> = {
  ACTIVE: { label: "Hoạt động", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  PENDING_PROFILE_COMPLETION: { label: "Chờ cập nhật hồ sơ", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  PENDING_APPROVAL: { label: "Chờ duyệt", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  DELETED: { label: "Bị khóa", cls: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
  REJECTED: { label: "Từ chối", cls: "bg-red-500/10 text-red-600 border-red-500/20" },
};

function StatusBadge({ status }: { status?: UserStatus }) {
  if (!status) return null;
  const cfg = STATUS_MAP[status] || STATUS_MAP["PENDING_APPROVAL"];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function CatalogTeamManager() {
  const [members, setMembers] = useState<CatalogMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Forms
  const { register: regC, handleSubmit: handleC, reset: resetC, formState: { errors: errC, isSubmitting: subC } } = useForm<MemberRegistrationCommand>();
  const { register: regE, handleSubmit: handleE, reset: resetE, formState: { errors: errE, isSubmitting: subE } } = useForm<UpdateMemberCommand & { id: string }>();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await catalogTeamAPI.getAll({
        Email: search || undefined,
        PageIndex: page,
        PageSize: PAGE_SIZE,
      });
      setMembers(res.data?.items ?? []);
      setTotalCount(res.data?.totalItems ?? res.data?.totalCount ?? 0);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchMembers, 300);
    return () => clearTimeout(t);
  }, [fetchMembers]);

  // Actions
  const onCreate = async (data: MemberRegistrationCommand) => {
    try {
      await catalogTeamAPI.create(data);
      toast.success("Thêm nhân viên thành công");
      setCreateOpen(false);
      resetC();
      fetchMembers();
    } catch (err: any) {
      toast.error("Thêm thất bại", { description: err.response?.data?.message || err.message });
    }
  };

  const onEdit = async (data: UpdateMemberCommand & { id: string }) => {
    try {
      const { id, ...body } = data;
      await catalogTeamAPI.update(id, body);
      toast.success("Cập nhật thông tin thành công");
      setEditOpen(false);
      fetchMembers();
    } catch (err: any) {
      toast.error("Cập nhật thất bại", { description: err.response?.data?.message || err.message });
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await catalogTeamAPI.delete(deleteId);
      toast.success("Đã khóa tài khoản nhân viên");
      setDeleteId(null);
      fetchMembers();
    } catch (err: any) {
      toast.error("Thao tác thất bại", { description: err.response?.data?.message || err.message });
    }
  };

  const openEdit = (member: CatalogMember) => {
    resetE({
      id: member.id,
      fullName: member.fullName,
      phoneNumber: member.phoneNumber,
    });
    setEditOpen(true);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card className="border-border shadow-sm overflow-hidden bg-gradient-to-b from-card to-card/50">
      <CardHeader className="border-b bg-muted/20 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-primary" />
              Quản lý nhân sự
            </CardTitle>
            <CardDescription className="text-sm">
              Thêm nhân viên để quản lý dữ liệu sản phẩm (RAG) và xem thống kê hội thoại.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchMembers} disabled={loading} className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors shadow-sm">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
            <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" /> Thêm nhân viên
            </Button>
          </div>
        </div>

        <div className="relative mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Tìm kiếm theo email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm" />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="pl-6 font-semibold uppercase tracking-wider text-xs">Nhân viên</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Liên hệ</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Trạng thái</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Xác thực</TableHead>
              <TableHead className="pr-6 text-right font-semibold uppercase tracking-wider text-xs">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/60" /></TableCell></TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm">Chưa có nhân viên nào</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => (
                <TableRow key={m.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs shadow-sm">
                        {m.fullName ? m.fullName.charAt(0).toUpperCase() : m.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{m.fullName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{m.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.phoneNumber || "—"}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell>
                    {m.isEmailVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"><ShieldCheck className="h-3.5 w-3.5"/> Đã xác thực</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600"><ShieldAlert className="h-3.5 w-3.5"/> Chưa xác thực</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(m)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteId(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
             <p className="text-xs text-muted-foreground">
              Hiển thị <span className="font-semibold text-foreground">{members.length}</span> / <span className="font-semibold text-foreground">{totalCount}</span> nhân viên
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex h-7 w-7 items-center justify-center rounded-md border text-xs text-muted-foreground hover:bg-muted disabled:opacity-40">‹</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-7 w-7 items-center justify-center rounded-md border text-xs text-muted-foreground hover:bg-muted disabled:opacity-40">›</button>
            </div>
          </div>
        )}
      </CardContent>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleC(onCreate)}>
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
              <DialogDescription>Hệ thống sẽ gửi email yêu cầu tạo mật khẩu đến nhân viên.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên *</label>
                <Input placeholder="Nguyễn Văn A" {...regC("fullName", { required: "Vui lòng nhập họ tên" })} />
                {errC.fullName && <p className="text-xs text-red-500">{errC.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" placeholder="email@example.com" {...regC("email", { required: "Vui lòng nhập email" })} />
                {errC.email && <p className="text-xs text-red-500">{errC.email.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={subC}>
                {subC ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Gửi lời mời
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleE(onEdit)}>
            <DialogHeader>
              <DialogTitle>Cập nhật nhân viên</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên</label>
                <Input placeholder="Nguyễn Văn A" {...regE("fullName")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input placeholder="09..." {...regE("phoneNumber")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={subE}>Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Khóa tài khoản nhân viên</DialogTitle>
            <DialogDescription>
              Tài khoản này sẽ không thể đăng nhập vào hệ thống nữa. Bạn có chắc chắn?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={onDelete}>Xác nhận khóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
