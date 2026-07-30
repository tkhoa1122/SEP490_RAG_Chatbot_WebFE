/**
 * 📦 Import Job DTO — Dữ liệu lịch sử Import Excel
 */

export type ImportJobStatus =
  | "Pending"
  | "Validating"
  | "ImportingProducts"
  | "Completed"
  | "CompletedWithErrors"
  | "Failed";

export interface ImportErrorDetail {
  rowNumber: number;
  field: string;
  message: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  embeddedRows: number;
  errors: ImportErrorDetail[] | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ImportJobFilter {
  FileName?: string;
  Status?: ImportJobStatus;
  PageIndex?: number;
  PageSize?: number;
}
