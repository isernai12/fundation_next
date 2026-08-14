import { apiClient } from "./client";
import { PaginatedResult } from "./types";

export interface LoanDto {
  id: string;
  loan_id: string;
  beneficiary_id: string;
  beneficiary_name?: string | null;
  amount: number;
  remaining_balance: number;
  total_repaid: number;
  purpose: string;
  disbursement_date: string;
  repayment_deadline?: string | null;
  duration_months?: number | null;
  installment_type?: string | null;
  installment_amount?: number | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanCreatePayload {
  beneficiary_id: string;
  amount: number;
  purpose: string;
  disbursement_date?: string;
  repayment_deadline?: string | null;
  duration_months?: number | null;
  installment_type?: string | null;
  installment_amount?: number | null;
  payment_method?: string;
  notes?: string | null;
}

export interface LoanRepaymentPayload {
  amount: number;
  repayment_date?: string;
  payment_method?: string;
  reference_number?: string | null;
  notes?: string | null;
}

export const loansApi = {
  async list(params?: {
    beneficiary_id?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }, token?: string): Promise<PaginatedResult<LoanDto>> {
    return apiClient.get<PaginatedResult<LoanDto>>("/api/v1/loans", { params, token });
  },

  async get(id: string, token?: string): Promise<LoanDto> {
    return apiClient.get<LoanDto>(`/api/v1/loans/${id}`, { token });
  },

  async create(data: LoanCreatePayload, token?: string): Promise<LoanDto> {
    return apiClient.post<LoanDto>("/api/v1/loans", data, { token });
  },

  async repay(id: string, data: LoanRepaymentPayload, token?: string) {
    return apiClient.post(`/api/v1/loans/${id}/repay`, data, { token });
  },

  async getRepayments(id: string, token?: string) {
    return apiClient.get(`/api/v1/loans/${id}/repayments`, { token });
  },
};
