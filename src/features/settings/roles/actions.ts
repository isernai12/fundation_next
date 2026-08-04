"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requirePermission, checkPermission } from "@/lib/rbac"

export async function getRolesAndPermissions() {
  if (!await checkPermission("Roles & Permissions", "View") && !await checkPermission("Roles & Permissions", "Manage")) {
    return { roles: [], permissions: [], rolePermissions: [] }
  }

  const roles = await prisma.role.findMany({
    orderBy: { createdAt: 'asc' }
  })
  
  const permissions = await prisma.permission.findMany({
    orderBy: [
      { module: 'asc' },
      { action: 'asc' }
    ]
  })
  
  const rolePermissions = await prisma.rolePermission.findMany()

  return { roles, permissions, rolePermissions }
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  await requirePermission("Roles & Permissions", "Manage")

  try {
    // First, delete all existing permissions for the role
    await prisma.rolePermission.deleteMany({
      where: { roleId }
    })
    
    // Insert new ones
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId,
          permissionId
        }))
      })
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RBAC DEBUG] updateRolePermissions - Updated Role ID: ${roleId} with ${permissionIds.length} permissions`);
    }
    revalidatePath("/", "layout")
    revalidatePath("/(dashboard)", "layout")
    return { success: true }
  } catch (error) {
    console.error("Failed to update role permissions:", error)
    return { success: false, error: "Failed to update role permissions" }
  }
}
