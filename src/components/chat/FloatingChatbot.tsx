"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Paperclip, Bot, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Mock Data & Markdown Renderers ---

const BOT_TYPING_DELAY = 1000; // ms

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  isTyping?: boolean;
  productCarousel?: { id: string; name: string; price: string; image: string }[];
  markdownTable?: boolean;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender: "bot",
    text: "Chào bạn! Mình là AI Assistant của **Eco Fashion**. Bạn cần tìm trang phục gì hôm nay?",
  },
];

const PRODUCT_MOCK = [
  { id: "p1", name: "Áo thun oversize trắng basic", price: "250.000đ", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80" },
  { id: "p2", name: "Áo polo nam đi biển", price: "320.000đ", image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=400&q=80" },
];

function MarkdownText({ text }: { text: string }) {
  // Simple markdown bold parser for demo
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

function ProductCarousel({ products }: { products: NonNullable<Message["productCarousel"]> }) {
  return (
    <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {products.map((p) => (
        <div key={p.id} className="w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={p.name} className="h-32 w-full object-cover" />
          <div className="p-3">
            <h4 className="line-clamp-2 text-xs font-medium leading-tight">{p.name}</h4>
            <p className="mt-1 text-sm font-bold text-[#A8E6CF]">{p.price}</p>
            <button className="mt-2 w-full rounded-md bg-[#A8E6CF]/20 py-1.5 text-xs font-semibold text-[#5a9c82] transition-colors hover:bg-[#A8E6CF]/30">
              Xem chi tiết
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SizeChartTable() {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted">
          <tr>
            <th className="px-3 py-2 font-medium">Size</th>
            <th className="px-3 py-2 font-medium">Chiều cao</th>
            <th className="px-3 py-2 font-medium">Cân nặng</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <tr>
            <td className="px-3 py-2 font-semibold">M</td>
            <td className="px-3 py-2">1m60 - 1m68</td>
            <td className="px-3 py-2">55 - 65kg</td>
          </tr>
          <tr className="bg-[#A8E6CF]/10">
            <td className="px-3 py-2 font-bold text-[#5a9c82]">L</td>
            <td className="px-3 py-2 font-medium">1m68 - 1m75</td>
            <td className="px-3 py-2 font-medium text-[#5a9c82]">65 - 75kg</td>
          </tr>
          <tr>
            <td className="px-3 py-2 font-semibold">XL</td>
            <td className="px-3 py-2">1m75 - 1m80</td>
            <td className="px-3 py-2">75 - 85kg</td>
          </tr>
        </tbody>
      </table>
      <div className="bg-muted/50 p-2 text-center text-[10px] text-muted-foreground">
        ✨ Gợi ý: Size **L** phù hợp nhất với bạn.
      </div>
    </div>
  );
}

// --- Main Chatbot Component ---

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // --- Mock Bot Response Logic based on RAG scenario ---
    setTimeout(() => {
      // 1. Show typing indicator
      const typingId = "typing-" + Date.now();
      setMessages((prev) => [...prev, { id: typingId, sender: "bot", text: "", isTyping: true }]);

      setTimeout(() => {
        // Remove typing indicator
        setMessages((prev) => prev.filter((m) => m.id !== typingId));

        let botMsg: Message;

        if (userMsg.text.toLowerCase().includes("áo thun") || userMsg.text.toLowerCase().includes("trắng")) {
          botMsg = {
            id: Date.now().toString(),
            sender: "bot",
            text: "Đây là một số mẫu **áo thun oversize trắng** phù hợp để đi biển đang bán chạy nhất tại Eco Fashion nhé:",
            productCarousel: PRODUCT_MOCK,
          };
        } else if (userMsg.text.toLowerCase().includes("nặng") || userMsg.text.toLowerCase().includes("size")) {
          botMsg = {
            id: Date.now().toString(),
            sender: "bot",
            text: "Dựa vào số đo của bạn (1m75, 70kg), mình gợi ý bạn nên chọn **Size L** để mặc thoải mái nhé. Dưới đây là bảng size chi tiết:",
            markdownTable: true,
          };
        } else {
          botMsg = {
            id: Date.now().toString(),
            sender: "bot",
            text: "Cảm ơn bạn đã quan tâm! Bạn có cần tư vấn thêm về sản phẩm nào không?",
          };
        }

        setMessages((prev) => [...prev, botMsg]);
      }, BOT_TYPING_DELAY * 1.5); // Typewriter effect delay

    }, 300); // Small initial delay
  };

  return (
    <>
      {/* --- Floating Button --- */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#A8E6CF] to-[#8fd4ba] text-[#2c5243] shadow-xl ring-4 ring-[#A8E6CF]/30 transition-shadow hover:shadow-2xl hover:ring-[#A8E6CF]/50"
          >
            {/* Pulse effect */}
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#A8E6CF]/40" />
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* --- Chat Window --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[calc(100vh-48px)] w-[380px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-[#A8E6CF] to-[#C1E1C1] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                  <Bot className="h-5 w-5 text-[#4a8a70]" />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1c362b]">Eco Fashion AI</h3>
                  <p className="text-[11px] font-medium text-[#2c5243]/80">Online • Phản hồi ngay</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-[#1c362b] transition-colors hover:bg-black/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex max-w-[85%] flex-col gap-1",
                      msg.sender === "user" ? "self-end" : "self-start"
                    )}
                  >
                    <div className={cn("flex items-end gap-2", msg.sender === "user" ? "flex-row-reverse" : "flex-row")}>
                      {/* Avatar */}
                      <div className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
                        msg.sender === "user" ? "bg-slate-300" : "bg-[#A8E6CF]"
                      )}>
                        {msg.sender === "user" ? <User className="h-4 w-4 text-slate-600" /> : <Bot className="h-4 w-4 text-[#2c5243]" />}
                      </div>

                      {/* Bubble */}
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm",
                        msg.sender === "user"
                          ? "rounded-br-sm bg-slate-900 text-white"
                          : "rounded-bl-sm border border-border bg-white text-slate-700 shadow-sm"
                      )}>
                        {msg.isTyping ? (
                          <div className="flex items-center gap-1 h-5">
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          </div>
                        ) : (
                          <MarkdownText text={msg.text} />
                        )}
                      </div>
                    </div>

                    {/* Rich Content Renderers */}
                    {msg.productCarousel && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-9">
                        <ProductCarousel products={msg.productCarousel} />
                      </motion.div>
                    )}
                    {msg.markdownTable && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-9">
                        <SizeChartTable />
                      </motion.div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-border bg-background p-3">
              <div className="flex items-end gap-2 rounded-xl border border-border bg-muted/30 p-1 focus-within:border-[#A8E6CF] focus-within:ring-1 focus-within:ring-[#A8E6CF]">
                <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Paperclip className="h-4 w-4" />
                </button>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Hỏi AI về sản phẩm, size..."
                  className="max-h-[120px] min-h-[36px] w-full resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
                    inputValue.trim()
                      ? "bg-[#A8E6CF] text-[#2c5243] hover:bg-[#97d0ba]"
                      : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                  )}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </div>
              <div className="mt-2 text-center text-[10px] text-muted-foreground">
                Powered by Smart Shopping AI ✨
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
