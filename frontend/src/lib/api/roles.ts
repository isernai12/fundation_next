import { apiClient } from "./client";

export interface RoleItem {
  id: string;
  name: string;
  description?: string | null;
  is_system?: boolean;
  user_count?: number;
  permissions_count?: number;
  permissions?: string[];
}

export interface PermissionItem {
  id: string;
  module: string;
  action: string;
  name_en?: string;
  name_bn?: string;
  description?: string;
}

export const rolesApi = {
  async list(token?: string): Promise<{ items: RoleItem[]; total: number }> {
    return apiClient.get<{ items: RoleItem[]; total: number }>("/api/v1/roles", { token });
  },

  async get(roleId: string, token?: string): Promise<RoleItem> {
    return apiClient.get<RoleItem>(`/api/v1/roles/${roleId}`, { token });
  },

  async create(data: { name: string; description?: string; permission_codes: string[] }, token?: string): Promise<RoleItem> {
    return apiClient.post<RoleItem>("/api/v1/roles", data, { token });
  },

  async update(roleId: string, data: { name?: string; description?: string; permission_codes?: string[] }, token?: string): Promise<RoleItem> {
    return apiClient.patch<RoleItem>(`/api/v1/roles/${roleId}`, data, { token });
  },

  async delete(roleId: string, token?: string): Promise<{ status: string; message: string }> {
    return apiClient.delete<{ status: string; message: string }>(`/api/v1/roles/${roleId}`, { token });
  },

  async listPermissions(token?: string): Promise<{ modules: Record<string, PermissionItem[]>; total: number }> {
    return apiClient.get<{ modules: Record<string, PermissionItem[]>; total: number }>("/api/v1/permissions", { token });
  },
};
