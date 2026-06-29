"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  FileText,
  Eye,
  Globe,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  systemContentAPI,
  type SystemContent,
  type SystemContentStatus,
  type ContentType,
  type CreateSystemContentCommand,
  type UpdateSystemContentCommand,
} from "@/infrastructure/api/systemContentAPI";

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<SystemContentStatus, { label: string; class: string }> = {
  Published: { label: "Đã xuất bản", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Draft: { label: "Bản nháp", class: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  Deleted: { label: "Đã xóa", class: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
};

function StatusBadge({ status }: { status?: SystemContentStatus }) {
  const cfg = STATUS_MAP[status ?? "Draft"];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", cfg.class)}>
      {cfg.label}
    </span>
  );
}

// ── Content Form (Create / Edit) ────────────────────────────────────────────────

interface ContentFormState {
  title: string;
  key: string;
  content: string;
  contentType: ContentType;
  status: SystemContentStatus;
}

const EMPTY_FORM: ContentFormState = {
  title: "",
  key: "",
  content: "",
  contentType: "Markdown",
  status: "Draft",
};

interface ContentFormDialogProps {
  open: boolean;
  editing: SystemContent | null;
  onClose: () => void;
  onSaved: () => void;
}

function ContentFormDialog({ open, editing, onClose, onSaved }: ContentFormDialogProps) {
  const [form, setForm] = useState<ContentFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title ?? "",
        key: editing.key ?? "",
        content: editing.content ?? "",
        contentType: editing.contentType ?? "Markdown",
        status: editing.status ?? "Draft",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing, open]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.key.trim()) {
      toast.error("Vui lòng nhập Tiêu đề và Key");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const body: UpdateSystemContentCommand = { ...form };
        await systemContentAPI.update(editing.id, body);
        toast.success("Đã cập nhật chính sách");
      } else {
        const body: CreateSystemContentCommand = { ...form };
        await systemContentAPI.create(body);
        toast.success("Đã tạo chính sách mới");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error("Lưu thất bại", { description: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  };

  const field = (label: string, node: React.ReactNode) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {node}
    </div>
  );

  const select = (
    val: string,
    onChange: (v: string) => void,
    options: { value: string; label: string }[]
  ) => (
    <select
      value={val}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Chỉnh sửa chính sách" : "Tạo chính sách mới"}</DialogTitle>
          <DialogDescription>
            Chính sách được lưu theo Key và hiển thị công khai khi ở trạng thái "Đã xuất bản".
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {field("Tiêu đề *",
            <Input placeholder="VD: Điều khoản sử dụng" value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
          )}
          {field("Key (slug định danh) *",
            <Input placeholder="VD: terms-of-service" value={form.key}
              onChange={(e) => setForm(f => ({ ...f, key: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} />
          )}
          {field("Loại nội dung",
            select(form.contentType, (v) => setForm(f => ({ ...f, contentType: v as ContentType })), [
              { value: "Markdown", label: "Markdown" },
              { value: "Html", label: "HTML" },
            ])
          )}
          {field("Trạng thái",
            select(form.status, (v) => setForm(f => ({ ...f, status: v as SystemContentStatus })), [
              { value: "Draft", label: "Bản nháp" },
              { value: "Published", label: "Xuất bản" },
              { value: "Deleted", label: "Xóa mềm" },
            ])
          )}
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nội dung *</label>
            <textarea
              rows={10}
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder={form.contentType === "Markdown"
                ? "# Tiêu đề\n\nNhập nội dung dạng Markdown..."
                : "<h1>Tiêu đề</h1>\n<p>Nhập nội dung HTML...</p>"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Confirm Dialog ───────────────────────────────────────────────────────

interface DeleteDialogProps {
  item: SystemContent | null;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteDialog({ item, onClose, onDeleted }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await systemContentAPI.delete(item.id);
      toast.success("Đã xóa chính sách");
      onDeleted();
      onClose();
    } catch (err: any) {
      toast.error("Xóa thất bại", { description: err.response?.data?.message || err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa chính sách <b>"{item?.title}"</b>? Hành động này sẽ đánh dấu nội dung là
            Đã xóa (soft delete) và không thể truy cập công khai nữa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={deleting}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function SystemContentsManager() {
  const [items, setItems] = useState<SystemContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SystemContentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SystemContent | null>(null);
  const [deleting, setDeleting] = useState<SystemContent | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await systemContentAPI.getAll({
        Title: search || undefined,
        Status: statusFilter !== "all" ? statusFilter : undefined,
        PageIndex: page,
        PageSize: PAGE_SIZE,
      });
      if (res.data?.items) {
        setItems(res.data.items);
        setTotalCount(res.data.totalItems ?? res.data.totalCount ?? 0);
      }
    } catch (err: any) {
      toast.error("Không thể tải danh sách chính sách");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-primary" />
                Chính sách &amp; Nội dung hệ thống
              </CardTitle>
              <CardDescription>
                Quản lý Điều khoản sử dụng, Chính sách bảo mật và các trang tĩnh của nền tảng.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchItems}
                disabled={loading}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
              <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" /> Tạo mới
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo tiêu đề..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "Published", "Draft", "Deleted"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s === "all" ? "Tất cả" : STATUS_MAP[s].label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider">Tiêu đề</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Key</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Loại</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Trạng thái</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Cập nhật</TableHead>
                <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p className="text-sm">Chưa có chính sách nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow className="group">
                      <TableCell className="pl-6">
                        <button
                          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          className="flex items-center gap-2 text-left"
                        >
                          {expandedId === item.id
                            ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                          <span className="text-sm font-medium text-foreground">{item.title || "—"}</span>
                        </button>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.key || "—"}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">{item.contentType}</Badge>
                      </TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("vi-VN") : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                            onClick={() => { setEditing(item); setFormOpen(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleting(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === item.id && (
                      <TableRow key={`${item.id}-expanded`} className="bg-muted/20">
                        <TableCell colSpan={6} className="pl-12 pr-6 py-4">
                          <pre className="max-h-48 overflow-auto rounded-lg bg-background border border-border p-3 text-xs font-mono whitespace-pre-wrap text-foreground">
                            {item.content || "(Nội dung trống)"}
                          </pre>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Hiển thị <span className="font-semibold text-foreground">{items.length}</span> /{" "}
              <span className="font-semibold text-foreground">{totalCount}</span> chính sách
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md border text-xs text-muted-foreground hover:bg-muted disabled:opacity-40">‹</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn("flex h-7 w-7 items-center justify-center rounded-md text-xs",
                      page === p ? "bg-primary text-primary-foreground font-semibold" : "border text-muted-foreground hover:bg-muted")}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-md border text-xs text-muted-foreground hover:bg-muted disabled:opacity-40">›</button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ContentFormDialog open={formOpen} editing={editing} onClose={() => setFormOpen(false)} onSaved={fetchItems} />
      <DeleteDialog item={deleting} onClose={() => setDeleting(null)} onDeleted={fetchItems} />
    </>
  );
}
