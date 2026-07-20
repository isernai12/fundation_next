"use server"

import { prisma } from "@/lib/prisma"
import { groupSchema, type GroupFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { GroupStatus } from "@prisma/client"

export async function getGroups() {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { members: true },
      },
      funds: {
        select: { id: true }
      }
    },
  })

  if (groups.length === 0) return []

  const fundIds = groups.flatMap(g => g.funds.map(f => f.id))
  
  const aggregations = fundIds.length > 0 
    ? await prisma.ledgerEntry.groupBy({
        by: ['fundId', 'isCredit'],
        where: { fundId: { in: fundIds } },
        _sum: { amount: true }
      })
    : []

  const fundBalances: Record<string, number> = {}
  for (const agg of aggregations) {
    if (!fundBalances[agg.fundId]) fundBalances[agg.fundId] = 0
    const amount = agg._sum.amount || 0
    if (agg.isCredit) fundBalances[agg.fundId] += amount
    else fundBalances[agg.fundId] -= amount
  }

  return groups.map(group => {
    let currentFund = 0
    if (group.funds && group.funds.length > 0) {
      currentFund = fundBalances[group.funds[0].id] || 0
    }
    const { funds, ...rest } = group
    return {
      ...rest,
      currentFund
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

export async function getGroupFundSummary(groupId: string) {
  if (!groupId) return null

  // Get the group fund
  const groupFund = await prisma.fund.findFirst({
    where: { groupId }
  })

  // Get total members
  const memberCount = await prisma.member.count({
    where: { groupId, status: "ACTIVE" }
  })

  // If no fund yet, just return 0s
  if (!groupFund) {
    return {
      currentBalance: 0,
      openingBalance: 0,
      totalContributions: 0,
      totalLoans: 0,
      totalLoanReturns: 0,
      totalGrants: 0,
      availableBalance: 0,
      totalFund: 0,
      totalDonations: 0,
      totalExpenses: 0,
      memberCount,
    }
  }

  // Calculate actual ledger balances
  // We need to sum up all credits and debits to this fund
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { fundId: groupFund.id },
    include: { transaction: true }
  })

  let totalContributions = 0
  let totalLoans = 0
  let totalLoanReturns = 0
  let totalGrants = 0
  const totalDonations = 0
  const totalExpenses = 0
  
  let totalCredits = 0
  let totalDebits = 0

  for (const entry of ledgerEntries) {
    if (entry.isCredit) {
      totalCredits += entry.amount
    } else {
      totalDebits += entry.amount
    }

    const txType = entry.transaction.type
    // If credit to the group fund (liability/equity increase)
    if (entry.isCredit) {
      if (txType === "CONTRIBUTION") totalContributions += entry.amount
      if (txType === "REPAYMENT") totalLoanReturns += entry.amount
      // Assuming DONATION uses TRANSFER or ADJUSTMENT, or maybe a new type? We'll categorize if needed
    } else {
      // Debit (group fund reduces)
      if (txType === "LOAN") totalLoans += entry.amount
      if (txType === "GRANT") totalGrants += entry.amount
    }
  }

  const currentBalance = totalCredits - totalDebits

  const uniqueTransactions = new Set(ledgerEntries.map(e => e.transactionId)).size

  return {
    currentBalance,
    openingBalance: 0, // In a real system, you'd calculate this based on a date cutoff or opening ledger type
    totalContributions,
    totalLoans,
    totalLoanReturns,
    totalGrants,
    availableBalance: currentBalance,
    totalFund: currentBalance, // Total fund is same as current balance in simple accounting
    totalDonations,
    totalExpenses,
    memberCount,
    totalTransactions: uniqueTransactions,
  }
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

