"use server";

import { requirePermission, checkPermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { usersApi, rolesApi } from "@/lib/api";
import { getAuthSession } from "@/lib/auth";

export async function getUsers() {
  if (!(await checkPermission("Users", "View"))) return [];
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    return await usersApi.list(token);
  } catch (error) {
    console.error("[Users] Failed to fetch users:", error);
    return [];
  }
}

export async function getRoles() {
  if (!(await checkPermission("Users", "View"))) return [];
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    const res = await rolesApi.list(token);
    return res.items || [];
  } catch (error) {
    console.error("[Users] Failed to fetch roles:", error);
    return [];
  }
}

export async function getAllPermissions() {
  if (!(await checkPermission("Users", "View"))) return [];
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    const res = await rolesApi.listPermissions(token);
    const list: any[] = [];
    if (res?.modules) {
      for (const [module, perms] of Object.entries(res.modules)) {
        for (const p of perms) {
          list.push({
            id: p.id,
            module: p.module || module,
            action: p.action,
            name_en: p.name_en,
            name_bn: p.name_bn,
          });
        }
      }
    }
    return list;
  } catch (error) {
    console.error("[Users] Failed to fetch permissions:", error);
    return [];
  }
}

export async function getUserWithPermissions(userId: string) {
  await requirePermission("Users", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  try {
    return await usersApi.get(userId, token);
  } catch (error) {
    console.error("[Users] Failed to fetch user with permissions:", error);
    return null;
  }
}

export async function createUser(data: any) {
  await requirePermission("Users", "Manage");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  const user = await usersApi.create(data, token);
  revalidatePath("/settings/users");
  return user;
}

export async function updateUser(userId: string, data: any) {
  await requirePermission("Users", "Manage");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  const user = await usersApi.update(userId, data, token);
  revalidatePath("/settings/users");
  return user;
}

export async function updateUserPermissions(userId: string, permissionIds: string[]) {
  await requirePermission("Users", "Manage");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  await usersApi.updatePermissions(userId, permissionIds, token);
  revalidatePath("/settings/users");
}

export async function deleteUser(userId: string) {
  await requirePermission("Users", "Manage");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  await usersApi.update(userId, { status: "SUSPENDED" }, token);
  revalidatePath("/settings/users");
}
