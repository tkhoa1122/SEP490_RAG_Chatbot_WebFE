"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  Users, Search, Trash2, Pencil, ShieldCheck, ShieldAlert,
  Loader2, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  userAPI,
  type UserRecord,
  type UpdateUserCommand,
  type UserStatus
} from "@/infrastructure/api/userAPI";

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<UserStatus, { label: string; cls: string }> = {
  ACTIVE: { label: "Hoạt động", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  PENDING_PROFILE_COMPLETION: { label: "Chờ cập nhật hồ sơ", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  PENDING_APPROVAL: { label: "Chờ duyệt", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  DELETED: { label: "Đã xóa", cls: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
  REJECTED: { label: "Từ chối", cls: "bg-red-500/10 text-red-600 border-red-500/20" },
};

function StatusBadge({ status }: { status?: UserStatus }) {
  if (!status) return null;
  const cfg = STATUS_MAP[status] || { label: status, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function UsersDataTable() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Forms
  const { register: regE, handleSubmit: handleE, reset: resetE, formState: { errors: errE, isSubmitting: subE } } = useForm<UpdateUserCommand & { id: string }>();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({
        Email: search || undefined, // We map search text to Email filtering
        PageIndex: page,
        PageSize: PAGE_SIZE,
      });
      setUsers(res.data?.items ?? []);
      setTotalCount(res.data?.totalItems ?? res.data?.totalCount ?? 0);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 500); // Debounce search
    return () => clearTimeout(t);
  }, [fetchUsers]);

  // Actions
  const onEdit = async (data: UpdateUserCommand & { id: string }) => {
    try {
      const { id, ...body } = data;
      // Convert gender string back to number if needed since input returns string
      const parsedBody = {
        ...body,
        gender: body.gender ? Number(body.gender) : undefined,
      };

      await userAPI.update(id, parsedBody);
      toast.success("Cập nhật thông tin người dùng thành công");
      setEditOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error("Cập nhật thất bại", { description: err.response?.data?.message || err.message });
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await userAPI.delete(deleteId);
      toast.success("Đã xóa/khóa tài khoản người dùng");
      setDeleteId(null);
      fetchUsers();
    } catch (err: any) {
      toast.error("Thao tác xóa thất bại", { description: err.response?.data?.message || err.message });
    }
  };

  const openEdit = (user: UserRecord) => {
    resetE({
      id: user.id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      // Handle date formatting if it's an ISO string (e.g. YYYY-MM-DDTHH:mm:ss -> YYYY-MM-DD)
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      gender: user.gender,
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
              Danh sách Người dùng
            </CardTitle>
            <CardDescription className="text-sm">
              Quản lý tài khoản toàn hệ thống (Admin, Business Owner, Catalog Team, Khách hàng).
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchUsers} disabled={loading} className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors shadow-sm">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="pl-6 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Người dùng</TableHead>
                <TableHead className="font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Vai trò</TableHead>
                <TableHead className="font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Liên hệ</TableHead>
                <TableHead className="font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Trạng thái</TableHead>
                <TableHead className="font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Email</TableHead>
                <TableHead className="pr-6 text-right font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-40 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/60" /></TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm">Không tìm thấy người dùng nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} className="group hover:bg-muted/50 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs shadow-sm">
                          {u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{u.fullName || "—"}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={u.email}>{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-700">
                        {u.role || "CUSTOMER"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.phoneNumber || "—"}</TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell>
                      {u.isEmailVerified ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"><ShieldCheck className="h-3.5 w-3.5"/> Đã xác thực</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600"><ShieldAlert className="h-3.5 w-3.5"/> Chưa xác thực</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(u)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleteId(u.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
             <p className="text-xs text-muted-foreground">
              Hiển thị <span className="font-semibold text-foreground">{users.length}</span> / <span className="font-semibold text-foreground">{totalCount}</span> người dùng
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex h-7 w-7 items-center justify-center rounded-md border text-xs text-muted-foreground hover:bg-muted disabled:opacity-40">‹</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex h-7 w-7 items-center justify-center rounded-md border text-xs text-muted-foreground hover:bg-muted disabled:opacity-40">›</button>
            </div>
          </div>
        )}
      </CardContent>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleE(onEdit)}>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày sinh</label>
                <Input type="date" {...regE("dateOfBirth")} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Giới tính</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...regE("gender")}
                >
                  <option value="">Chưa xác định</option>
                  <option value="1">Nam</option>
                  <option value="2">Nữ</option>
                  <option value="3">Khác</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={subE}>
                {subE ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Xóa người dùng
            </DialogTitle>
            <DialogDescription className="pt-2">
              Hành động này sẽ xóa hoặc khóa tài khoản của người dùng. Họ sẽ không thể đăng nhập vào hệ thống nữa. Bạn có chắc chắn muốn tiếp tục?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={onDelete}>Xác nhận xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
