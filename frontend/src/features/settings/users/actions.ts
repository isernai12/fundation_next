"use server"

import { prisma } from "@/lib/prisma"
import { requirePermission, checkPermission } from "@/lib/rbac"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getUsers() {
  if (!await checkPermission("Users", "View")) return []
  return prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" }
  })
}

export async function getRoles() {
  if (!await checkPermission("Users", "View")) return []
  return prisma.role.findMany({
    orderBy: { name: "asc" }
  })
}

export async function getAllPermissions() {
  if (!await checkPermission("Users", "View")) return []
  return prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { action: "asc" }]
  })
}

export async function getUserWithPermissions(userId: string) {
  await requirePermission("Users", "View")
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      },
      userPermissions: {
        include: { permission: true }
      }
    }
  })
}

export async function createUser(data: any) {
  await requirePermission("Users", "Manage")
  
  const hashedPassword = await bcrypt.hash(data.password, 10)
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email || null,
      mobile: data.mobile || null,
      password: hashedPassword,
      roleId: data.roleId,
      status: data.status || "ACTIVE"
    }
  })
  
  revalidatePath("/settings/users")
  return user
}

export async function updateUser(userId: string, data: any) {
  await requirePermission("Users", "Manage")
  
  const updateData: any = {
    name: data.name,
    username: data.username,
    email: data.email || null,
    mobile: data.mobile || null,
    roleId: data.roleId,
    status: data.status
  }
  
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }
  
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData
  })
  
  revalidatePath("/settings/users")
  return user
}

export async function updateUserPermissions(userId: string, permissionIds: string[]) {
  await requirePermission("Users", "Manage")
  
  // Start a transaction to replace user permissions
  await prisma.$transaction([
    prisma.userPermission.deleteMany({
      where: { userId }
    }),
    prisma.userPermission.createMany({
      data: permissionIds.map(permissionId => ({
        userId,
        permissionId
      }))
    })
  ])
  
  revalidatePath("/settings/users")
}

export async function deleteUser(userId: string) {
  await requirePermission("Users", "Manage")
  
  await prisma.user.delete({
    where: { id: userId }
  })
  
  revalidatePath("/settings/users")
}
