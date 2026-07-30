"use client";

import { useState, useEffect, use } from "react";
import { 
  MessageSquare, User as UserIcon, Calendar, ArrowRight, Search, Loader2, Bot, User, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { customerAPI } from "@/infrastructure/api/customerAPI";
import type { Customer, Conversation, Message } from "@/infrastructure/dto/CustomerDTO";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

export function ChatLogsClient({ tenantIdPromise }: { tenantIdPromise: Promise<string> }) {
  const tenantId = use(tenantIdPromise);
  
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Loading states
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch Customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await customerAPI.getAll({ PageSize: 50 });
        setCustomers(res.data?.items || []);
      } catch (err) {
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
      setSelectedConversation(null);
      return;
    }
    
    // Reset synchronously to prevent race condition with messages effect
    setSelectedConversation(null);
    setMessages([]);

    const fetchConvos = async () => {
      setLoadingConvos(true);
      try {
        const res = await customerAPI.getConversations(selectedCustomer.customerExternalId);
        setConversations(res.data?.items || []);
      } catch (err) {
        toast.error("Không thể tải lịch sử phiên chat");
      } finally {
        setLoadingConvos(false);
      }
    };
    fetchConvos();
  }, [selectedCustomer]);

  // Fetch Messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation || !selectedCustomer) {
      setMessages([]);
      return;
    }

    const controller = new AbortController();
    let isCancelled = false;

    const fetchMsgs = async () => {
      setLoadingMessages(true);
      try {
        const res = await customerAPI.getMessages(
          selectedCustomer.customerExternalId, 
          selectedConversation.id, 
          { Limit: 100 }
        );
        // Only update state if this effect hasn't been cleaned up
        if (!isCancelled) {
          const msgs = res.data?.items || [];
          setMessages([...msgs].reverse());
        }
      } catch (err: any) {
        if (isCancelled) return; // Ignore errors from cancelled requests
        if (err.response?.status === 404) {
          toast.error("Không tìm thấy tin nhắn (404). Backend chưa deploy API này.");
        } else {
          toast.error("Không thể tải tin nhắn");
        }
      } finally {
        if (!isCancelled) setLoadingMessages(false);
      }
    };

    fetchMsgs();

    // Cleanup: mark as cancelled when customer/conversation changes
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [selectedConversation?.id, selectedCustomer?.id]);

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] min-h-[600px] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lịch sử Chat Khách hàng</h1>
        <p className="mt-1 text-muted-foreground">
          Quản lý và xem lại toàn bộ lịch sử tư vấn của Chatbot đối với từng khách hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Column 1: Customers */}
        <Card className="md:col-span-1 lg:col-span-3 flex flex-col h-full border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20 px-4 py-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserIcon className="h-4 w-4" /> Khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm mã KH..." className="pl-8 h-9 text-sm bg-background" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingCustomers ? (
                <div className="p-4 text-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" /> Đang tải...</div>
              ) : customers.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Chưa có khách hàng nào.</div>
              ) : (
                <div className="divide-y">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between group ${
                        selectedCustomer?.id === c.id ? "bg-primary/5 border-l-2 border-primary" : "border-l-2 border-transparent"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium text-sm text-foreground truncate" title={c.customerExternalId}>
                          {c.customerExternalId}
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
        <Card className="md:col-span-1 lg:col-span-4 flex flex-col h-full border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20 px-4 py-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> 
              Phiên chat {selectedCustomer ? `của ${selectedCustomer.customerExternalId.substring(0, 8)}...` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
            {!selectedCustomer ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-6 text-center">
                Vui lòng chọn một Khách hàng ở danh sách bên trái.
              </div>
            ) : loadingConvos ? (
               <div className="p-6 text-center text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" /> Đang tải phiên chat...</div>
            ) : conversations.length === 0 ? (
               <div className="p-6 text-center text-sm text-muted-foreground">Khách hàng này chưa có phiên chat nào.</div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                <div className="divide-y space-y-3">
                  {conversations.map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`cursor-pointer rounded-lg border p-3 transition-all hover:shadow-sm ${
                          isSelected ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20" : "bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <Badge variant="outline" className="font-mono text-xs bg-background">
                            #{conv.id.substring(0, 6).toUpperCase()}
                          </Badge>
                        </div>
                        {conv.title && <div className="text-sm font-medium mb-1 line-clamp-1">{conv.title}</div>}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(conv.startedAt || (conv as any).createdAt).toLocaleDateString("vi-VN")}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(conv.startedAt || (conv as any).createdAt).toLocaleTimeString("vi-VN", {timeStyle: "short"})}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 3: Chat Viewer */}
        <Card className="md:col-span-1 lg:col-span-5 flex flex-col h-full border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b bg-muted/20 px-4 py-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Nội dung trò chuyện
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-slate-50/50">
            {!selectedConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-sm text-muted-foreground p-6 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-3" />
                Chọn một phiên chat ở cột giữa để xem chi tiết tin nhắn.
              </div>
            ) : loadingMessages ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" /> Đang tải nội dung...</div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Không có tin nhắn nào trong phiên này.</div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isBot = msg.senderType === "ChatBot";
                    return (
                      <div key={msg.id} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                        <div className={`flex max-w-[85%] gap-2 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isBot ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {isBot ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                          </div>
                          <div className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}>
                            <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                              isBot ? "bg-card border text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"
                            }`}>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                  a: ({ node, ...props }) => <a className="text-primary hover:underline break-words font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                  img: ({ node, ...props }) => (
                                    <span className="block mt-2 mb-2">
                                      <img className="rounded-md max-w-full h-auto max-h-[300px] object-contain border bg-muted/20" alt={props.alt || "Image"} {...props} />
                                    </span>
                                  ),
                                  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                  li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
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
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
