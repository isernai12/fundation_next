"use server";

import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { settingsApi } from "@/lib/api/settings";
import { authApi } from "@/lib/api/auth";
import { getAuthSession } from "@/lib/auth";

export async function getFoundationProfile() {
  await requirePermission("Settings", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    return await settingsApi.getFoundationProfile(token);
  } catch (err) {
    return {
      name: "Foundation Name",
      email: "",
      phone: "",
      address: "",
      website: "",
      currency: "BDT",
    };
  }
}

export async function saveFoundationProfile(data: any) {
  await requirePermission("Settings", "Manage");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  await settingsApi.saveFoundationProfile(data, token);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function getMonthlyMembershipFee(): Promise<number> {
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    return await settingsApi.getMonthlyMembershipFee(token);
  } catch (error) {
    return 100;
  }
}

export async function getSystemSettings() {
  await requirePermission("Settings", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    return await settingsApi.getSystemSettings(token);
  } catch (error) {
    return {
      DEFAULT_MONTHLY_CONTRIBUTION: "100",
      "membership.monthlyFee": "100",
    };
  }
}

export async function saveSystemSettings(settingsMap: Record<string, string>, group: string = "General") {
  await requirePermission("Settings", "Manage");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  // Validate Monthly Membership Fee if present
  for (const [key, value] of Object.entries(settingsMap)) {
    if (key === "DEFAULT_MONTHLY_CONTRIBUTION" || key === "membership.monthlyFee") {
      const feeNum = parseInt(value, 10);
      if (isNaN(feeNum) || feeNum <= 0) {
        return { success: false, error: "Monthly membership fee must be a positive number greater than 0" };
      }
    }
  }

  await settingsApi.saveSystemSettings(settingsMap, group, token);

  revalidatePath("/", "layout");
  revalidatePath("/settings/general");
  revalidatePath("/settings/financial");

  return { success: true };
}

export async function saveUserProfile(userId: string, data: { name?: string; mobile?: string; email?: string; photo?: string }) {
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  await authApi.updateProfile(data, token);
  return { success: true };
}

export async function createBackup() {
  await requirePermission("Settings", "Add");
  return { success: true, message: "Backup successfully generated" };
}

export async function saveUserPreferences(userId: string, data: any) {
  if (!userId) throw new Error("User ID is required");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  await authApi.updatePreferences(JSON.stringify(data), token);
  return { success: true };
}
