"use server"

import { prisma } from "@/lib/prisma"
import { groupSchema, type GroupFormValues } from "./schema"
import { revalidatePath } from "next/cache"

export async function getGroups() {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { members: true },
      },
    },
  })

  if (groups.length === 0) return []

  const { FinancialService } = require("@/services/finance")
  const summaries = await FinancialService.getAllGroupSummaries()
  const summaryMap = new Map(summaries.map((s: any) => [s.groupId, s.currentBalance]))

  return groups.map(group => {
    return {
      ...group,
      currentFund: Number(summaryMap.get(group.id) || 0)
    }
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
  let foundation = await prisma.foundation.findFirst()
  if (!foundation) {
    foundation = await prisma.foundation.create({
      data: {
        name: "Main Foundation",
        description: "Default Foundation (Auto-generated)"
      }
    })
  }

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
      data: { status: "INACTIVE" },
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

export async function getGroupFundSummary(groupId: string) {
  const { FinancialService } = require("@/services/finance")
  return await FinancialService.getGroupFundSummary(groupId)
}

export async function getGroupLedger(groupId: string) {
  if (!groupId) return []
  
  const groupFund = await prisma.fund.findFirst({
    where: { groupId }
  })

  if (!groupFund) return []

  const entries = await prisma.ledgerEntry.findMany({
    where: { fundId: groupFund.id },
    include: {
      transaction: true
    },
    orderBy: { createdAt: 'asc' }
  })

  let runningBalance = 0

  return entries.map(entry => {
    if (entry.isCredit) runningBalance += entry.amount
    else runningBalance -= entry.amount

    return {
      id: entry.id,
      date: entry.transaction.date.toISOString().split("T")[0],
      voucher: entry.transaction.id.substring(0, 8).toUpperCase(),
      type: entry.transaction.type,
      reference: entry.transaction.referenceId || "-",
      debit: !entry.isCredit ? entry.amount : 0,
      credit: entry.isCredit ? entry.amount : 0,
      runningBalance,
      remarks: entry.transaction.notes || "-",
    }
  }).reverse() // Return newest first
}

export async function getGroupTransactions(groupId: string) {
  if (!groupId) return []
  
  const groupFund = await prisma.fund.findFirst({
    where: { groupId }
  })

  if (!groupFund) return []

  const entries = await prisma.ledgerEntry.findMany({
    where: { fundId: groupFund.id },
    include: {
      transaction: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return entries.map(entry => ({
    id: entry.transaction.id,
    date: entry.transaction.date.toISOString().split("T")[0],
    type: entry.transaction.type,
    reference: entry.transaction.referenceId || entry.transaction.id.substring(0, 8).toUpperCase(),
    amount: entry.amount,
    status: entry.transaction.status,
    remarks: entry.transaction.notes || "-",
  }))
}

