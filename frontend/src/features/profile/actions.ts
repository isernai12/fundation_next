"use server";

import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/rbac";
import { authApi } from "@/lib/api/auth";
import { uploadApi } from "@/lib/api/upload";

async function getSessionUser() {
  const session = await getAuthSession();
  const user = session?.user as any;
  if (!user?.id) redirect("/login");
  return { ...session, user, accessToken: (session as any)?.accessToken } as any;
}

export async function getUserProfile() {
  await requirePermission("Users", "View");
  const session = await getSessionUser();
  try {
    const profile = await authApi.getMe(session.accessToken);
    return {
      name: profile.name,
      username: profile.username,
      role: profile.role,
      mobile: profile.mobile || "",
      email: profile.email || "",
      photo: profile.photo || null,
    };
  } catch (err: any) {
    throw new Error(err.message || "User not found");
  }
}

export async function updateUserProfile(data: { name: string; username: string; mobile: string }) {
  await requirePermission("Users", "Edit");
  const session = await getSessionUser();

  try {
    await authApi.updateProfile(
      {
        name: data.name,
        mobile: data.mobile,
      },
      session.accessToken
    );

    revalidatePath("/profile");
    return { success: true, requireReauth: false };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update profile." };
  }
}

export async function uploadProfilePhoto(formData: FormData) {
  await requirePermission("Users", "Manage");
  const session = await getSessionUser();
  const file = formData.get("file") as File | null;

  if (!file) return { success: false, error: "No file provided" };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { success: false, error: "Unsupported image type. Use JPG, PNG or WEBP." };
  }

  if (file.size > 2 * 1024 * 1024) return { success: false, error: "File exceeds 2MB limit" };

  try {
    const uploadRes = await uploadApi.uploadFile(file, "foundation-erp/profiles", file.name, session.accessToken);
    await authApi.updateProfile({ photo: uploadRes.secure_url }, session.accessToken);

    revalidatePath("/profile");
    return { success: true, url: uploadRes.secure_url };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to upload photo" };
  }
}

export async function changeUserPassword(data: { current: string; new: string }) {
  await requirePermission("Users", "Manage");
  const session = await getSessionUser();

  try {
    await authApi.changePassword(
      {
        current_password: data.current,
        new_password: data.new,
      },
      session.accessToken
    );
    return { success: true, requireReauth: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.response?.data?.detail || err.message || "Current password is incorrect.",
    };
  }
}

export async function getUserSessions() {
  await requirePermission("Users", "View");
  const session = await getSessionUser();
  try {
    const res = await authApi.getDevices(session.accessToken);
    return {
      sessions: res.sessions.map((s) => ({
        id: s.id,
        jti: s.jti,
        device: s.device,
        browser: s.browser,
        os: s.os,
        ipAddress: s.ip_address,
        lastActive: new Date(s.last_active),
        expiresAt: new Date(s.expires_at),
      })),
      currentJti: res.current_jti || "",
    };
  } catch (err: any) {
    return { sessions: [], currentJti: "" };
  }
}

export async function logoutDevice(jti: string) {
  await requirePermission("Users", "Manage");
  const session = await getSessionUser();
  try {
    await authApi.revokeDevice(jti, session.accessToken);
    revalidatePath("/profile/devices");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logoutOtherDevices() {
  await requirePermission("Users", "Manage");
  const session = await getSessionUser();
  try {
    await authApi.revokeOtherDevices(session.accessToken);
    revalidatePath("/profile/devices");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function logoutAllDevices() {
  await requirePermission("Users", "Manage");
  const session = await getSessionUser();
  try {
    await authApi.revokeAllDevices(session.accessToken);
    return { success: true, requireReauth: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
