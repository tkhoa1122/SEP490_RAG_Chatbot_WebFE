"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, Search, CreditCard, Loader2, RefreshCw,
  Zap, MessageSquare, Package, Clock, DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  subscriptionAPI,
  type Subscription,
  type SubscriptionAddCommand,
  type StatusEnums,
} from "@/infrastructure/api/subscriptionAPI";

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<StatusEnums, { label: string; cls: string }> = {
  Active: { label: "Đang hoạt động", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Inactive: { label: "Không hoạt động", cls: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
};

const formatVND = (n: number) => `₫${n.toLocaleString("vi-VN")}`;

// ── Plan Detail Card ─────────────────────────────────────────────────────────

function PlanCard({ plan, onEdit, onDelete }: {
  plan: Subscription;
  onEdit: (p: Subscription) => void;
  onDelete: (p: Subscription) => void;
}) {
  return (
    <Card className={cn("flex flex-col transition-shadow hover:shadow-md",
      plan.status === "Active" ? "border-primary/20" : "opacity-70")}>
      <CardContent className="flex flex-col gap-4 pt-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">{plan.name}</p>
            {plan.description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{plan.description}</p>
            )}
          </div>
          <Badge variant="outline" className={cn("shrink-0", STATUS_CFG[plan.status ?? "Inactive"].cls)}>
            {STATUS_CFG[plan.status ?? "Inactive"].label}
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-end gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-primary">
            {formatVND(plan.price)}
          </span>
          <span className="mb-1 text-sm text-muted-foreground">/ {plan.duration} ngày</span>
        </div>

        {/* Limits */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/50 p-3">
          {[
            { icon: Zap, label: "Token", value: plan.tokenLimit.toLocaleString("vi-VN"), color: "text-violet-500" },
            { icon: MessageSquare, label: "Tin nhắn", value: plan.messageLimit.toLocaleString("vi-VN"), color: "text-blue-500" },
            { icon: Package, label: "Sản phẩm", value: plan.maxProductAllowed.toLocaleString("vi-VN"), color: "text-emerald-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon className={cn("h-4 w-4", color)} />
              <p className="text-xs font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString("vi-VN") : "—"}
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => onEdit(plan)}>
            <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
          </Button>
          <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => onDelete(plan)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Form Dialog ──────────────────────────────────────────────────────────────

interface PlanFormState {
  name: string;
  description: string;
  price: number;
  duration: number;
  tokenLimit: number;
  messageLimit: number;
  maxProductAllowed: number;
}

const EMPTY: PlanFormState = { name: "", description: "", price: 0, duration: 30, tokenLimit: 0, messageLimit: 0, maxProductAllowed: 0 };

function PlanFormDialog({ open, editing, onClose, onSaved }: {
  open: boolean;
  editing: Subscription | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PlanFormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description ?? "",
        price: editing.price,
        duration: editing.duration,
        tokenLimit: editing.tokenLimit,
        messageLimit: editing.messageLimit,
        maxProductAllowed: editing.maxProductAllowed,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing, open]);

  const set = (key: keyof PlanFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (key === "name" || key === "description") {
      setForm(f => ({ ...f, [key]: e.target.value }));
    } else {
      let val = e.target.value;
      if (val.length > 1 && val.startsWith("0")) {
        val = val.replace(/^0+/, "");
      }
      const parsed = parseInt(val, 10);
      setForm(f => ({ ...f, [key]: isNaN(parsed) ? 0 : parsed }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên gói"); return; }
    setSaving(true);
    try {
      const body: SubscriptionAddCommand = { ...form };
      if (editing) {
        await subscriptionAPI.update(editing.id, body);
        toast.success("Đã cập nhật gói cước");
      } else {
        await subscriptionAPI.create(body);
        toast.success("Đã tạo gói cước mới");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error("Lưu thất bại", { description: err.response?.data?.message || err.message });
    } finally {
      setSaving(false);
    }
  };

  const numField = (label: string, key: keyof PlanFormState, icon: React.ElementType, suffix?: string) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        {(() => { const Icon = icon; return <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />; })()}
        <Input type="number" min={0} value={form[key].toString()} onChange={set(key)} className="pl-9" />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Chỉnh sửa gói cước" : "Tạo gói cước mới"}</DialogTitle>
          <DialogDescription>Cấu hình giới hạn tài nguyên AI và giá cho gói.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Tên gói *</label>
            <Input placeholder="VD: Pro, Enterprise..." value={form.name} onChange={set("name")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Mô tả</label>
            <Input placeholder="Mô tả ngắn cho gói cước" value={form.description} onChange={set("description")} />
          </div>
          {numField("Giá (VNĐ) *", "price", DollarSign, "₫")}
          {numField("Thời hạn (ngày) *", "duration", Clock, "ngày")}
          {numField("Giới hạn Token AI", "tokenLimit", Zap)}
          {numField("Giới hạn Tin nhắn", "messageLimit", MessageSquare)}
          <div className="col-span-2">
            {numField("Số sản phẩm tối đa", "maxProductAllowed", Package)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editing ? "Lưu thay đổi" : "Tạo gói"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Dialog ────────────────────────────────────────────────────────────

function DeletePlanDialog({ item, onClose, onDeleted }: {
  item: Subscription | null;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const handle = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await subscriptionAPI.delete(item.id);
      toast.success("Đã xóa gói cước");
      onDeleted();
      onClose();
    } catch (err: any) {
      toast.error("Xóa thất bại", { description: err.response?.data?.message || err.message });
    } finally {
      setDeleting(false);
    }
  };
  return (
    <Dialog open={!!item} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Xóa gói cước</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa gói <b>"{item?.name}"</b>?
            Các doanh nghiệp đang dùng gói này sẽ không bị ảnh hưởng ngay nhưng không thể gia hạn nữa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={deleting}>Hủy</Button>
          <Button variant="destructive" onClick={handle} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function PlansManager() {
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await subscriptionAPI.getAll({
        "Filter.Search": search || undefined,
        "Filter.PageSize": 50,
      });
      setPlans(res.data?.items ?? []);
    } catch { toast.error("Không thể tải danh sách gói cước"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(fetch, 300); return () => clearTimeout(t); }, [fetch]);

  const filtered = plans.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Quản lý gói cước &amp; Subscription
              </CardTitle>
              <CardDescription>
                Tạo và cấu hình các gói cước với giới hạn Token, Tin nhắn và Sản phẩm tương ứng.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button onClick={() => setView("cards")} className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "cards" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>Cards</button>
                <button onClick={() => setView("table")} className={cn("px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>Table</button>
              </div>
              <button onClick={fetch} disabled={loading} className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
              <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" /> Tạo gói mới
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Tìm gói cước..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full max-w-sm rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <CreditCard className="h-10 w-10" />
              <p className="text-sm">Chưa có gói cước nào</p>
            </div>
          ) : view === "cards" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(plan => (
                <PlanCard key={plan.id} plan={plan}
                  onEdit={p => { setEditing(p); setFormOpen(true); }}
                  onDelete={p => setDeleting(p)} />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Tên gói</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Giá</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Thời hạn</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Token</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Tin nhắn</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Sản phẩm</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider">Trạng thái</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-semibold">{plan.name}</TableCell>
                    <TableCell className="font-semibold text-primary">{formatVND(plan.price)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{plan.duration} ngày</TableCell>
                    <TableCell className="text-sm">{plan.tokenLimit.toLocaleString("vi-VN")}</TableCell>
                    <TableCell className="text-sm">{plan.messageLimit.toLocaleString("vi-VN")}</TableCell>
                    <TableCell className="text-sm">{plan.maxProductAllowed.toLocaleString("vi-VN")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px]", STATUS_CFG[plan.status ?? "Inactive"].cls)}>
                        {STATUS_CFG[plan.status ?? "Inactive"].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                          onClick={() => { setEditing(plan); setFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleting(plan)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PlanFormDialog open={formOpen} editing={editing} onClose={() => setFormOpen(false)} onSaved={fetch} />
      <DeletePlanDialog item={deleting} onClose={() => setDeleting(null)} onDeleted={fetch} />
    </>
  );
}
