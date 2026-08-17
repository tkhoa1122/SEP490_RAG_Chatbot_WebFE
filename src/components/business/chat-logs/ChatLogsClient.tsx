"use client";

import { useState, useEffect, use } from "react";
import { 
  MessageSquare, User as UserIcon, Calendar, ArrowRight, Search, Loader2, Bot, User, Clock,
  X, ShoppingBag, Scale, SearchIcon, Package, Database, Zap, Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { customerAPI } from "@/infrastructure/api/customerAPI";
import { productAPI } from "@/infrastructure/api/productAPI";
import type { Customer, Conversation, Message, OrderEvent, ProductComparison, SearchQueryLog } from "@/infrastructure/dto/CustomerDTO";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

// ─── Markdown components for table rendering ────────────────────────────────
const markdownComponents = {
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-2 rounded-lg border border-border">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted/60 text-foreground">{children}</thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2 text-left font-semibold text-xs border-r last:border-r-0 border-border whitespace-nowrap">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 text-xs border-r last:border-r-0 border-border">{children}</td>
  ),
  p: ({ children }: any) => <p className="mb-1 last:mb-0">{children}</p>,
  strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
};

// ─── Chat Bubble Renderer (shared across all tabs) ──────────────────────────
function ChatBubble({ msg, searchLog }: { msg: Message, searchLog?: SearchQueryLog }) {
  const isBot = msg.senderType === "ChatBot";
  const [showInsights, setShowInsights] = useState(false);

  return (
    <div className={`flex flex-col gap-2 ${isBot ? "items-start" : "items-end"}`}>
      <div className={`flex w-full ${isBot ? "justify-start" : "justify-end"}`}>
        <div className={`flex max-w-[85%] gap-2 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
          <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs ${isBot ? "bg-primary/10 text-primary" : "bg-muted"}`}>
            {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}>
            <div className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
              isBot ? "bg-card border rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"
            }`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {msg.content}
              </ReactMarkdown>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 px-1">
              {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { timeStyle: "short" })}
            </span>
          </div>
        </div>
      </div>

      {/* RAG Search Insights Card */}
      {searchLog && (
        <div className="ml-9 mt-1 w-full max-w-[85%] rounded-xl border bg-muted/30 shadow-sm overflow-hidden text-sm">
          <button 
            onClick={() => setShowInsights(!showInsights)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-violet-50/50 hover:bg-violet-50 transition-colors border-b border-violet-100/50"
          >
            <div className="flex items-center gap-2 text-violet-700 font-medium text-xs">
              <Database className="h-3.5 w-3.5" />
              <span>Dữ liệu truy xuất RAG</span>
              <Badge variant="outline" className="ml-2 text-[10px] bg-white border-violet-200 text-violet-600">
                {searchLog.resultCount || 0} kết quả
              </Badge>
              {searchLog.retrievalLatencyMilliseconds && (
                <Badge variant="outline" className="text-[10px] bg-white border-violet-200 text-violet-600 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {(searchLog.retrievalLatencyMilliseconds / 1000).toFixed(2)}s
                </Badge>
              )}
            </div>
            {showInsights ? <ChevronUp className="h-4 w-4 text-violet-400" /> : <ChevronDown className="h-4 w-4 text-violet-400" />}
          </button>

          {showInsights && (
            <div className="p-4 space-y-4">
              {/* Query & Keywords */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                    <SearchIcon className="h-3 w-3" /> User Raw Query
                  </p>
                  <p className="font-medium text-foreground text-xs">{searchLog.userRawQuery || "—"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Trend Keywords
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {searchLog.trendKeywords?.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] font-normal">{kw}</Badge>
                    )) || <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </div>
              </div>

              {/* Products retrieved */}
              {searchLog.products && searchLog.products.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                    <Package className="h-3 w-3" /> Top {searchLog.topKResult} Sản phẩm truy xuất
                  </p>
                  <div className="overflow-x-auto rounded border border-border">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Sản phẩm</th>
                          <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">Danh mục</th>
                          <th className="px-2 py-1.5 text-right font-medium text-muted-foreground">Giá</th>
                          <th className="px-2 py-1.5 text-right font-medium text-muted-foreground">Điểm Vector</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {searchLog.products.map((p, i) => (
                          <tr key={i}>
                            <td className="px-2 py-1.5 font-medium">{p.productName}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">{p.category}</td>
                            <td className="px-2 py-1.5 text-right text-emerald-600 font-medium">
                              {p.price ? new Intl.NumberFormat("vi-VN").format(p.price) : "—"}
                            </td>
                            <td className="px-2 py-1.5 text-right">
                              <Badge variant="outline" className="text-[10px] bg-muted/30">
                                {p.productScore ? p.productScore.toFixed(2) : "0.00"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Conversation Detail Modal ──────────────────────────────────────────────

type InsightTab = "chat" | "search" | "compare" | "orders";

function ConversationDetailModal({
  conversation,
  customer,
  onClose,
}: {
  conversation: Conversation;
  customer: Customer;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<InsightTab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Metadata for filtering
  const [comparisons, setComparisons] = useState<ProductComparison[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchQueryLog[]>([]);
  const [orderEvents, setOrderEvents] = useState<OrderEvent[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const cid = customer.customerExternalId;
  const vid = conversation.id;

  // Always load all messages on open
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await customerAPI.getMessages(cid, vid, { Limit: 100 });
        setMessages([...(res.data?.items || [])].reverse());
      } catch (err: any) {
        toast.error(`Không thể tải tin nhắn: ${err.message || "Lỗi"}`);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [vid]);

  // Fetch filter metadata when switching tabs (lazy)
  useEffect(() => {
    const fetchMeta = async () => {
      setLoadingMeta(true);
      try {
        if (activeTab === "compare" && comparisons.length === 0) {
          const res = await customerAPI.getProductComparisons(cid, vid, { Limit: 50 });
          setComparisons(res.data?.items || []);
        } else if (activeTab === "search" && searchLogs.length === 0) {
          const res = await customerAPI.getSearchQueryLogs(cid, vid, { Limit: 50 });
          setSearchLogs(res.data?.items || []);
        } else if (activeTab === "orders" && orderEvents.length === 0) {
          const res = await customerAPI.getOrderEvents(cid, vid, { Limit: 50 });
          setOrderEvents(res.data?.items || []);
        }
      } catch {
        // silent
      } finally {
        setLoadingMeta(false);
      }
    };
    if (activeTab !== "chat") fetchMeta();
  }, [activeTab, vid]);

  // Filter messages based on active tab
  const getFilteredMessages = (): Message[] => {
    if (activeTab === "chat") return messages;

    if (activeTab === "compare") {
      const msgIds = new Set(comparisons.map((c) => c.messageId).filter(Boolean));
      return msgIds.size > 0 ? messages.filter((m) => msgIds.has(m.id)) : [];
    }

    if (activeTab === "search") {
      const msgIds = new Set(searchLogs.map((s) => (s as any).messageId).filter(Boolean));
      if (msgIds.size > 0) return messages.filter((m) => msgIds.has(m.id));
      // Fallback: if no messageId, filter bot messages that contain search-like content
      const queries = searchLogs.map((s) => s.query?.toLowerCase()).filter(Boolean);
      if (queries.length === 0) return [];
      return messages.filter(
        (m) => queries.some((q) => q && m.content?.toLowerCase().includes(q))
      );
    }

    if (activeTab === "orders") {
      const msgIds = new Set(orderEvents.map((o) => (o as any).messageId).filter(Boolean));
      if (msgIds.size > 0) return messages.filter((m) => msgIds.has(m.id));
      // Fallback: filter messages mentioning order keywords
      const orderKeywords = ["đơn hàng", "đặt hàng", "thanh toán", "order", "mua"];
      return messages.filter(
        (m) => orderKeywords.some((kw) => m.content?.toLowerCase().includes(kw))
      );
    }

    return messages;
  };

  const filteredMessages = getFilteredMessages();
  const isLoading = loadingMessages || (activeTab !== "chat" && loadingMeta);

  const tabs: { key: InsightTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "chat", label: "Tất cả", icon: <MessageSquare className="h-3.5 w-3.5" />, count: messages.length },
    { key: "search", label: "Tìm kiếm", icon: <SearchIcon className="h-3.5 w-3.5" />, count: searchLogs.length || undefined },
    { key: "compare", label: "So sánh", icon: <Scale className="h-3.5 w-3.5" />, count: comparisons.length || undefined },
    { key: "orders", label: "Đơn hàng", icon: <ShoppingBag className="h-3.5 w-3.5" />, count: orderEvents.length || undefined },
  ];

  const emptyTexts: Record<InsightTab, string> = {
    chat: "Không có tin nhắn nào trong phiên này.",
    search: "Không có tin nhắn tìm kiếm sản phẩm nào trong phiên này.",
    compare: "Không có tin nhắn so sánh sản phẩm nào trong phiên này.",
    orders: "Không có tin nhắn liên quan đến đơn hàng nào trong phiên này.",
  };

  const emptyIcons: Record<InsightTab, React.ReactNode> = {
    chat: <MessageSquare />,
    search: <SearchIcon />,
    compare: <Scale />,
    orders: <ShoppingBag />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl h-[88vh] flex flex-col overflow-hidden border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-semibold text-base truncate">{conversation.title || "Phiên chat"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {customer.customerExternalId} · {new Date(conversation.createAt).toLocaleString("vi-VN")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b bg-muted/20">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-md transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-primary text-primary bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="ml-0.5 text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-normal">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Unified Chat Content */}
        <div className="relative flex-1 min-h-0">
          <div className="absolute inset-0 overflow-y-auto">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải...
              </div>
            ) : filteredMessages.length === 0 ? (
              <EmptyState icon={emptyIcons[activeTab]} text={emptyTexts[activeTab]} />
            ) : (
              <div className="p-4 space-y-4">
                {filteredMessages.map((msg) => (
                  <ChatBubble 
                    key={msg.id} 
                    msg={msg} 
                    searchLog={activeTab === "search" ? searchLogs.find(s => s.messageId === msg.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Comparison Card Component ───────────────────────────────────────────────

function ComparisonCard({ comp, index }: { comp: ProductComparison; index: number }) {
  const products = comp.products || [];
  const [productDetails, setProductDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch product details for all products in comparison
  useEffect(() => {
    const idsToFetch = products
      .map((p) => p.productId)
      .filter((id): id is string => !!id && !productDetails[id]);

    if (idsToFetch.length === 0) return;

    const fetchAll = async () => {
      setLoadingDetails(true);
      const results: Record<string, any> = {};
      await Promise.allSettled(
        idsToFetch.map(async (id) => {
          try {
            const res = await productAPI.getProductById(id);
            if (res.data) results[id] = res.data;
          } catch {
            // ignore individual failures
          }
        })
      );
      setProductDetails((prev) => ({ ...prev, ...results }));
      setLoadingDetails(false);
    };

    fetchAll();
  }, [comp.id]);

  const fmt = (price?: number | null) =>
    price != null
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)
      : "—";

  // Merge comparison product data with fetched detail
  const enriched = products.map((p) => ({
    ...p,
    ...(p.productId ? productDetails[p.productId] : {}),
  }));

  // Rows for the comparison table
  const rows: { label: string; key: (p: any) => React.ReactNode }[] = [
    { label: "Tên sản phẩm", key: (p) => <span className="font-medium">{p.productName || p.name || "—"}</span> },
    { label: "Danh mục", key: (p) => p.category || "—" },
    { label: "Thương hiệu", key: (p) => p.brand || "—" },
    { label: "Giá bán", key: (p) => <span className="font-semibold text-emerald-600">{fmt(p.price)}</span> },
    { label: "Tồn kho", key: (p) => p.stockQuantity != null ? `${p.stockQuantity}` : "—" },
    { label: "Mô tả", key: (p) => p.description ? <span className="line-clamp-3 text-xs">{p.description}</span> : "—" },
  ];

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[90%] gap-2 flex-row">
        {/* Bot Avatar */}
        <div className="flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center bg-primary/10 text-primary mt-1">
          <Bot className="h-4 w-4" />
        </div>

        <div className="flex flex-col items-start">
          {/* Bubble */}
          <div className="rounded-2xl rounded-tl-sm bg-card border px-3.5 py-3 text-sm shadow-sm space-y-3 max-w-full">

            {/* Title */}
            {comp.title && (
              <p className="font-medium text-foreground">{comp.title}</p>
            )}

            {/* Loading indicator */}
            {loadingDetails && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Đang tải chi tiết sản phẩm...
              </div>
            )}

            {/* Comparison table — inline inside bubble */}
            {enriched.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      <th className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap w-28">Tiêu chí</th>
                      {enriched.map((p, pi) => (
                        <th key={pi} className="px-3 py-2 text-center font-semibold text-foreground border-l border-border whitespace-nowrap">
                          <span className="flex items-center justify-center gap-1">
                            <Package className="h-3 w-3 text-violet-500" />
                            {p.productName || p.name || `SP ${pi + 1}`}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row, ri) => (
                      <tr key={ri} className="hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap bg-muted/20">
                          {row.label}
                        </td>
                        {enriched.map((p, pi) => (
                          <td key={pi} className="px-3 py-2 text-center border-l border-border">
                            {row.key(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary below table */}
            {comp.summary && (
              <p className="text-xs text-muted-foreground leading-relaxed border-t pt-2">{comp.summary}</p>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-[10px] text-muted-foreground mt-1 px-1">
            {comp.createdAt
              ? new Date(comp.createdAt).toLocaleTimeString("vi-VN", { timeStyle: "short" })
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}



function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {

  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center opacity-40">
        {icon}
      </div>
      <p className="text-sm text-center max-w-xs">{text}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ChatLogsClient({ tenantIdPromise }: { tenantIdPromise: Promise<string> }) {
  const tenantId = use(tenantIdPromise);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingConvos, setLoadingConvos] = useState(false);

  // Fetch Customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await customerAPI.getAll({ PageSize: 50 });
        setCustomers(res.data?.items || []);
      } catch {
        toast.error("Không thể tải danh sách khách hàng");
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

  // Fetch Conversations when a customer is selected
  useEffect(() => {
    if (!selectedCustomer) {
      setConversations([]);
      return;
    }
    const fetchConvos = async () => {
      setLoadingConvos(true);
      try {
        const res = await customerAPI.getConversations(selectedCustomer.customerExternalId);
        setConversations(res.data?.items || []);
      } catch {
        toast.error("Không thể tải lịch sử phiên chat");
      } finally {
        setLoadingConvos(false);
      }
    };
    fetchConvos();
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter((c) =>
    c.customerExternalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] min-h-[600px] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử Chat Khách hàng</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý và xem lại toàn bộ lịch sử tư vấn của Chatbot đối với từng khách hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 flex-1 min-h-0">
        
        {/* Column 1: Customers */}
        <Card className="md:col-span-2 flex flex-col h-full border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20 px-4 py-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm mã KH..."
                  className="pl-8 h-9 text-sm bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingCustomers ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" /> Đang tải...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Chưa có khách hàng nào.</div>
              ) : (
                <div className="divide-y">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between group ${
                        selectedCustomer?.id === c.id ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-sm text-foreground truncate" title={c.customerExternalId}>
                          {c.name || c.customerExternalId}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <ArrowRight className={`h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ${selectedCustomer?.id === c.id ? "opacity-100 text-primary" : ""}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Conversations */}
        <Card className="md:col-span-3 flex flex-col h-full border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20 px-4 py-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {selectedCustomer
                ? `Phiên chat của ${selectedCustomer.name || selectedCustomer.customerExternalId.substring(0, 16)}...`
                : "Phiên chat"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            {!selectedCustomer ? (
              <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground p-6 text-center gap-3">
                <UserIcon className="h-10 w-10 opacity-20" />
                Vui lòng chọn một Khách hàng ở danh sách bên trái.
              </div>
            ) : loadingConvos ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" /> Đang tải phiên chat...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Khách hàng này chưa có phiên chat nào.</div>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {conversations.map((conv) => {
                  const convDate = new Date(conv.createAt);
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className="cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md hover:border-primary/30 bg-card group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                            {conv.title || `Phiên #${conv.id.substring(0, 6).toUpperCase()}`}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {convDate.toLocaleDateString("vi-VN")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {convDate.toLocaleTimeString("vi-VN", { timeStyle: "short" })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={conv.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                            {conv.status}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                            Xem chi tiết <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Conversation Detail with Tabs */}
      {selectedConversation && selectedCustomer && (
        <ConversationDetailModal
          conversation={selectedConversation}
          customer={selectedCustomer}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
}
