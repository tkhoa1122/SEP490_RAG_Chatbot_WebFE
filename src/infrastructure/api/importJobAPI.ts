import mainAxiosClient from "./mainAxiosClient";
import type { MainApiWrapper, MainPaginatedList } from "@/infrastructure/dto/MainApiWrapper";
import type { ImportJob, ImportJobFilter } from "@/infrastructure/dto/ImportJobDTO";

/**
 * 📦 Import Job API — Lịch sử Import Excel (UC-011)
 * GET /api/v1/import-jobs — Lấy danh sách lịch sử import
 */

export const importJobAPI = {
  /** GET /api/v1/import-jobs */
  getAll: async (filter?: ImportJobFilter): Promise<MainApiWrapper<MainPaginatedList<ImportJob>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<ImportJob>>>(
      "/import-jobs",
      { params: filter }
    );
    return data;
  }
};
