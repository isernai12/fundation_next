import { apiClient } from "./client";

export interface UserItem {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  mobile?: string | null;
  roleId?: string | null;
  role?: { id: string; name: string } | null;
  status: string;
  photo?: string | null;
  userPermissions?: Array<{
    permissionId: string;
    permission?: { id: string; module: string; action: string } | null;
  }>;
}

export const usersApi = {
  async list(token?: string): Promise<UserItem[]> {
    return apiClient.get<UserItem[]>("/api/v1/users", { token });
  },

  async get(userId: string, token?: string): Promise<UserItem> {
    return apiClient.get<UserItem>(`/api/v1/users/${userId}`, { token });
  },

  async create(
    data: {
      name: string;
      username: string;
      email?: string | null;
      mobile?: string | null;
      password: string;
      roleId: string;
      status?: string;
    },
    token?: string
  ): Promise<any> {
    return apiClient.post("/api/v1/users", data, { token });
  },

  async update(userId: string, data: any, token?: string): Promise<any> {
    return apiClient.patch(`/api/v1/users/${userId}`, data, { token });
  },

  async updatePermissions(
    userId: string,
    permissionIds: string[],
    token?: string
  ): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(
      `/api/v1/users/${userId}/permissions`,
      { permissionIds },
      { token }
    );
  },
};
