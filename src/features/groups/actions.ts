"use server"

import { prisma } from "@/lib/prisma"
import { groupSchema, type GroupFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { GroupStatus } from "@prisma/client"

export async function getGroups() {
  return prisma.group.findMany({
    where: { status: { not: "INACTIVE" } }, // Optional: adjust based on archive logic, but requirement says "Archive Group", so we might fetch all and filter, or just exclude deleted. Let's fetch all for the list and allow filtering.
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { members: true },
      },
    },
  })
}

export async function getGroup(id: string) {
  return prisma.group.findUnique({
    where: { id },
    include: {
      members: true,
      _count: {
        select: { members: true },
      },
    },
  })
}

export async function createGroup(data: GroupFormValues) {
  const parsed = groupSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  // Need foundationId. In a real app, this comes from context/session. 
  // We'll grab the first one since it's a single foundation ERP.
  const foundation = await prisma.foundation.findFirst()
  if (!foundation) return { success: false, error: "Foundation not found" }

  // Check unique code
  const existingCode = await prisma.group.findUnique({ where: { code: parsed.data.code } })
  if (existingCode) return { success: false, error: "Group code must be unique" }

  try {
    const group = await prisma.group.create({
      data: {
        ...parsed.data,
        foundationId: foundation.id,
      },
    })
    revalidatePath("/groups")
    return { success: true, data: group }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create group" }
  }
}

export async function updateGroup(id: string, data: GroupFormValues) {
  const parsed = groupSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }

  const existingCode = await prisma.group.findUnique({ where: { code: parsed.data.code } })
  if (existingCode && existingCode.id !== id) {
    return { success: false, error: "Group code already exists" }
  }

  try {
    const group = await prisma.group.update({
      where: { id },
      data: parsed.data,
    })
    revalidatePath("/groups")
    revalidatePath(`/groups/${id}`)
    return { success: true, data: group }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update group" }
  }
}

export async function archiveGroup(id: string) {
  try {
    // Check if group has members
    const group = await prisma.group.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    })

    if (!group) return { success: false, error: "Group not found" }
    
    if (group._count.members > 0) {
      return { success: false, error: "Cannot archive group with existing members." }
    }

    await prisma.group.update({
      where: { id },
      data: { status: GroupStatus.INACTIVE },
    })
    
    revalidatePath("/groups")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to archive group" }
  }
}
