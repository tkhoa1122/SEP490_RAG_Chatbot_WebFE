"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  CheckCircle2,
  Ban,
  MoreHorizontal,
  ExternalLink,
  Trash2,
  Eye,
  Filter,
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

// ─── Types ──────────────────────────────────────────────────────────────────

type TenantStatus = "active" | "pending" | "suspended";

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: TenantStatus;
  staffCount: number;
  plan: string;
  ownerEmail: string;
  createdAt: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_TENANTS: Tenant[] = [
  {
    id: "t-001",
    name: "Eco Fashion",
    domain: "eco-fashion",
    status: "active",
    staffCount: 8,
    plan: "Pro",
    ownerEmail: "owner@ecofashion.vn",
    createdAt: "12/01/2025",
  },
  {
    id: "t-002",
    name: "Coolmate Store",
    domain: "coolmate",
    status: "active",
    staffCount: 15,
    plan: "Enterprise",
    ownerEmail: "admin@coolmate.vn",
    createdAt: "05/11/2024",
  },
  {
    id: "t-003",
    name: "Thời trang Yody",
    domain: "yody-fashion",
    status: "active",
    staffCount: 22,
    plan: "Enterprise",
    ownerEmail: "contact@yody.vn",
    createdAt: "20/08/2024",
  },
  {
    id: "t-004",
    name: "Shop Áo Đẹp 365",
    domain: "aodep365",
    status: "pending",
    staffCount: 2,
    plan: "Starter",
    ownerEmail: "hello@aodep365.vn",
    createdAt: "05/06/2025",
  },
  {
    id: "t-005",
    name: "Streetwear VN",
    domain: "streetwear-vn",
    status: "pending",
    staffCount: 1,
    plan: "Pro",
    ownerEmail: "info@streetwear.vn",
    createdAt: "07/06/2025",
  },
  {
    id: "t-006",
    name: "Luxury Brand Outlet",
    domain: "luxuryoutlet",
    status: "suspended",
    staffCount: 5,
    plan: "Pro",
    ownerEmail: "admin@luxury.vn",
    createdAt: "15/03/2025",
  },
  {
    id: "t-007",
    name: "Mẹ và Bé Fashion",
    domain: "mevabe-fashion",
    status: "active",
    staffCount: 4,
    plan: "Starter",
    ownerEmail: "shop@mevabe.vn",
    createdAt: "28/04/2025",
  },
  {
    id: "t-008",
    name: "Uniqlo VN Partner",
    domain: "uniqlo-partner",
    status: "pending",
    staffCount: 3,
    plan: "Enterprise",
    ownerEmail: "partner@uniqlovn.com",
    createdAt: "09/06/2025",
  },
];

// ─── Status Badge ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TenantStatus, { label: string; classes: string }> = {
  active: {
    label: "Hoạt động",
    classes: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  pending: {
    label: "Chờ duyệt",
    classes: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  suspended: {
    label: "Bị khóa",
    classes: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

function StatusBadge({ status }: { status: TenantStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        config.classes
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" && "bg-emerald-500",
          status === "pending" && "bg-amber-500",
          status === "suspended" && "bg-red-500"
        )}
      />
      {config.label}
    </span>
  );
}

// ─── Plan Badge ─────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-0.5 text-[11px] font-medium",
        plan === "Enterprise" && "border-violet-500/30 text-violet-600 bg-violet-500/5",
        plan === "Pro" && "border-blue-500/30 text-blue-600 bg-blue-500/5",
        plan === "Starter" && "border-slate-400/30 text-slate-500 bg-slate-500/5"
      )}
    >
      {plan}
    </Badge>
  );
}

// ─── Action Dropdown ─────────────────────────────────────────────────────────

function ActionCell({
  tenant,
  onApprove,
  onSuspend,
}: {
  tenant: Tenant;
  onApprove: (id: string) => void;
  onSuspend: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      {/* Primary action based on status */}
      {tenant.status === "pending" && (
        <button
          onClick={() => onApprove(tenant.id)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-white",
            "bg-emerald-600 transition-all hover:bg-emerald-700 active:scale-[0.97]"
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          Duyệt
        </button>
      )}
      {tenant.status === "active" && (
        <button
          onClick={() => onSuspend(tenant.id)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground",
            "transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          )}
        >
          <Ban className="h-3 w-3" />
          Khóa
        </button>
      )}
      {tenant.status === "suspended" && (
        <button
          onClick={() => onApprove(tenant.id)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground",
            "transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
          )}
        >
          <CheckCircle2 className="h-3 w-3" />
          Mở khóa
        </button>
      )}

      {/* More menu */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-background py-1 shadow-xl">
              <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                Xem chi tiết
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                Truy cập shop
              </button>
              <div className="my-1 border-t border-border" />
              <button className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
                Xóa doanh nghiệp
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Table ─────────────────────────────────────────────────────────────

export function TenantDataTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "all">("all");

  const filtered = MOCK_TENANTS.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    alert(`✅ Đã duyệt doanh nghiệp: ${id}`);
  };

  const handleSuspend = (id: string) => {
    alert(`🔒 Đã khóa doanh nghiệp: ${id}`);
  };

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Danh sách doanh nghiệp</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Quản lý {MOCK_TENANTS.length} doanh nghiệp đang thuê nền tảng
            </p>
          </div>
          <button
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-primary-foreground",
              "bg-primary transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20",
              "active:scale-[0.98]"
            )}
          >
            <Plus className="h-4 w-4" />
            Thêm doanh nghiệp
          </button>
        </div>

        {/* Filters row */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo tên shop, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm",
                "outline-none transition-all placeholder:text-muted-foreground/60",
                "focus:border-ring focus:ring-2 focus:ring-ring/20"
              )}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["all", "active", "pending", "suspended"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-all",
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {status === "all"
                  ? "Tất cả"
                  : status === "active"
                  ? "Hoạt động"
                  : status === "pending"
                  ? "Chờ duyệt"
                  : "Bị khóa"}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[240px] pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tên shop
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Domain
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trạng thái
              </TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Nhân viên
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gói cước
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <p className="text-sm text-muted-foreground">
                    Không tìm thấy doanh nghiệp nào
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tenant) => (
                <TableRow key={tenant.id} className="group">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600">
                        {tenant.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {tenant.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tenant.ownerEmail}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
                      {tenant.domain}
                    </code>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm font-medium text-foreground">
                      {tenant.staffCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <PlanBadge plan={tenant.plan} />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{tenant.createdAt}</span>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <ActionCell
                      tenant={tenant}
                      onApprove={handleApprove}
                      onSuspend={handleSuspend}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Hiển thị <span className="font-semibold text-foreground">{filtered.length}</span> /{" "}
            <span className="font-semibold text-foreground">{MOCK_TENANTS.length}</span> doanh nghiệp
          </p>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:bg-muted">
              ‹
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              1
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:bg-muted">
              2
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:bg-muted">
              ›
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
