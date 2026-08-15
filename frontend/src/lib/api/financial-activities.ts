import { apiClient } from "./client";
import { PaginatedResult } from "./types";

export interface FinancialActivityDto {
  id: string;
  activity_id: string;
  name: string;
  purpose: string;
  description?: string | null;
  target_amount?: number | null;
  current_balance: number;
  total_income: number;
  total_disbursed: number;
  start_date: string;
  end_date?: string | null;
  status: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialActivityContributionPayload {
  contributor_type: "MEMBER" | "EXTERNAL";
  member_id?: string | null;
  donor_id?: string | null;
  donor_info?: {
    full_name: string;
    mobile: string;
    address?: string | null;
    national_id?: string | null;
    notes?: string | null;
  } | null;
  amount: number;
  date?: string;
  payment_method?: string;
  reference_number?: string | null;
  notes?: string | null;
}

export interface FinancialActivityDisbursementPayload {
  beneficiary_id: string;
  amount: number;
  date?: string;
  payment_method?: string;
  purpose?: string | null;
  reference_number?: string | null;
  notes?: string | null;
}

export const financialActivitiesApi = {
  async list(params?: {
    query?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }, token?: string): Promise<PaginatedResult<FinancialActivityDto>> {
    return apiClient.get<PaginatedResult<FinancialActivityDto>>("/api/v1/financial-activities", { params, token });
  },

  async get(id: string, token?: string): Promise<FinancialActivityDto> {
    return apiClient.get<FinancialActivityDto>(`/api/v1/financial-activities/${id}`, { token });
  },

  async create(data: {
    name: string;
    purpose: string;
    description?: string | null;
    target_amount?: number | null;
    start_date: string;
    end_date?: string | null;
    status?: string;
    remarks?: string | null;
  }, token?: string): Promise<FinancialActivityDto> {
    return apiClient.post<FinancialActivityDto>("/api/v1/financial-activities", data, { token });
  },

  async update(id: string, data: Partial<{
    name: string;
    purpose: string;
    description?: string | null;
    target_amount?: number | null;
    start_date: string;
    end_date?: string | null;
    status?: string;
    remarks?: string | null;
  }>, token?: string): Promise<FinancialActivityDto> {
    return apiClient.patch<FinancialActivityDto>(`/api/v1/financial-activities/${id}`, data, { token });
  },

  async contribute(id: string, data: FinancialActivityContributionPayload, token?: string) {
    return apiClient.post(`/api/v1/financial-activities/${id}/contributions`, data, { token });
  },

  async disburse(id: string, data: FinancialActivityDisbursementPayload, token?: string) {
    return apiClient.post(`/api/v1/financial-activities/${id}/disbursements`, data, { token });
  },
};
