"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Search, LayoutDashboard, Box, Users, MessageSquare, Store, CreditCard, BarChart, Activity, Key, Bot, Settings, History, FileText, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchableScreen {
  label: string;
  keywords: string[]; // Các từ khóa phụ để tìm kiếm
  href: (tenantId: string) => string;
  icon: LucideIcon;
  description: string;
}

const SEARCHABLE_SCREENS: SearchableScreen[] = [
  {
    label: "Tổng quan",
    keywords: ["dashboard", "trang chủ", "overview", "tổng", "quan"],
    href: (t) => `/${t}/business`,
    icon: LayoutDashboard,
    description: "Bảng điều khiển tổng quan doanh nghiệp",
  },
  {
    label: "Nhân sự",
    keywords: ["team", "thành viên", "quản lý nhân sự", "catalog team", "member", "nhân viên"],
    href: (t) => `/${t}/business/team`,
    icon: Users,
    description: "Quản lý thành viên Catalog Team",
  },
  {
    label: "Sản phẩm",
    keywords: ["product", "hàng hóa", "danh mục", "quản lý sản phẩm", "thêm sản phẩm"],
    href: (t) => `/${t}/business/products`,
    icon: Box,
    description: "Quản lý danh mục sản phẩm, thêm sửa xóa",
  },
  {
    label: "Import sản phẩm",
    keywords: ["import", "csv", "excel", "nhập hàng", "upload", "lịch sử import", "import logs"],
    href: (t) => `/${t}/business/products/import-logs`,
    icon: History,
    description: "Lịch sử import sản phẩm từ file CSV/Excel",
  },
  {
    label: "Lịch sử Chat",
    keywords: ["chat", "tin nhắn", "khách hàng", "hội thoại", "chat logs", "lịch sử chat", "conversation"],
    href: (t) => `/${t}/business/chat-logs`,
    icon: MessageSquare,
    description: "Xem lịch sử chat của khách hàng với chatbot",
  },
  {
    label: "Kho tri thức",
    keywords: ["catalog", "knowledge", "tri thức", "tài liệu", "document", "kho"],
    href: (t) => `/${t}/business/catalog`,
    icon: Store,
    description: "Quản lý kho tri thức cho chatbot AI",
  },
  {
    label: "Thanh toán",
    keywords: ["billing", "gói cước", "thanh toán", "payment", "nâng cấp", "subscription", "pricing"],
    href: (t) => `/${t}/business/billing`,
    icon: CreditCard,
    description: "Quản lý gói cước và thông tin thanh toán",
  },
  {
    label: "Lịch sử tiêu hao Token",
    keywords: ["token", "tiêu hao", "usage", "quota", "lịch sử tiêu hao", "usage logs"],
    href: (t) => `/${t}/business/billing`,
    icon: Activity,
    description: "Xem lịch sử tiêu hao Token & Tin nhắn AI",
  },
  {
    label: "Doanh thu",
    keywords: ["analytics", "thống kê", "doanh thu", "revenue", "biểu đồ", "chart"],
    href: (t) => `/${t}/business/analytics`,
    icon: BarChart,
    description: "Thống kê doanh thu và biểu đồ phân tích",
  },
  {
    label: "Hiệu suất AI",
    keywords: ["performance", "hiệu suất", "AI", "tốc độ", "chất lượng"],
    href: (t) => `/${t}/business/performance`,
    icon: Activity,
    description: "Theo dõi hiệu suất hoạt động của chatbot AI",
  },
  {
    label: "API Keys",
    keywords: ["api", "key", "api key", "integration", "tích hợp", "khóa"],
    href: (t) => `/${t}/business/api-keys`,
    icon: Key,
    description: "Quản lý API Key cho tích hợp bên ngoài",
  },
  {
    label: "Cấu hình AI",
    keywords: ["chatbot", "config", "cấu hình", "AI", "bot", "thiết lập bot"],
    href: (t) => `/${t}/business/chatbot-config`,
    icon: Bot,
    description: "Cấu hình chatbot AI cho cửa hàng",
  },
  {
    label: "Cài đặt",
    keywords: ["settings", "cài đặt", "tùy chỉnh", "profile", "hồ sơ", "thông tin doanh nghiệp"],
    href: (t) => `/${t}/business/settings`,
    icon: Settings,
    description: "Cài đặt thông tin doanh nghiệp",
  },
];

// Hàm loại bỏ dấu tiếng Việt để so sánh
function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchSearch(query: string, screen: SearchableScreen): boolean {
  const q = removeDiacritics(query);
  // Kiểm tra label
  if (removeDiacritics(screen.label).includes(q)) return true;
  // Kiểm tra description
  if (removeDiacritics(screen.description).includes(q)) return true;
  // Kiểm tra keywords
  return screen.keywords.some(kw => removeDiacritics(kw).includes(q));
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const tenantId = (params?.tenant_id as string) || "";

  const results = query.trim()
    ? SEARCHABLE_SCREENS.filter(s => matchSearch(query, s))
    : [];

  // Reset selected index khi results thay đổi
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ctrl+K để focus vào search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (screen: SearchableScreen) => {
    router.push(screen.href(tenantId));
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <div className="relative hidden sm:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Tìm kiếm sản phẩm, đơn hàng..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => { if (query.trim()) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-9 w-70 rounded-lg border border-border bg-muted/40 pl-9 pr-12 text-sm text-foreground",
          "outline-none transition-all placeholder:text-muted-foreground/60",
          "focus:w-90 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
        )}
      />
      {/* Ctrl+K hint */}
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground/70">
        Ctrl K
      </kbd>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-[420px] rounded-xl border border-border bg-background shadow-xl z-50 overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Trang & Chức năng ({results.length})
            </p>
          </div>
          <div className="max-h-[320px] overflow-y-auto py-1">
            {results.map((screen, index) => {
              const Icon = screen.icon;
              return (
                <button
                  key={screen.label + screen.href(tenantId)}
                  onClick={() => handleSelect(screen)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    index === selectedIndex ? "bg-primary/10 text-primary" : "hover:bg-muted/60"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    index === selectedIndex ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{screen.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{screen.description}</p>
                  </div>
                  {index === selectedIndex && (
                    <kbd className="shrink-0 text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 bg-muted">
                      Enter ↵
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hiện gợi ý khi focus nhưng chưa gõ gì */}
      {isOpen && query.trim() === "" && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-[420px] rounded-xl border border-border bg-background shadow-xl z-50 overflow-hidden"
        >
          <div className="px-4 py-6 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Gõ để tìm kiếm trang và chức năng</p>
            <p className="text-[11px] mt-1">Ví dụ: "sản phẩm", "import", "chat", "thanh toán"</p>
          </div>
        </div>
      )}
    </div>
  );
}
