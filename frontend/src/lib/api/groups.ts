import { apiClient } from "./client";
import { PaginatedResult } from "./types";

export interface GroupDto {
  id: string;
  foundation_id: string;
  name: string;
  code: string;
  short_name?: string | null;
  description?: string | null;
  remarks?: string | null;
  status: string;
  is_foundation_group: boolean;
  member_signup_enabled: boolean;
  member_count: number;
  current_balance: number;
  created_at: string;
  updated_at: string;
}

export type GroupListResponse = PaginatedResult<GroupDto>;

export interface GroupCreatePayload {
  name: string;
  code: string;
  short_name?: string | null;
  description?: string | null;
  remarks?: string | null;
  status?: string;
  is_foundation_group?: boolean;
  member_signup_enabled?: boolean;
}

export type GroupUpdatePayload = Partial<GroupCreatePayload>;

export const groupsApi = {
  async list(params?: {
    query?: string;
    status?: string;
    member_signup_enabled?: boolean;
    page?: number;
    page_size?: number;
  }, token?: string): Promise<GroupListResponse> {
    return apiClient.get<GroupListResponse>("/api/v1/groups", { params, token });
  },

  async get(id: string, token?: string): Promise<GroupDto> {
    return apiClient.get<GroupDto>(`/api/v1/groups/${id}`, { token });
  },

  async create(data: GroupCreatePayload, token?: string): Promise<GroupDto> {
    return apiClient.post<GroupDto>("/api/v1/groups", data, { token });
  },

  async update(id: string, data: GroupUpdatePayload, token?: string): Promise<GroupDto> {
    return apiClient.patch<GroupDto>(`/api/v1/groups/${id}`, data, { token });
  },

  async delete(id: string, token?: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/v1/groups/${id}`, { token });
  },
};
