"use server"

import { prisma } from "@/lib/prisma"
import { grantSchema, type GrantFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { LedgerEngine } from "@/services/ledger"
import { GrantStatus } from "@prisma/client"

export async function getGrants() {
  return prisma.grant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      beneficiary: true,
      allocations: { include: { fund: { include: { group: true } } } },
    }
  })
}

export async function getGrant(id: string) {
  return prisma.grant.findUnique({
    where: { id },
    include: {
      beneficiary: true,
      allocations: { include: { fund: { include: { group: true } } } },
    }
  })
}

async function generateGrantNumber() {
  const count = await prisma.grant.count()
  const year = new Date().getFullYear()
  return `G-${year}-${(count + 1).toString().padStart(4, '0')}`
}

export async function createGrantRequest(data: GrantFormValues) {
  const parsed = grantSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  const pd = parsed.data

  const grantNumber = await generateGrantNumber()

  try {
    const grant = await prisma.grant.create({
      data: {
        grantNumber,
        beneficiaryId: pd.beneficiaryId,
        amount: pd.amount,
        purpose: pd.purpose,
        notes: pd.notes,
        status: "PENDING",
      }
    })
    
    revalidatePath("/grants")
    return { success: true, data: grant }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create grant" }
  }
}

export async function approveGrant(id: string) {
  await prisma.grant.update({
    where: { id },
    data: { status: "APPROVED", dateApproved: new Date() }
  })
  revalidatePath(`/grants/${id}`)
  revalidatePath("/grants")
  return { success: true }
}

export async function disburseGrant(id: string, allocations: { fundId: string; amount: number }[]) {
  return await prisma.$transaction(async (tx) => {
    const grant = await tx.grant.findUnique({ where: { id } })
    if (!grant) throw new Error("Grant not found")
    if (grant.status !== "APPROVED") throw new Error("Grant must be approved before disbursement")

    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0)
    if (totalAllocated !== grant.amount) throw new Error("Total allocations must exactly match the grant amount")

    // Fetch General Fund
    const generalFund = await tx.fund.findFirst({ where: { groupId: null } })
    if (!generalFund) throw new Error("General fund not found")

    // Construct Ledger Entries
    const entries = [
      // Credit Cash (General Fund) - Asset reduction
      { fundId: generalFund.id, isCredit: true, amount: grant.amount }
    ]

    // Debit Group Funds - Equity reduction (Expense)
    for (const alloc of allocations) {
      entries.push({ fundId: alloc.fundId, isCredit: false, amount: alloc.amount })
    }

    // Create Ledger Transaction
    await LedgerEngine.createTransaction({
      date: new Date(),
      type: "GRANT",
      referenceId: grant.grantNumber,
      notes: `Disbursement for Grant ${grant.grantNumber}`,
      entries
    }, tx)

    // Create Allocations
    await tx.fundAllocation.createMany({
      data: allocations.map(a => ({
        fundId: a.fundId,
        targetType: "GRANT",
        grantId: grant.id,
        amount: a.amount
      }))
    })

    // Update Grant Status
    await tx.grant.update({
      where: { id },
      data: { status: "PAID", disbursedDate: new Date() }
    })

    revalidatePath(`/grants/${id}`)
    revalidatePath("/grants")
    return { success: true }
  })
}
