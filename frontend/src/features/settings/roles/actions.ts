"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { rolesApi } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";

export async function getRolesAndPermissions() {
  if (
    !(await checkPermission("Roles & Permissions", "View")) &&
    !(await checkPermission("Roles & Permissions", "Manage"))
  ) {
    return { roles: [], permissions: [], rolePermissions: [] };
  }

  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    const [rolesRes, permsRes] = await Promise.all([
      rolesApi.list(token),
      rolesApi.listPermissions(token),
    ]);

    const roles = rolesRes.items || [];
    const permissions: any[] = [];
    if (permsRes?.modules) {
      for (const [mod, perms] of Object.entries(permsRes.modules)) {
        for (const p of perms) {
          permissions.push({
            id: p.id,
            module: p.module || mod,
            action: p.action,
            name_en: p.name_en,
            name_bn: p.name_bn,
          });
        }
      }
    }

    return { roles, permissions, rolePermissions: [] };
  } catch (error) {
    console.error("[Roles] Failed to fetch roles and permissions:", error);
    return { roles: [], permissions: [], rolePermissions: [] };
  }
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  await requirePermission("Roles & Permissions", "Manage");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  try {
    await rolesApi.update(roleId, { permission_codes: permissionIds }, token);
    revalidatePath("/", "layout");
    revalidatePath("/(dashboard)", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update role permissions:", error);
    return { success: false, error: error.message || "Failed to update role permissions" };
  }
}
