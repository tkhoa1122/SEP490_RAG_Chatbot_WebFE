import mainAxiosClient from "./mainAxiosClient";
import type { MainApiWrapper, MainPaginatedList } from "@/infrastructure/dto/MainApiWrapper";
import type { DocumentDto, DocumentFilter } from "@/infrastructure/dto/DocumentDTO";

export type { DocumentDto, DocumentFilter, DocumentStatus } from "@/infrastructure/dto/DocumentDTO";

/**
 * 📄 Document API — Quản lý tải lên tài liệu cho RAG
 * 
 * POST   /api/v1/documents/upload — Tải lên nhiều tài liệu (multipart/form-data)
 * GET    /api/v1/documents        — Lấy danh sách tài liệu
 * DELETE /api/v1/documents/{id}   — Xóa tài liệu
 */
export const documentAPI = {
  /** 
   * Tải lên một hoặc nhiều tài liệu.
   * Yêu cầu gửi dưới dạng multipart/form-data với trường "Files"
   */
  upload: async (files: File[]): Promise<MainApiWrapper<any>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("Files", file);
    });

    const { data } = await mainAxiosClient.post<MainApiWrapper<any>>(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    return data;
  },

  /** Lấy danh sách tài liệu */
  getAll: async (filter?: DocumentFilter): Promise<MainApiWrapper<MainPaginatedList<DocumentDto>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<DocumentDto>>>(
      "/documents",
      { params: filter }
    );
    return data;
  },

  /** Xóa tài liệu */
  delete: async (id: string): Promise<MainApiWrapper<any>> => {
    const { data } = await mainAxiosClient.delete<MainApiWrapper<any>>(
      `/documents/${id}`
    );
    return data;
  }
};
