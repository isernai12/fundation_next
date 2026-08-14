import { apiClient } from "./client";
import { PaginatedResult } from "./types";

export interface DonorInfoDto {
  full_name: string;
  mobile: string;
  address?: string | null;
  national_id?: string | null;
  notes?: string | null;
}

export interface SadaqahReceivePayload {
  contributor_type: "MEMBER" | "EXTERNAL";
  member_id?: string | null;
  donor_id?: string | null;
  donor_info?: DonorInfoDto | null;
  fund_id: string;
  amount: number;
  payment_method?: string;
  date?: string;
  reference_number?: string | null;
  purpose?: string | null;
  notes?: string | null;
}

export interface SadaqahDto {
  id: string;
  transaction_id: string;
  fund_id: string;
  fund_name: string;
  contributor_type: string;
  contributor_name: string;
  member_id?: string | null;
  donor_id?: string | null;
  amount: number;
  date: string;
  payment_method: string;
  reference_number?: string | null;
  notes?: string | null;
  created_at: string;
}

export type SadaqahListResponse = PaginatedResult<SadaqahDto>;

export const sadaqahApi = {
  async receive(data: SadaqahReceivePayload, token?: string): Promise<SadaqahDto> {
    return apiClient.post<SadaqahDto>("/api/v1/sadaqah", data, { token });
  },

  async list(params?: {
    fund_id?: string;
    member_id?: string;
    donor_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }, token?: string): Promise<SadaqahListResponse> {
    return apiClient.get<SadaqahListResponse>("/api/v1/sadaqah", { params, token });
  },

  async get(id: string, token?: string): Promise<SadaqahDto> {
    return apiClient.get<SadaqahDto>(`/api/v1/sadaqah/${id}`, { token });
  },
};
