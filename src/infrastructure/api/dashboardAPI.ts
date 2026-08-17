import mainAxiosClient from "./mainAxiosClient";
import type { MainApiWrapper } from "@/infrastructure/dto/MainApiWrapper";

// DTOs for Admin Summary
export interface AdminSummaryResponse {
  totalBusiness: number;
  activeBusiness: number;
  totalUsers: number;
  totalProduct: number;
  totalDocument: number;
  totalChatSession: number;
  totalMessage: number;
  totalTokenUsed: number;
  totalRevenue: number;
  activeSubscriptionCount: number;
}

// DTOs for Admin Subscriptions
export interface AdminSubscriptionDetail {
  rate: number;
  businessCount: number;
}
export interface AdminSubscriptionItem {
  id: string;
  name: string;
  status: string;
  detail: AdminSubscriptionDetail;
}
export interface AdminSubscriptionResponse {
  items: AdminSubscriptionItem[];
  totalItems: number;
  pageIndex: number;
  totalPages: number;
  pageSize: number;
}

// DTOs for Admin Revenue
export interface AdminRevenueItem {
  totalRevenue: number;
  totalRevenueThisMonth: number;
  activeSubscriptionCount: number;
  totalSubscriptionCount: number;
  cancelledSubscriptionCount: number;
}
export interface AdminRevenueResponse {
  items: AdminRevenueItem[];
  totalItems: number;
}

// DTOs for Admin AI Usage
export interface AiUsageChartData {
  date: string;
  totalTokenUsed: number;
}
export interface AdminAiUsageResponse {
  totalTokenUsed: number;
  inputTokenUsed: number;
  outputTokenUsed: number;
  totalMessageUsed: number;
  chartData: AiUsageChartData[];
}

// DTOs for Business Analytics (BO)
export interface BusinessChatTraffic {
  date: string;
  sessions: number;
  messages: number;
}
export interface ZeroResultQuery {
  query: string;
  count: number;
  lastOccurredAt: string;
}
export interface IntentStat {
  intent: string;
  count: number;
}
export interface TrendingKeyword {
  keyword: string;
  count: number;
}
export interface BusinessAnalyticsResponse {
  from: string;
  to: string;
  totalProducts: number;
  totalKnowledgeDocuments: number;
  totalChatSessions: number;
  totalChatMessages: number;
  totalOrders: number;
  paidOrders: number;
  conversionRate: number;
  averageRetrievalLatencyMilliseconds: number | null;
  averageSearchHitRatePercentage: number | null;
  chatTraffic: BusinessChatTraffic[];
  zeroResultQueries: ZeroResultQuery[];
  intents: IntentStat[];
  trendingKeywords: TrendingKeyword[];
}

export const dashboardAPI = {
  // --- Admin APIs ---
  getSummary: async (): Promise<MainApiWrapper<AdminSummaryResponse>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<AdminSummaryResponse>>("/dashboards/summary");
    return data;
  },

  getSubscriptions: async (): Promise<MainApiWrapper<AdminSubscriptionResponse>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<AdminSubscriptionResponse>>("/dashboards/subscriptions");
    return data;
  },

  getRevenue: async (): Promise<MainApiWrapper<AdminRevenueResponse>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<AdminRevenueResponse>>("/dashboards/revenue");
    return data;
  },

  getAiUsage: async (): Promise<MainApiWrapper<AdminAiUsageResponse>> => {
    const { data } = await mainAxiosClient.get<MainApiWrapper<AdminAiUsageResponse>>("/dashboards/ai-usage");
    return data;
  },

  // --- BO APIs ---
  getBusinessAnalytics: async (from?: string, to?: string): Promise<MainApiWrapper<BusinessAnalyticsResponse>> => {
    let fromDate = from;
    let toDate = to;
    
    if (!fromDate || !toDate) {
      const today = new Date();
      const lastMonth = new Date();
      lastMonth.setDate(today.getDate() - 30);
      // Backend expects date format: YYYY-MM-DD
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      fromDate = fmt(lastMonth);
      toDate = fmt(today);
    }

    const { data } = await mainAxiosClient.get<MainApiWrapper<BusinessAnalyticsResponse>>("/dashboards/business", {
      params: { From: fromDate, To: toDate }
    });
    return data;
  }
};
