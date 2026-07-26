"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  History,
  Zap,
  MessageSquare,
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { paymentAPI, subscriptionAPI, type Payment, type Subscription, type PaymentStatus } from "@/infrastructure/api/subscriptionAPI";
import { businessAPI, type Business } from "@/infrastructure/api/businessAPI";

// ── Helpers ─────────────────────────────────────────────────────────────────

const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; cls: string }> = {
  Completed: { label: "Thành công", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Pending: { label: "Đang xử lý", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  Failed: { label: "Thất bại", cls: "bg-red-500/10 text-red-600 border-red-500/20" },
  Cancelled: { label: "Đã hủy", cls: "bg-slate-500/10 text-slate-500 border-slate-400/20" },
};

function QuotaBar({ label, used, total, icon: Icon, color }: {
  label: string;
  used?: number;
  total?: number;
  icon: any;
  color: string;
}) {
  const isUnlimited = total == null || total === -1 || total === 0;
  const pct = isUnlimited || !used || !total ? 0 : Math.min(Math.round((used / total) * 100), 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Icon className={cn("h-4 w-4", color)} />
          <span>{label}</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {used != null ? used.toLocaleString("vi-VN") : "0"} / {isUnlimited ? "Không giới hạn" : total?.toLocaleString("vi-VN")}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", isUnlimited ? "bg-emerald-500/50 w-full" : color.replace("text-", "bg-"))}
          style={{ width: isUnlimited ? "100%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function BillingManager() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePayment, setActivePayment] = useState<Payment | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [businessProfile, setBusinessProfile] = useState<Business | null>(null);
  
  const params = useParams();
  const tenantId = params?.tenant_id as string;

  // In real app, you get this from AuthContext or /auth/me
  // For demo, we just fetch all payments and assume the most recent Completed is the active one for this tenant
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [payRes, plansRes, profileRes] = await Promise.all([
          paymentAPI.getUserPayments({ "Filter.PageSize": 50 }),
          subscriptionAPI.getAll({ "Filter.PageSize": 50 }),
          businessAPI.getProfile().catch(() => null)
        ]);
        
        const payList = payRes.data?.items ?? [];
        setPayments(payList);
        setPlans(plansRes.data?.items ?? []);
        if (profileRes?.data) setBusinessProfile(profileRes.data);
        
        // Find most recent completed payment to simulate "Active Plan"
        const completed = payList.find(p => p.status === "Completed");
        if (completed && completed.orderCode) {
          try {
            const detailRes = await paymentAPI.getByOrderCode(completed.orderCode);
            setActivePayment(detailRes.data ?? null);
          } catch (e) {
             setActivePayment(completed);
          }
        } else {
          // Nếu chưa có giao dịch Completed nào (ví dụ doanh nghiệp dùng gói miễn phí Basic mặc định),
          // tự động lấy gói cước từ businessProfile hoặc gói cước có giá = 0 / gói Basic để hiển thị "Đang hoạt động".
          const profile: any = profileRes?.data;
          const allPlans = plansRes.data?.items ?? [];
          const defaultPlan = allPlans.find((p: any) => p.id === profile?.subscriptionPlanId || p.price === 0 || p.name?.toLowerCase().includes("basic")) || allPlans[0];
          if (defaultPlan) {
            setActivePayment({
              subscriptionPlan: defaultPlan,
              status: "Completed",
              amount: defaultPlan.price || 0
            } as any);
          }
        }
      } catch (err: any) {
        toast.error("Không thể tải thông tin thanh toán");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activePlanData = activePayment ? (activePayment as any).subscriptionPlan as Subscription : null;

  // Hàm hủy đơn thanh toán đang xử lý (Pending)
  const handleCancelPayment = async (payment: Payment) => {
    if (!payment.orderCode) {
      toast.error("Đơn này không có mã thanh toán (Order Code)");
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn thanh toán #${payment.orderCode} (Đang xử lý) không?`)) {
      return;
    }
    const targetId = payment.id || String(payment.orderCode);
    setIsCancelling(targetId);
    try {
      await paymentAPI.cancelPayment(payment.orderCode);
      toast.success(`Đã hủy giao dịch #${payment.orderCode} thành công! Bạn có thể chọn mua lại gói cước.`);
      
      // Load lại danh sách thanh toán
      const payRes = await paymentAPI.getUserPayments({ "Filter.PageSize": 50 });
      setPayments(payRes.data?.items ?? []);
    } catch (err: any) {
      console.error("Cancel payment error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.title || err.message || "Không thể hủy đơn thanh toán này.";
      toast.error("Lỗi khi hủy đơn", { description: errMsg });
    } finally {
      setIsCancelling(null);
    }
  };

  const handleSubscribe = async (plan: Subscription) => {
    if (!businessProfile?.id) {
      toast.error("Không tìm thấy thông tin doanh nghiệp (ID)");
      return;
    }

    // Kiểm tra thông minh: Nếu doanh nghiệp đang có một đơn hàng Pending (Đang xử lý)
    const pendingPayment = payments.find(p => p.status === "Pending");
    if (pendingPayment && pendingPayment.orderCode) {
      if (window.confirm(`Bạn đang có đơn hàng #${pendingPayment.orderCode} (Đang xử lý). Bạn có muốn tự động hủy đơn cũ này để tạo thanh toán mới cho gói ${plan.name} không?`)) {
        try {
          toast.loading("Đang hủy đơn thanh toán cũ...", { id: "cancel-old" });
          await paymentAPI.cancelPayment(pendingPayment.orderCode);
          toast.dismiss("cancel-old");
          toast.success("Đã hủy đơn cũ thành công! Đang mở cổng thanh toán mới...");
          // Cập nhật lại list
          const payRes = await paymentAPI.getUserPayments({ "Filter.PageSize": 50 });
          setPayments(payRes.data?.items ?? []);
        } catch (e: any) {
          toast.dismiss("cancel-old");
          const errMsg = e.response?.data?.message || e.response?.data?.title || e.message;
          toast.error("Không thể hủy đơn hàng cũ", { description: errMsg });
          return;
        }
      } else {
        return;
      }
    }

    setIsSubscribing(plan.id);
    try {
      const res = await paymentAPI.createPaymentLink({
        subscriptionPlanId: plan.id,
        returnUrlDomain: window.location.origin
      });
      
      // Handle various response wrappers (data, paymentUrl, checkoutUrl)
      const url = res?.data?.paymentUrl || (res?.data as any)?.checkoutUrl || (res as any)?.paymentUrl || (res as any)?.checkoutUrl || (typeof res.data === 'string' && (res.data as string).startsWith('http') ? res.data : null);
      
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Lỗi tạo link thanh toán (Response rỗng)", { 
          description: "Vui lòng xem log console. Response: " + JSON.stringify(res)
        });
        console.error("Payment API Response:", res);
      }
    } catch (err: any) {
      console.error("Payment API Error:", err);
      let errMsg = err.response?.data?.message || err.response?.data?.title || err.message;
      if (err.response?.status === 402) errMsg = "Tài khoản cần nâng cấp hoặc thanh toán thất bại (402).";
      
      // Xử lý thông minh lỗi Lỗi 1: Nếu BE báo doanh nghiệp đã có gói cước này rồi
      if (err.response?.status === 400 && typeof errMsg === "string" && errMsg.toLowerCase().includes("already has an active subscription")) {
        toast.success("Gói cước này đang được kích hoạt cho doanh nghiệp của bạn!", {
          description: "Hệ thống đã cập nhật hiển thị gói cước hiện tại."
        });
        setActivePayment({ subscriptionPlan: plan, status: "Completed", amount: plan.price } as any);
        setIsPricingModalOpen(false);
        return;
      }

      // Xử lý thông minh lỗi Lỗi 2: Nếu BE báo có đơn đang chờ xử lý (pending payment order exists)
      if (err.response?.status === 400 && typeof errMsg === "string" && (errMsg.toLowerCase().includes("pending") || errMsg.toLowerCase().includes("processing") || errMsg.toLowerCase().includes("đang xử lý") || errMsg.toLowerCase().includes("already"))) {
        const anyPending = payments.find(p => p.status === "Pending");
        if (anyPending && anyPending.orderCode) {
          if (window.confirm(`Hệ thống báo bạn đang có đơn hàng #${anyPending.orderCode} (Đang xử lý). Bạn có muốn tự động hủy đơn cũ này để tạo lại thanh toán mới không?`)) {
            try {
              toast.loading("Đang hủy đơn hàng cũ...", { id: "cancel-old-catch" });
              await paymentAPI.cancelPayment(anyPending.orderCode);
              toast.dismiss("cancel-old-catch");
              toast.success("Đã hủy đơn cũ thành công! Vui lòng chọn lại gói cước.");
              const payRes = await paymentAPI.getUserPayments({ "Filter.PageSize": 50 });
              setPayments(payRes.data?.items ?? []);
            } catch (e: any) {
              toast.dismiss("cancel-old-catch");
              toast.error("Không thể hủy đơn hàng cũ", { description: e?.message || "Lỗi khi hủy" });
            }
          }
          return;
        }
      }

      if (err.response?.status === 400) errMsg = errMsg || "Dữ liệu không hợp lệ (400).";
      
      toast.error("Không thể khởi tạo thanh toán", {
        description: errMsg,
      });
    } finally {
      setIsSubscribing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-12">
        {/* Active Plan & Quota Card */}
        <div className="md:col-span-5 lg:col-span-4">
          <Card className="h-full border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" />
                Gói cước hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : activePlanData ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">{activePlanData.name}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Đang hoạt động
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-xl bg-background/60 p-4 shadow-sm backdrop-blur-sm border border-primary/10">
                    <h4 className="font-semibold text-foreground">Sử dụng tài nguyên</h4>
                    <div className="space-y-5">
                       <QuotaBar
                          label="Token AI"
                          used={0}
                          total={activePlanData.tokenLimit || 0}
                          icon={Zap}
                          color="text-violet-500"
                        />
                        <QuotaBar
                          label="Tin nhắn"
                          used={0}
                          total={activePlanData.messageLimit || 0}
                          icon={MessageSquare}
                          color="text-blue-500"
                        />
                        <QuotaBar
                          label="Sản phẩm"
                          used={0}
                          total={activePlanData.maxProductAllowed || 0}
                          icon={Package}
                          color="text-emerald-500"
                        />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Button className="w-full font-semibold" onClick={() => setIsPricingModalOpen(true)}>Nâng cấp gói cước</Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Chu kỳ thanh toán tiếp theo: <span className="font-medium text-foreground">Chưa có dữ liệu</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
                  <div>
                    <p className="font-medium text-foreground">Chưa có gói cước nào</p>
                    <p className="text-sm text-muted-foreground">Vui lòng đăng ký gói cước để sử dụng dịch vụ.</p>
                  </div>
                  <Button className="mt-2 w-full" onClick={() => setIsPricingModalOpen(true)}>Xem bảng giá</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invoice History */}
        <div className="md:col-span-7 lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-muted-foreground" />
                Lịch sử giao dịch
              </CardTitle>
              <CardDescription>Danh sách các khoản thanh toán gần đây của doanh nghiệp.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="pl-6 font-semibold">Mã đơn</TableHead>
                    <TableHead className="font-semibold">Gói cước</TableHead>
                    <TableHead className="font-semibold">Số tiền</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="pr-6 text-right font-semibold">Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <p className="text-sm text-muted-foreground">Chưa có lịch sử giao dịch</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => {
                      const planNameDisplay = payment.subscriptionName || (payment as any).planName || (payment as any).description || plans.find(p => p.price === payment.amount)?.name || "—";
                      const isTargeting = isCancelling === (payment.id || String(payment.orderCode));
                      return (
                        <TableRow key={payment.id || payment.orderCode} className={payment.status === "Pending" ? "bg-amber-500/5 hover:bg-amber-500/10 transition-colors" : ""}>
                          <TableCell className="pl-6 font-mono text-xs font-semibold">{payment.orderCode ?? "—"}</TableCell>
                          <TableCell className="font-medium">{planNameDisplay}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {payment.amount != null ? `₫${payment.amount.toLocaleString("vi-VN")}` : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-[11px]", payment.status ? PAYMENT_STATUS_MAP[payment.status].cls : "")}>
                                {payment.status ? PAYMENT_STATUS_MAP[payment.status].label : "—"}
                              </Badge>
                              {payment.status === "Pending" && (
                                <button
                                  onClick={() => handleCancelPayment(payment)}
                                  disabled={isTargeting}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline transition-all bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/30 shadow-sm cursor-pointer disabled:opacity-50"
                                  title="Nhấn để hủy giao dịch đang xử lý này"
                                >
                                  {isTargeting ? (
                                    <Loader2 className="h-3 w-3 animate-spin inline" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 inline" />
                                  )}
                                  Hủy đơn
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                            {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("vi-VN") : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pricing Modal */}
      <Dialog open={isPricingModalOpen} onOpenChange={setIsPricingModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[800px] md:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Bảng giá gói cước</DialogTitle>
            <DialogDescription className="text-center">
              Chọn gói cước phù hợp với nhu cầu của doanh nghiệp bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col border-primary/10 shadow-sm hover:shadow-md transition-shadow relative">
                {activePlanData?.id === plan.id && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">Gói hiện tại</Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.description && <CardDescription className="line-clamp-2">{plan.description}</CardDescription>}
                  <div className="mt-4 flex items-baseline text-2xl font-extrabold text-primary break-all">
                    ₫{plan.price.toLocaleString("vi-VN")}
                    <span className="ml-1 text-sm font-medium text-muted-foreground shrink-0">/{plan.duration} ngày</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-6">
                  <div className="space-y-3 text-sm flex-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-violet-500" />
                      <span><b>{plan.tokenLimit.toLocaleString("vi-VN")}</b> Token AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span><b>{plan.messageLimit.toLocaleString("vi-VN")}</b> Tin nhắn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-emerald-500" />
                      <span><b>{plan.maxProductAllowed.toLocaleString("vi-VN")}</b> Sản phẩm</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full font-semibold" 
                    variant={activePlanData?.id === plan.id ? "outline" : "default"}
                    disabled={activePlanData?.id === plan.id || isSubscribing === plan.id}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isSubscribing === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {activePlanData?.id === plan.id ? "Đang sử dụng" : plan.price > 0 ? "Thanh toán ngay" : "Bắt đầu miễn phí"}
                  </Button>
                </CardContent>
              </Card>
            ))}
            {plans.length === 0 && (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Hiện chưa có gói cước nào được cung cấp.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
