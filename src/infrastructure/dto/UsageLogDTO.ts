/**
 * 📊 Usage Log DTO — Dữ liệu lịch sử tiêu hao Token/Message
 */

export type UsageLogSourceType = "Chat" | "EmbeddingProduct" | "EmbeddingDocument";

export interface UsageLog {
  id: string;
  businessQuotaId: string;
  sourceId: string;
  sourceType: UsageLogSourceType;
  inputTokens: number;
  outputTokens: number;
  billableTokens: number;
  messageUsed: number;
  createdAt: string;
}

export interface UsageLogFilter {
  SourceType?: UsageLogSourceType;
  OrderBy?: string;
  PageIndex?: number;
  PageSize?: number;
}
