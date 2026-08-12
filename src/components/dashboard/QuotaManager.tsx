"use client";

import React, { useState, useEffect, useCallback, Fragment } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  BarChart3,
  Zap,
  MessageSquare,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { paymentAPI, type Payment, type PaymentStatus } from "@/infrastructure/api/subscriptionAPI";
import { businessAPI, type Business } from "@/infrastructure/api/businessAPI";

// ── Helpers ─────────────────────────────────────────────────────────────────

const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; cls: string }> = {
  Completed: { label: "Thành công", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Pending: { label: "Đang xử lý", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  Failed: { label: "Thất bại", cls: "bg-red-500/10 text-red-600 border-red-500/20" },
  Cancelled: { label: "Đã hủy", cls: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
};

function PaymentStatusBadge({ status }: { status?: PaymentStatus }) {
  if (!status) return null;
  const cfg = PAYMENT_STATUS_MAP[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

// ── Quota Progress Bar ───────────────────────────────────────────────────────

function QuotaBar({ label, used, total, icon: Icon, color }: {
  label: string;
  used: number;
  total: number;
  icon: React.ElementType;
  color: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          {label}
        </div>
        <span className={cn("font-semibold", pct >= 90 ? "text-red-600" : pct >= 70 ? "text-amber-600" : "text-foreground")}>
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-2 rounded-full transition-all", pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-[10px] text-muted-foreground">
        {used.toLocaleString("vi-VN")} / {total.toLocaleString("vi-VN")}
      </p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function QuotaManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);
  const PAGE_SIZE = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi song song nhưng bắt lỗi riêng biệt để tránh lỗi 403 của payment làm sập cả page
      const payPromise = paymentAPI.getAll({
        "Filter.Search": search || undefined,
        "Filter.PaymentEnums": statusFilter !== "all" ? statusFilter : undefined,
        "Filter.PageIndex": page,
        "Filter.PageSize": PAGE_SIZE,
        "Filter.CreateAtOrderBy": "desc"
      } as any).catch(err => {
        console.warn("Could not fetch payments (403 or other error):", err);
        return { data: { items: [], totalItems: 0, totalCount: 0 } };
      });

      const bizPromise = businessAPI.getAll({ "Filter.PageSize": 100 } as any).catch(err => {
        console.warn("Could not fetch businesses:", err);
        return { data: { items: [], totalItems: 0, totalCount: 0 } };
      });

      const [payRes, bizRes] = await Promise.all([payPromise, bizPromise]);
      
      const payList = payRes?.data?.items ?? [];
      payList.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      setPayments(payList);
      setTotalCount(payRes?.data?.totalItems ?? payRes?.data?.totalCount ?? 0);
      setBusinesses(bizRes?.data?.items ?? []);
    } catch (err: any) {
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [fetchData]);

  const handleExpand = async (payment: Payment) => {
    if (expandedId === payment.id) {
      setExpandedId(null);
      setDetailPayment(null);
      return;
    }
    setExpandedId(payment.id ?? null);
    if (payment.orderCode) {
      setDetailLoading(true);
      try {
        const res = await paymentAPI.getByOrderCode(payment.orderCode);
        setDetailPayment(res.data ?? null);
      } catch {
        setDetailPayment(null);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Summary stats
  const completedCount = payments.filter(p => p.status === "Completed").length;
  const pendingCount = payments.filter(p => p.status === "Pending").length;
  const totalRevenue = payments
    .filter(p => p.status === "Completed")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Tổng giao dịch", value: totalCount, sub: "trong kỳ", icon: BarChart3, cls: "bg-indigo-500/10 text-indigo-600" },
          { label: "Thành công", value: completedCount, sub: "giao dịch hoàn tất", icon: Zap, cls: "bg-emerald-500/10 text-emerald-600" },
          { label: "Doanh thu (trang này)", value: `₫${(totalRevenue / 1000).toFixed(0)}K`, sub: "từ gói đã thanh toán", icon: Package, cls: "bg-violet-500/10 text-violet-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-start gap-4 pt-5">
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", stat.cls)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
                Lịch sử Thanh toán &amp; Quota Subscription
              </CardTitle>
              <CardDescription>
                Theo dõi gói cước và mức tiêu thụ tài nguyên AI của từng doanh nghiệp.
                Nhấn vào hàng để xem chi tiết quota.
              </CardDescription>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Tìm theo mã đơn, tên gói..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "Completed", "Pending", "Failed", "Cancelled"] as const).map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all",
                    statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                  {s === "all" ? "Tất cả" : PAYMENT_STATUS_MAP[s].label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider">Doanh nghiệp</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Mã đơn</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Gói cước</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Số tiền</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">Trạng thái</TableHead>
                <TableHead className="pr-6 text-xs font-semibold uppercase tracking-wider">Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                    Không tìm thấy giao dịch nào
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <Fragment key={payment.id}>
                    <TableRow key={payment.id}
                      className="group cursor-pointer hover:bg-muted/30"
                      onClick={() => handleExpand(payment)}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          {expandedId === payment.id
                            ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                          <span className="text-sm font-medium">
                            {businesses.find(b => b.id === payment.businessId)?.businessName
                              ?? (payment.businessId ? payment.businessId.slice(0, 8) + "..." : "—")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{payment.orderCode ?? "—"}</code>
                      </TableCell>
                      <TableCell className="text-sm">{payment.subscriptionName ?? "—"}</TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold">
                          {payment.amount != null ? `₫${payment.amount.toLocaleString("vi-VN")}` : "—"}
                        </span>
                      </TableCell>
                      <TableCell><PaymentStatusBadge status={payment.status} /></TableCell>
                      <TableCell className="pr-6 text-xs text-muted-foreground">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail: Quota */}
                    {expandedId === payment.id && (
                      <TableRow key={`${payment.id}-detail`} className="bg-indigo-50/40 dark:bg-indigo-950/10">
                        <TableCell colSpan={6} className="px-12 py-5">
                          {detailLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải chi tiết quota...
                            </div>
                          ) : detailPayment ? (
                            <div className="grid gap-4 sm:grid-cols-3">
                              <QuotaBar
                                label="Token AI đã dùng"
                                used={0}
                                total={0}
                                icon={Zap}
                                color="text-violet-500"
                              />
                              <QuotaBar
                                label="Số tin nhắn"
                                used={0}
                                total={0}
                                icon={MessageSquare}
                                color="text-blue-500"
                              />
                              <QuotaBar
                                label="Số sản phẩm"
                                used={0}
                                total={0}
                                icon={Package}
                                color="text-emerald-500"
                              />
                              <div className="sm:col-span-3 mt-2 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Gói:</span> {(detailPayment as any).subscriptionPlan?.name ?? "—"} &nbsp;|&nbsp;
                                <span className="font-semibold text-foreground">Doanh nghiệp:</span> {(detailPayment as any).bussiness?.name ?? "—"} &nbsp;|&nbsp;
                                <span className="font-semibold text-foreground">Mã:</span> {detailPayment.orderCode}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Không có dữ liệu chi tiết.</p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Hiển thị <span className="font-semibold text-foreground">{payments.length}</span> /{" "}
              <span className="font-semibold text-foreground">{totalCount}</span> giao dịch
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
    </div>
  );
}
