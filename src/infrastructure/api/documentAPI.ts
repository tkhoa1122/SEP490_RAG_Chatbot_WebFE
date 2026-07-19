import mainAxiosClient from "./mainAxiosClient";
import type { MainApiWrapper } from "@/infrastructure/dto/MainApiWrapper";

/**
 * 📄 Document API — Quản lý tải lên tài liệu cho RAG
 * 
 * POST /api/v1/documents/upload — Tải lên nhiều tài liệu (multipart/form-data)
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
};
