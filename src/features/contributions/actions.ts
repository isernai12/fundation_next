"use server"

import { prisma } from "@/lib/prisma"
import { contributionSchema, type ContributionFormValues } from "./schema"
import { LedgerEngine } from "@/services/ledger"
import { revalidatePath } from "next/cache"

export async function createContribution(data: ContributionFormValues) {
  const parsed = contributionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  
  const pd = parsed.data

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Get member to ensure they exist and get their group
      const member = await tx.member.findUnique({ where: { id: pd.memberId } })
      if (!member) throw new Error("Member not found")

      // 2. Check for duplicate contribution unless explicitly marked as additional
      if (!pd.isAdditional) {
        const existing = await tx.monthlyContribution.findFirst({
          where: {
            memberId: pd.memberId,
            month: pd.month,
            year: pd.year,
            isAdditional: false,
          }
        })
        if (existing) throw new Error("A contribution for this month and year already exists. Check 'Additional Payment' if this is intentional.")
      }

      // 3. Create Monthly Contribution Agreement
      const monthlyContribution = await tx.monthlyContribution.create({
        data: {
          memberId: pd.memberId,
          month: pd.month,
          year: pd.year,
          expectedAmount: pd.amount,
          isAdditional: pd.isAdditional,
          status: pd.status,
        }
      })

      // 4. Only process Ledger and Payment if Status is PAID or PARTIAL
      // If it's PENDING, no ledger is created because no money moved.
      if (pd.status === "PAID" || pd.status === "PARTIAL") {
        // Prepare Funds
        const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(member.groupId, tx)

        // Create Ledger Transaction
        const ledgerTx = await LedgerEngine.createTransaction({
          date: new Date(pd.paymentDate),
          type: "CONTRIBUTION",
          referenceId: pd.referenceNumber,
          notes: pd.notes,
          entries: [
            { fundId: generalFund.id, isCredit: false, amount: pd.amount }, // Debit Cash/Asset
            { fundId: groupFund.id, isCredit: true, amount: pd.amount }     // Credit Group Equity
          ]
        }, tx)

        // Create Contribution Payment strictly bound to the Ledger Transaction
        await tx.contributionPayment.create({
          data: {
            monthlyContributionId: monthlyContribution.id,
            ledgerTransactionId: ledgerTx.id,
            amount: pd.amount,
            paymentDate: new Date(pd.paymentDate),
            paymentMethod: pd.paymentMethod,
            referenceNumber: pd.referenceNumber,
            notes: pd.notes,
          }
        })
      }

      revalidatePath("/contributions")
      revalidatePath(`/members/${member.id}`)
      revalidatePath(`/groups/${member.groupId}`)
      revalidatePath("/")
      return { success: true, error: undefined }
    })
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to process contribution" }
  }
}

export async function getContributions() {
  return prisma.monthlyContribution.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: {
        select: { firstName: true, lastName: true, memberId: true, group: { select: { name: true, code: true } } }
      },
      payments: true,
    }
  })
}
