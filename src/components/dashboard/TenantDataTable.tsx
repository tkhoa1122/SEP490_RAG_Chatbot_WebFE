"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { businessAPI, type Business, type BusinessStatus } from "@/infrastructure/api/businessAPI";
import { CreateBusinessModal } from "./CreateBusinessModal";

// ─── Status mapping (API → UI) ───────────────────────────────────────────────

type UIStatus = "active" | "pending" | "suspended" | "rejected";

const STATUS_CONFIG: Record<UIStatus, { label: string; classes: string; dot: string }> = {
  active: {
    label: "Hoạt động",
    classes: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Chờ duyệt",
    classes: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    dot: "bg-amber-500",
  },
  suspended: {
    label: "Bị khóa",
    classes: "bg-red-500/10 text-red-600 border-red-500/20",
    dot: "bg-red-500",
  },
  rejected: {
    label: "Bị từ chối",
    classes: "bg-slate-500/10 text-slate-600 border-slate-500/20",
    dot: "bg-slate-400",
  },
};

function apiStatusToUI(status?: BusinessStatus): UIStatus {
  if (status === "ACTIVE") return "active";
  if (status === "PENDING_APPROVAL") return "pending";
  if (status === "DELETED") return "suspended";
  if (status === "REJECTED") return "rejected";
  return "pending";
}

function StatusBadge({ status }: { status?: BusinessStatus }) {
  const uiStatus = apiStatusToUI(status);
  const config = STATUS_CONFIG[uiStatus];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        config.classes
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

// ─── Action Cell ─────────────────────────────────────────────────────────────

function ActionCell({
  tenant,
  onApprove,
  onReject,
  loadingId,
}: {
  tenant: Business;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  loadingId: string | null;
}) {
  const uiStatus = apiStatusToUI(tenant.businessStatus);
  const isLoading = loadingId === tenant.id;

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {uiStatus === "pending" && (
        <>
          <button
            onClick={() => onApprove(tenant.id)}
            disabled={isLoading}
            title="Phê duyệt"
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-white",
              "bg-emerald-600 transition-all hover:bg-emerald-700 active:scale-[0.97]",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Duyệt
          </button>
          <button
            onClick={() => onReject(tenant.id)}
            disabled={isLoading}
            title="Từ chối"
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-white",
              "bg-red-500 transition-all hover:bg-red-600 active:scale-[0.97]",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Từ chối
          </button>
        </>
      )}
      {uiStatus !== "pending" && (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  );
}

// ─── Main Table ─────────────────────────────────────────────────────────────

export function TenantDataTable() {
  const [tenants, setTenants] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BusinessStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const PAGE_SIZE = 10;

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await businessAPI.getAll({
        Search: searchQuery || undefined,
        Status: statusFilter !== "all" ? statusFilter : undefined,
        PageIndex: page,
        PageSize: PAGE_SIZE,
      });
      if (res.data?.items) {
        setTenants(res.data.items);
        setTotalCount(res.data.totalItems ?? res.data.totalCount ?? 0);
      }
    } catch (err: any) {
      toast.error("Không thể tải danh sách doanh nghiệp", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    const delay = setTimeout(fetchTenants, 300); // debounce search
    return () => clearTimeout(delay);
  }, [fetchTenants]);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await businessAPI.verify(id, true);
      toast.success("Đã duyệt doanh nghiệp thành công");
      fetchTenants();
    } catch (err: any) {
      toast.error("Duyệt thất bại", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối doanh nghiệp này?")) return;
    setLoadingId(id);
    try {
      await businessAPI.verify(id, false);
      toast.success("Đã từ chối doanh nghiệp");
      fetchTenants();
    } catch (err: any) {
      toast.error("Từ chối thất bại", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setLoadingId(null);
    }
  };


  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Danh sách doanh nghiệp</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tổng {totalCount} doanh nghiệp đang thuê nền tảng
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTenants}
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-primary-foreground",
                "bg-primary transition-all hover:bg-primary/90 active:scale-[0.98]"
              )}
            >
              <Plus className="h-4 w-4" />
              Thêm doanh nghiệp
            </button>
          </div>
        </div>

        <CreateBusinessModal 
          open={isCreateModalOpen} 
          onOpenChange={setIsCreateModalOpen} 
          onSuccess={fetchTenants} 
        />

        {/* Filters row */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo tên shop, email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className={cn(
                "h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm",
                "outline-none transition-all placeholder:text-muted-foreground/60",
                "focus:border-ring focus:ring-2 focus:ring-ring/20"
              )}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["all", "ACTIVE", "PENDING_APPROVAL", "DELETED", "REJECTED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {status === "all" ? "Tất cả"
                  : status === "ACTIVE" ? "Hoạt động"
                    : status === "PENDING_APPROVAL" ? "Chờ duyệt"
                      : status === "DELETED" ? "Bị khóa"
                        : "Từ chối"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-60 pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tên doanh nghiệp
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email chủ shop
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hotline
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ngày tạo
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <p className="text-sm text-muted-foreground">Không tìm thấy doanh nghiệp nào</p>
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.id} className="group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg  bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600">
                        {(tenant.businessName ?? "?")
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {tenant.businessName || "—"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tenant.businessOwnerName || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {tenant.businessOwnerEmail || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {tenant.hotLine || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="w-30">
                    <StatusBadge status={tenant.businessStatus} />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {tenant.createdAt
                        ? new Date(tenant.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <ActionCell
                      tenant={tenant}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      loadingId={loadingId}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{tenants.length}</span> /{" "}
            <span className="font-semibold text-foreground">{totalCount}</span> doanh nghiệp
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors",
                    page === p
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
