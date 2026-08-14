import { apiClient } from "./client";

export interface FinancialSummaryReportResponse {
  period: {
    start_date?: string | null;
    end_date?: string | null;
  };
  monthly_dues: {
    total_amount: number;
    count: number;
  };
  sadaqah: {
    total_amount: number;
    count: number;
  };
  financial_activities: {
    total_income: number;
    total_disbursed: number;
    net_activity_fund: number;
  };
  qard_e_hasana: {
    total_disbursed: number;
    total_repaid: number;
    total_outstanding: number;
  };
  funds: {
    total_balance: number;
    funds_count: number;
  };
}

export const reportsApi = {
  async getSummary(params?: {
    start_date?: string;
    end_date?: string;
  }, token?: string): Promise<FinancialSummaryReportResponse> {
    return apiClient.get<FinancialSummaryReportResponse>("/api/v1/reports/summary", { params, token });
  },
};
