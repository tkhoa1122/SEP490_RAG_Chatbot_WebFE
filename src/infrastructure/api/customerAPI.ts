import mainAxiosClient from "./mainAxiosClient";
import type { MainApiWrapper, MainPaginatedList } from "@/infrastructure/dto/MainApiWrapper";
import type {
  Customer, CustomerFilter, Conversation, Message, SenderTypeEnum,
  CursorPagedList, OrderEvent, ProductComparison, SearchQueryLog
} from "@/infrastructure/dto/CustomerDTO";

/**
 * 👥 Customer API — Quản lý lịch sử chat của khách hàng (UC-009)
 */
export const customerAPI = {
  /** GET /api/v1/customers — Lấy danh sách khách hàng */
  getAll: async (filter?: CustomerFilter): Promise<MainApiWrapper<MainPaginatedList<Customer>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<Customer>>>(
      "/customers",
      { params: filter }
    );
    return data;
  },

  /** GET /api/v1/customers/{customerExternalId}/conversations — Lấy các phiên chat của 1 KH */
  getConversations: async (
    customerExternalId: string, 
    pageIndex = 1, 
    pageSize = 20
  ): Promise<MainApiWrapper<MainPaginatedList<Conversation>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<Conversation>>>(
      `/customers/${customerExternalId}/conversations`,
      { params: { pageIndex, pageSize } }
    );
    return data;
  },

  /** GET /api/v1/customers/{customerExternalId}/conversations/{conversationId}/messages — Lấy tin nhắn */
  getMessages: async (
    customerExternalId: string,
    conversationId: string,
    params?: {
      LastCursor?: string;
      Limit?: number;
      Search?: string;
      SenderType?: SenderTypeEnum;
    }
  ): Promise<MainApiWrapper<MainPaginatedList<Message>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<MainPaginatedList<Message>>>(
      `/customers/${customerExternalId}/conversations/${conversationId}/messages`,
      { params }
    );
    return data;
  },

  /** GET .../order-events — Lấy các sự kiện đặt hàng trong cuộc hội thoại */
  getOrderEvents: async (
    customerExternalId: string,
    conversationId: string,
    params?: { LastCursor?: string; Limit?: number }
  ): Promise<MainApiWrapper<CursorPagedList<OrderEvent>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<CursorPagedList<OrderEvent>>>(
      `/customers/${customerExternalId}/conversations/${conversationId}/order-events`,
      { params }
    );
    return data;
  },

  /** GET .../product-comparisons — Lấy các sự kiện so sánh sản phẩm */
  getProductComparisons: async (
    customerExternalId: string,
    conversationId: string,
    params?: { LastCursor?: string; Limit?: number }
  ): Promise<MainApiWrapper<CursorPagedList<ProductComparison>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<CursorPagedList<ProductComparison>>>(
      `/customers/${customerExternalId}/conversations/${conversationId}/product-comparisons`,
      { params }
    );
    return data;
  },

  /** GET .../search-query-logs — Lấy lịch sử tìm kiếm sản phẩm */
  getSearchQueryLogs: async (
    customerExternalId: string,
    conversationId: string,
    params?: { LastCursor?: string; Limit?: number }
  ): Promise<MainApiWrapper<CursorPagedList<SearchQueryLog>>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<CursorPagedList<SearchQueryLog>>>(
      `/customers/${customerExternalId}/conversations/${conversationId}/search-query-logs`,
      { params }
    );
    return data;
  }
};
