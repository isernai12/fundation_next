import { apiClient } from "./client";
import { PaginatedResult } from "./types";

export interface DueCalculationResponse {
  member_id: string;
  member_name: string;
  from_month: number;
  from_year: number;
  to_month: number;
  to_year: number;
  total_months: number;
  current_monthly_fee: number;
  total_amount: number;
  months_breakdown: Array<{
    month: number;
    year: number;
    amount: number;
    is_already_paid: boolean;
  }>;
}

export interface DuePaymentPayload {
  member_id: string;
  from_month: number;
  from_year: number;
  to_month: number;
  to_year: number;
  amount: number;
  payment_method?: string;
  date?: string;
  reference_number?: string | null;
  notes?: string | null;
}

export interface DuePaymentResponse {
  message: string;
  member_id: string;
  paid_months_count: number;
  total_amount: number;
  paid_until_month: number;
  paid_until_year: number;
  transaction_id: string;
}

export interface MemberDuesSummaryResponse {
  member_id: string;
  full_name: string;
  group_id: string;
  group_name: string;
  current_monthly_fee: number;
  paid_until_month: number;
  paid_until_year: number;
  total_paid_amount: number;
  total_paid_months: number;
}

export const duesApi = {
  async getFeeSetting(token?: string): Promise<{ monthly_fee: number; currency: string }> {
    return apiClient.get<{ monthly_fee: number; currency: string }>("/api/v1/dues/settings/fee", { token });
  },

  async calculate(params: {
    member_id: string;
    from_month: number;
    from_year: number;
    to_month: number;
    to_year: number;
  }, token?: string): Promise<DueCalculationResponse> {
    return apiClient.get<DueCalculationResponse>("/api/v1/dues/calculate", { params, token });
  },

  async pay(data: DuePaymentPayload, token?: string): Promise<DuePaymentResponse> {
    return apiClient.post<DuePaymentResponse>("/api/v1/dues/pay", data, { token });
  },

  async getSummary(memberId: string, token?: string): Promise<MemberDuesSummaryResponse> {
    return apiClient.get<MemberDuesSummaryResponse>("/api/v1/dues/summary", { params: { member_id: memberId }, token });
  },
};
