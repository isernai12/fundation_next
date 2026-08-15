import { getAuthSession } from "./auth";
import { hasPermission, isSuperAdminRole } from "./rbac-client";
import { authApi } from "./api/auth";
import { cache } from "react";
import { redirect } from "next/navigation";

/**
 * Fetch all permissions for a user (from session or FastAPI backend)
 */
export const getUserPermissions = cache(async (userId: string): Promise<string[]> => {
  if (!userId) return [];

  const session = await getAuthSession();
  const user = session?.user as any;

  if (!user) {
    return [];
  }

  // 1. HARDCODED SUPER_ADMIN BYPASS: Always return wildcard "*"
  if (isSuperAdminRole(user.role)) {
    return ["*"];
  }

  // If permissions are already attached to the session token
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }

  // Fallback to FastAPI GET /api/v1/auth/me
  try {
    const token = (session as any)?.accessToken;
    const profile = await authApi.getMe(token);
    return profile.permissions || [];
  } catch (err) {
    console.error("[RBAC] Failed to fetch user permissions from backend:", err);
    return [];
  }
});

/**
 * Fetch user preferences (cached per request to avoid duplicate queries)
 */
export const getUserPreferences = cache(async (userId: string) => {
  if (!userId) return null;

  const session = await getAuthSession();
  const user = session?.user as any;

  if (user?.preferences) {
    try {
      return typeof user.preferences === "string"
        ? (JSON.parse(user.preferences) as { dateFormat?: string; timezone?: string })
        : (user.preferences as { dateFormat?: string; timezone?: string });
    } catch {
      return null;
    }
  }

  try {
    const token = (session as any)?.accessToken;
    const profile = await authApi.getMe(token);
    if (!profile.preferences) return null;
    return JSON.parse(profile.preferences) as { dateFormat?: string; timezone?: string };
  } catch {
    return null;
  }
});

export { hasPermission, isSuperAdminRole };

/**
 * Helper to redirect on unauthorized access
 */
async function handleUnauthorized(userId: string, module: string, action: string) {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[RBAC] Unauthorized access attempt: user=${userId}, module=${module}, action=${action}`);
  }
  redirect(`/unauthorized?module=${encodeURIComponent(module)}&action=${encodeURIComponent(action)}`);
}

/**
 * Server-side guard to require authentication and a specific permission.
 * Redirects if unauthorized.
 */
export async function requirePermission(module: string, action: string) {
  const session = await getAuthSession();
  const user = session?.user as any;
  if (!user?.id) {
    redirect("/login");
  }

  const userId = user.id;
  const userRole = user.role;

  // 1. HARDCODED SUPER_ADMIN BYPASS
  if (isSuperAdminRole(userRole)) {
    return user;
  }

  const permissions = await getUserPermissions(userId);
  const isAllowed = hasPermission(permissions, module, action, userRole);

  if (!isAllowed) {
    await handleUnauthorized(userId, module, action);
  }

  return user;
}

/**
 * Page-level guard to redirect to 403 if unauthorized.
 */
export async function authorizePage(module: string, action: string) {
  const session = await getAuthSession();
  const user = session?.user as any;
  if (!user?.id) {
    redirect("/login");
  }

  const userId = user.id;
  const userRole = user.role;

  // 1. HARDCODED SUPER_ADMIN BYPASS
  if (isSuperAdminRole(userRole)) {
    return { session, permissions: ["*"] };
  }

  const permissions = await getUserPermissions(userId);
  const isAllowed = hasPermission(permissions, module, action, userRole);

  if (!isAllowed) {
    await handleUnauthorized(userId, module, action);
  }

  return { session, permissions };
}

/**
 * Non-redirecting server-side permission checker for safe data loading.
 */
export async function checkPermission(module: string, action: string): Promise<boolean> {
  const session = await getAuthSession();
  const user = session?.user as any;
  if (!user?.id) return false;

  const userRole = user.role;

  // 1. HARDCODED SUPER_ADMIN BYPASS
  if (isSuperAdminRole(userRole)) {
    return true;
  }

  const permissions = await getUserPermissions(user.id);
  return hasPermission(permissions, module, action, userRole);
}
