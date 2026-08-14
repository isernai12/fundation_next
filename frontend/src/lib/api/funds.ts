import { apiClient } from "./client";
import { PaginatedResult } from "./types";

export interface FundDto {
  id: string;
  group_id?: string | null;
  group_name?: string | null;
  name: string;
  description?: string | null;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export interface FundListResponse extends PaginatedResult<FundDto> {}

export interface FundCreatePayload {
  name: string;
  description?: string | null;
  group_id?: string | null;
}

export interface FundUpdatePayload {
  name?: string;
  description?: string | null;
}

export const fundsApi = {
  async list(params?: {
    query?: string;
    group_id?: string;
    page?: number;
    page_size?: number;
  }, token?: string): Promise<FundListResponse> {
    return apiClient.get<FundListResponse>("/api/v1/funds", { params, token });
  },

  async get(id: string, token?: string): Promise<FundDto> {
    return apiClient.get<FundDto>(`/api/v1/funds/${id}`, { token });
  },

  async create(data: FundCreatePayload, token?: string): Promise<FundDto> {
    return apiClient.post<FundDto>("/api/v1/funds", data, { token });
  },

  async update(id: string, data: FundUpdatePayload, token?: string): Promise<FundDto> {
    return apiClient.patch<FundDto>(`/api/v1/funds/${id}`, data, { token });
  },
};
