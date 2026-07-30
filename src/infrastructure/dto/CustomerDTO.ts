/**
 * 👤 Customer DTO — Dữ liệu Khách hàng và Lịch sử Chat (UC-009)
 */

export type CustomerStatus = "Active" | "Inactive" | "Deleted" | "Banned";
export type SenderTypeEnum = "None" | "Customer" | "ChatBot";

export interface Customer {
  id: string;
  customerExternalId: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerFilter {
  CustomerExternalId?: string;
  Status?: CustomerStatus;
  OrderBy?: string;
  PageIndex?: number;
  PageSize?: number;
}

export interface Conversation {
  id: string;
  title?: string;
  customerExternalId: string;
  startedAt: string;
  endedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderTypeEnum;
  content: string;
  createdAt: string;
  isHelpful?: boolean | null;
}
