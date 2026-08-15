import { apiClient } from "./client";

export interface FoundationProfileData {
  id?: string;
  name: string;
  logo?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  currency: string;
}

export const settingsApi = {
  async getSystemSettings(token?: string): Promise<Record<string, string>> {
    return apiClient.get<Record<string, string>>("/api/v1/settings/system", { token });
  },

  async saveSystemSettings(
    settingsMap: Record<string, string>,
    group: string = "General",
    token?: string
  ): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(
      "/api/v1/settings/system",
      settingsMap,
      { params: { group }, token }
    );
  },

  async getMonthlyMembershipFee(token?: string): Promise<number> {
    try {
      const res = await apiClient.get<{ fee: number }>("/api/v1/settings/monthly-fee", { token });
      return res.fee || 100;
    } catch {
      return 100;
    }
  },

  async getFoundationProfile(token?: string): Promise<FoundationProfileData> {
    return apiClient.get<FoundationProfileData>("/api/v1/settings/foundation-profile", { token });
  },

  async saveFoundationProfile(
    data: Partial<FoundationProfileData>,
    token?: string
  ): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>("/api/v1/settings/foundation-profile", data, { token });
  },
};
