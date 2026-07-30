/**
 * 📊 Usage Log DTO — Dữ liệu lịch sử tiêu hao Token/Message
 */

export type UsageLogSourceType = "Chat" | "EmbeddingProduct" | "EmbeddingDocument";

export interface UsageLog {
  id: string;
  sourceType: UsageLogSourceType;
  usedTokens: number;
  usedMessages: number;
  description: string;
  createdAt: string;
}

export interface UsageLogFilter {
  SourceType?: UsageLogSourceType;
  OrderBy?: string;
  PageIndex?: number;
  PageSize?: number;
}
