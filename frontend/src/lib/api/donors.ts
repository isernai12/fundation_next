import { apiClient } from "./client";

export interface DonorItem {
  id: string;
  donorId: string;
  fullName: string;
  mobile: string;
  address?: string | null;
  nationalId?: string | null;
  notes?: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  documents?: any[];
}

export const donorsApi = {
  async list(token?: string): Promise<DonorItem[]> {
    return apiClient.get<DonorItem[]>("/api/v1/donors", { token });
  },

  async get(id: string, token?: string): Promise<DonorItem> {
    return apiClient.get<DonorItem>(`/api/v1/donors/${id}`, { token });
  },

  async create(data: Partial<DonorItem>, token?: string): Promise<DonorItem> {
    return apiClient.post<DonorItem>("/api/v1/donors", data, { token });
  },

  async update(id: string, data: Partial<DonorItem>, token?: string): Promise<DonorItem> {
    return apiClient.patch<DonorItem>(`/api/v1/donors/${id}`, data, { token });
  },

  async delete(id: string, token?: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`/api/v1/donors/${id}`, { token });
  },

  async getLedger(id: string, token?: string): Promise<any[]> {
    return apiClient.get<any[]>(`/api/v1/donors/${id}/ledger`, { token });
  },
};
