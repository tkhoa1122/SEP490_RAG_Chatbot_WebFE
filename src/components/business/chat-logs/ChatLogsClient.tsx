"use client";

import { useState, useEffect, use } from "react";
import { 
  MessageSquare, User as UserIcon, Calendar, ArrowRight, Search, Loader2, Bot, User, Clock,
  X, ShoppingBag, Scale, SearchIcon, Package
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { customerAPI } from "@/infrastructure/api/customerAPI";
import type { Customer, Conversation, Message, OrderEvent, ProductComparison, SearchQueryLog } from "@/infrastructure/dto/CustomerDTO";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

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
  const [orderEvents, setOrderEvents] = useState<OrderEvent[]>([]);
  const [comparisons, setComparisons] = useState<ProductComparison[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchQueryLog[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  // Fetch data for the active tab
  useEffect(() => {
    const cid = customer.customerExternalId;
    const vid = conversation.id;

    const fetchTab = async () => {
      setLoadingTab(true);
      try {
        if (activeTab === "chat" && messages.length === 0) {
          const res = await customerAPI.getMessages(cid, vid, { Limit: 100 });
          setMessages([...(res.data?.items || [])].reverse());
        } else if (activeTab === "orders" && orderEvents.length === 0) {
          const res = await customerAPI.getOrderEvents(cid, vid, { Limit: 50 });
          setOrderEvents(res.data?.items || []);
        } else if (activeTab === "compare" && comparisons.length === 0) {
          const res = await customerAPI.getProductComparisons(cid, vid, { Limit: 50 });
          setComparisons(res.data?.items || []);
        } else if (activeTab === "search" && searchLogs.length === 0) {
          const res = await customerAPI.getSearchQueryLogs(cid, vid, { Limit: 50 });
          setSearchLogs(res.data?.items || []);
        }
      } catch (err: any) {
        toast.error(`Không thể tải dữ liệu: ${err.message || "Lỗi không xác định"}`);
      } finally {
        setLoadingTab(false);
      }
    };
    fetchTab();
  }, [activeTab, conversation.id]);

  const tabs: { key: InsightTab; label: string; icon: React.ReactNode }[] = [
    { key: "chat", label: "Lịch sử chat", icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { key: "search", label: "Nhật ký tìm kiếm", icon: <SearchIcon className="h-3.5 w-3.5" /> },
    { key: "compare", label: "So sánh sản phẩm", icon: <Scale className="h-3.5 w-3.5" /> },
    { key: "orders", label: "Lịch sử đơn hàng", icon: <ShoppingBag className="h-3.5 w-3.5" /> },
  ];

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
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="relative flex-1 min-h-0">
          <div className="absolute inset-0 overflow-y-auto">
          {loadingTab ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Đang tải...
            </div>
          ) : (
            <>
              {/* Chat Tab */}
              {activeTab === "chat" && (
                <ScrollArea className="h-full max-h-full">
                  <div className="p-4 space-y-4">
                    {messages.length === 0 ? (
                      <EmptyState icon={<MessageSquare />} text="Không có tin nhắn nào trong phiên này." />
                    ) : messages.map((msg) => {
                      const isBot = msg.senderType === "ChatBot";
                      return (
                        <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                          <div className={`flex max-w-[80%] gap-2 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
                            <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs ${isBot ? "bg-primary/10 text-primary" : "bg-muted"}`}>
                              {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                            </div>
                            <div className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}>
                              <div className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                                isBot ? "bg-card border rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"
                              }`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                              </div>
                              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { timeStyle: "short" })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {/* Search Query Logs Tab */}
              {activeTab === "search" && (
                <ScrollArea className="h-full max-h-full">
                  <div className="p-4 space-y-2">
                    {searchLogs.length === 0 ? (
                      <EmptyState icon={<SearchIcon />} text="Khách hàng chưa thực hiện tìm kiếm nào trong phiên này." />
                    ) : searchLogs.map((log, i) => (
                      <div key={log.id || i} className="flex items-center justify-between rounded-lg border p-3 bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <SearchIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{log.query || JSON.stringify(log)}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {log.resultCount !== undefined && (
                            <Badge variant={log.hasResults || log.resultCount > 0 ? "default" : "destructive"} className="text-xs">
                              {log.resultCount} kết quả
                            </Badge>
                          )}
                          {log.createdAt && (
                            <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString("vi-VN", { timeStyle: "short" })}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Product Comparisons Tab */}
              {activeTab === "compare" && (
                <ScrollArea className="h-full max-h-full">
                  <div className="p-4 space-y-3">
                    {comparisons.length === 0 ? (
                      <EmptyState icon={<Scale />} text="Khách hàng chưa so sánh sản phẩm nào trong phiên này." />
                    ) : comparisons.map((comp, i) => (
                      <div key={comp.id || i} className="rounded-lg border p-3 bg-card space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Scale className="h-4 w-4" /> So sánh #{i + 1}
                          {comp.createdAt && <span className="ml-auto text-xs font-normal">{new Date(comp.createdAt).toLocaleTimeString("vi-VN", { timeStyle: "short" })}</span>}
                        </div>
                        {comp.products?.length ? (
                          <div className="flex gap-2 flex-wrap">
                            {comp.products.map((p, pi) => (
                              <Badge key={pi} variant="secondary" className="text-xs">
                                {p.name || p.id}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <pre className="text-xs text-muted-foreground bg-muted rounded p-2 overflow-auto">{JSON.stringify(comp, null, 2)}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Order Events Tab */}
              {activeTab === "orders" && (
                <ScrollArea className="h-full max-h-full">
                  <div className="p-4 space-y-2">
                    {orderEvents.length === 0 ? (
                      <EmptyState icon={<ShoppingBag />} text="Chưa có đơn hàng nào được tạo trong phiên chat này." />
                    ) : orderEvents.map((order, i) => (
                      <div key={order.id || i} className="flex items-center justify-between rounded-lg border p-3 bg-card hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {order.orderCode ? `#${order.orderCode}` : `Đơn hàng #${i + 1}`}
                            </div>
                            {order.createdAt && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {order.totalAmount !== undefined && (
                            <span className="text-sm font-semibold text-emerald-600">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                            </span>
                          )}
                          {order.status && (
                            <Badge variant="outline" className="text-xs">{order.status}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </>
          )}
          </div>
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
