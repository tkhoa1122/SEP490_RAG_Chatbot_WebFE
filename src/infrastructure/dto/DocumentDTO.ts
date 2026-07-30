/**
 * 📄 Document DTO — Quản lý Tài liệu Knowledge Base
 */

export type DocumentStatus = "Uploaded" | "Processing" | "Embedded" | "Failed" | "Deleted";

export interface DocumentDto {
  id: string;
  businessId?: string;
  title?: string;
  fileName: string;
  fileUrl?: string;
  publicId?: string;
  contentType?: string;
  sizeInBytes?: number;
  type?: string;
  status?: DocumentStatus;
  createdAt?: string;
  createdDate?: string;
  name?: string;
}

export interface DocumentFilter {
  FileName?: string;
  Status?: DocumentStatus;
  PageIndex?: number;
  PageSize?: number;
}
