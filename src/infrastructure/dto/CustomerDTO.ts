/**
 * 👤 Customer DTO — Dữ liệu Khách hàng và Lịch sử Chat (UC-009)
 */

export type CustomerStatus = "Active" | "Inactive" | "Deleted" | "Banned";
export type SenderTypeEnum = "None" | "Customer" | "ChatBot";

export interface Customer {
  id: string;
  customerExternalId: string;
  name?: string | null;
  status: CustomerStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CustomerFilter {
  CustomerExternalId?: string;
  Status?: CustomerStatus;
  OrderBy?: string;
  PageIndex?: number;
  PageSize?: number;
}

/** Conversation - note: API returns "createAt" not "createdAt" */
export interface Conversation {
  id: string;
  title?: string;
  status: string;
  lastMessageAt?: string;
  createAt: string;    // ← đúng theo API response
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderTypeEnum;
  content: string;
  createdAt: string;
  isHelpful?: boolean | null;
}

/** Cursor-based pagination response (dùng cho 3 API Customer Insights) */
export interface CursorPagedList<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

/** Order Event — Sự kiện đặt hàng trong cuộc hội thoại */
export interface OrderEvent {
  id?: string;
  orderId?: string;
  orderCode?: string;
  status?: string;
  totalAmount?: number;
  createdAt?: string;
  [key: string]: any; // flexible vì BE chưa document schema
}

/** Product Comparison — Sự kiện so sánh sản phẩm */
export interface ComparedProduct {
  productId?: string;
  productName?: string;
  price?: number;
  category?: string;
}

export interface ProductComparison {
  id?: string;
  messageId?: string;
  title?: string;
  summary?: string;
  products?: ComparedProduct[];
  createdAt?: string;
  [key: string]: any;
}

/** Search Query Log — Lịch sử tìm kiếm sản phẩm */
export interface SearchQueryLog {
  id?: string;
  messageId?: string;
  userRawQuery?: string;
  trendKeywords?: string[];
  interactionType?: string;
  zeroResult?: boolean;
  resultCount?: number;
  topKResult?: number;
  hitRateScore?: number;
  retrievalLatencyMilliseconds?: number;
  products?: Array<{
    productId?: string;
    productName?: string;
    price?: number;
    category?: string;
    productScore?: number;
  }>;
  createdAt?: string;
  [key: string]: any;
}
