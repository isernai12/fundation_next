"use server"

import { prisma } from "@/lib/prisma"
import { groupSchema, type GroupFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { GroupStatus } from "@prisma/client"

export async function getGroups() {
  return prisma.group.findMany({
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
        name: parsed.data.name,
        code: parsed.data.code,
        shortName: parsed.data.shortName,
        description: parsed.data.description,
        groupLeader: parsed.data.groupLeader,
        remarks: parsed.data.remarks,
        status: parsed.data.status,
        foundationId: foundation.id,
      },
    })
    revalidatePath("/groups")
    return { success: true, data: group }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create group" }
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
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        shortName: parsed.data.shortName,
        description: parsed.data.description,
        groupLeader: parsed.data.groupLeader,
        remarks: parsed.data.remarks,
        status: parsed.data.status,
      },
    })
    revalidatePath("/groups")
    revalidatePath(`/groups/${id}`)
    return { success: true, data: group }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update group" }
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
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to archive group" }
  }
}

export async function deleteGroup(id: string) {
  try {
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true, funds: true, documents: true }
        }
      }
    })

    if (!group) return { success: false, error: "Group not found" }
    if (group._count.members > 0) return { success: false, error: "Cannot delete group with existing members." }
    if (group._count.funds > 0) return { success: false, error: "Cannot delete group with existing funds or ledger entries." }
    
    // Additional checks for Loans and Grants would go here once implemented
    // For now, if members and funds are 0, we can delete
    await prisma.group.delete({ where: { id } })
    revalidatePath("/groups")
    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete group" }
  }
}

export async function getGroupMembers(groupId: string) {
  if (!groupId) return []
  return prisma.member.findMany({
    where: { groupId },
    orderBy: { createdAt: "desc" },
  })
}

export async function removeMemberFromGroup(memberId: string) {
  return { success: false, error: "Members must belong to a group. Please reassign the member instead of removing them." }
}

export async function getGroupFundSummary(_groupId: string) {
  // Placeholder implementation since Ledger is not fully built out
  return {
    currentBalance: 0,
    openingBalance: 0,
    totalContributions: 0,
    totalLoans: 0,
    totalLoanReturns: 0,
    totalGrants: 0,
    availableBalance: 0,
    memberCount: 0,
  }
}

export async function getGroupLedger(_groupId: string) {
  return []
}

export async function getGroupTransactions(_groupId: string) {
  return []
}

