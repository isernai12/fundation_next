import { apiClient } from "./client";
import {
  AuthLoginResponse,
  UserProfileDto,
  DeviceSessionListResponse,
} from "./types";

export const authApi = {
  /**
   * Authenticate user credentials via FastAPI
   */
  async login(payload: {
    username: string;
    password: string;
    remember_me?: boolean;
  }): Promise<AuthLoginResponse> {
    return apiClient.post<AuthLoginResponse>("/api/v1/auth/login", payload);
  },

  /**
   * Invalidate current user session
   */
  async logout(token?: string): Promise<{ status: string; message: string }> {
    return apiClient.post<{ status: string; message: string }>("/api/v1/auth/logout", {}, { token });
  },

  /**
   * Get current authenticated user profile and permissions
   */
  async getMe(token?: string): Promise<UserProfileDto> {
    return apiClient.get<UserProfileDto>("/api/v1/auth/me", { token });
  },

  /**
   * List active user devices and sessions
   */
  async getDevices(token?: string): Promise<DeviceSessionListResponse> {
    return apiClient.get<DeviceSessionListResponse>("/api/v1/auth/devices", { token });
  },

  /**
   * Revoke specific device session by JTI
   */
  async revokeDevice(jti: string, token?: string): Promise<{ status: string; message: string }> {
    return apiClient.delete<{ status: string; message: string }>(`/api/v1/auth/devices/${jti}`, { token });
  },

  /**
   * Revoke all device sessions except the current active session
   */
  async revokeOtherDevices(token?: string): Promise<{ status: string; message: string }> {
    return apiClient.delete<{ status: string; message: string }>("/api/v1/auth/devices", { token });
  },

  /**
   * Revoke all device sessions for the user
   */
  async revokeAllDevices(token?: string): Promise<{ status: string; message: string }> {
    return apiClient.delete<{ status: string; message: string }>("/api/v1/auth/devices", {
      params: { all_devices: true },
      token,
    });
  },

  /**
   * Change user password
   */
  async changePassword(
    data: { current_password: string; new_password: string },
    token?: string
  ): Promise<{ status: string; message: string }> {
    return apiClient.post<{ status: string; message: string }>(
      "/api/v1/auth/change-password",
      data,
      { token }
    );
  },

  /**
   * Update user UI preferences
   */
  async updatePreferences(
    preferences: string,
    token?: string
  ): Promise<UserProfileDto> {
    return apiClient.patch<UserProfileDto>(
      "/api/v1/auth/preferences",
      { preferences },
      { token }
    );
  },

  /**
   * Update user profile details
   */
  async updateProfile(
    data: { name?: string; mobile?: string; email?: string; photo?: string },
    token?: string
  ): Promise<UserProfileDto> {
    return apiClient.patch<UserProfileDto>("/api/v1/auth/profile", data, { token });
  },
};
