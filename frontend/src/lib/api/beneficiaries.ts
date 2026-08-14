import { apiClient } from "./client";
import { PaginatedResult } from "./types";

export interface BeneficiaryDto {
  id: string;
  name: string;
  mobile?: string | null;
  national_id?: string | null;
  address?: string | null;
  category?: string | null;
  status: string;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export const beneficiariesApi = {
  async list(params?: {
    query?: string;
    category?: string;
    page?: number;
    page_size?: number;
  }, token?: string): Promise<PaginatedResult<BeneficiaryDto>> {
    return apiClient.get<PaginatedResult<BeneficiaryDto>>("/api/v1/beneficiaries", { params, token });
  },

  async get(id: string, token?: string): Promise<BeneficiaryDto> {
    return apiClient.get<BeneficiaryDto>(`/api/v1/beneficiaries/${id}`, { token });
  },

  async create(data: {
    name: string;
    mobile?: string | null;
    national_id?: string | null;
    address?: string | null;
    category?: string | null;
    remarks?: string | null;
  }, token?: string): Promise<BeneficiaryDto> {
    return apiClient.post<BeneficiaryDto>("/api/v1/beneficiaries", data, { token });
  },

  async update(id: string, data: Partial<{
    name: string;
    mobile?: string | null;
    national_id?: string | null;
    address?: string | null;
    category?: string | null;
    remarks?: string | null;
    status?: string;
  }>, token?: string): Promise<BeneficiaryDto> {
    return apiClient.patch<BeneficiaryDto>(`/api/v1/beneficiaries/${id}`, data, { token });
  },
};
