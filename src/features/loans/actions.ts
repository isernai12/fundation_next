"use server"

import { prisma } from "@/lib/prisma"
import { loanSchema, type LoanFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { LedgerEngine } from "@/services/ledger"
import { LoanStatus } from "@prisma/client"

export async function getLoans() {
  return prisma.loan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      beneficiary: true,
      allocations: { include: { fund: { include: { group: true } } } },
      repayments: true,

    }
  })
}

export async function getLoan(id: string) {
  return prisma.loan.findUnique({
    where: { id },
    include: {
      beneficiary: true,
      allocations: { include: { fund: { include: { group: true } } } },

      repayments: { include: { ledgerTransaction: true }, orderBy: { date: 'desc' } }
    }
  })
}

async function generateLoanNumber(tx: any = prisma) {
  const count = await tx.loan.count()
  const year = new Date().getFullYear()
  return `L-${year}-${(count + 1).toString().padStart(4, '0')}`
}

export async function createLoanRequest(data: LoanFormValues) {
  const parsed = loanSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  const pd = parsed.data

  try {
    const loan = await prisma.$transaction(async (tx) => {
      const loanNumber = await generateLoanNumber(tx)


      const newLoan = await tx.loan.create({
        data: {
          loanNumber,
          beneficiaryId: pd.beneficiaryId,
          loanType: pd.loanType,
          businessType: pd.loanType === "BUSINESS" ? pd.businessType : null,
          amount: pd.amount,
          purpose: pd.purpose || "",

          notes: pd.notes,
          status: "ACTIVE",
          disbursedDate: new Date(),
        }
      })
      

      // Fetch General Fund
      const generalFund = await tx.fund.findFirst({ where: { groupId: null } })
      if (!generalFund) throw new Error("General fund not found")

      // Fetch Group Funds
      const groupFunds = await tx.fund.findMany({ where: { groupId: { not: null } } })
      if (groupFunds.length === 0) throw new Error("No group funds available for allocation")

      // Calculate automatic allocations
      const amountPerGroup = Math.floor(pd.amount / groupFunds.length)
      const allocations = groupFunds.map(f => ({ fundId: f.id, amount: amountPerGroup }))
      const sum = allocations.reduce((s, a) => s + a.amount, 0)
      const diff = pd.amount - sum
      if (diff > 0) {
        allocations[allocations.length - 1].amount += diff
      }

      // Construct Ledger Entries
      const entries = [
        { fundId: generalFund.id, isCredit: true, amount: pd.amount }
      ]
      for (const alloc of allocations) {
        entries.push({ fundId: alloc.fundId, isCredit: false, amount: alloc.amount })
      }

      // Create Ledger Transaction
      await LedgerEngine.createTransaction({
        date: new Date(),
        type: "LOAN",
        referenceId: newLoan.loanNumber,
        notes: `Loan Disbursed: ${newLoan.loanNumber}`,
        entries
      }, tx)

      // Create Allocations
      await tx.fundAllocation.createMany({
        data: allocations.map(a => ({
          fundId: a.fundId,
          targetType: "LOAN",
          loanId: newLoan.id,
          amount: a.amount
        }))
      })

      return newLoan
    })

    revalidatePath("/loans")
    return { success: true, data: loan }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create loan" }
  }
}

export async function editLoanRequest(id: string, data: LoanFormValues) {
  const parsed = loanSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  const pd = parsed.data

  try {
    const loan = await prisma.loan.update({
      where: { id },
      data: {
        beneficiaryId: pd.beneficiaryId,
        loanType: pd.loanType,
        businessType: pd.loanType === "BUSINESS" ? pd.businessType : null,
        amount: pd.amount,
        purpose: pd.purpose || "",
        notes: pd.notes,
      }
    })
    revalidatePath(`/loans/${id}`)
    revalidatePath("/loans")
    return { success: true, data: loan }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update loan" }
  }
}

export async function repayLoan(loanId: string, amount: number, paymentMethod: string, referenceNumber: string) {
  return await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: { id: loanId },
      include: { allocations: true, repayments: true }
    })
    if (!loan) throw new Error("Loan not found")
    if (loan.status !== "ACTIVE" && loan.status !== "DEFAULTED") throw new Error("Loan is not active")

    const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0)
    const outstanding = loan.amount - totalRepaid

    if (amount > outstanding) throw new Error("Repayment amount exceeds outstanding balance")

    const generalFund = await tx.fund.findFirst({ where: { groupId: null } })
    if (!generalFund) throw new Error("General fund not found")

    // Repayment Logic: Pro-rata back to allocated funds
    const entries = [
      // Debit Cash (General Fund) - Asset increases
      { fundId: generalFund.id, isCredit: false, amount }
    ]

    for (const alloc of loan.allocations) {
      // ratio of allocation to total loan amount
      const ratio = alloc.amount / loan.amount
      const returnAmount = Math.round(amount * ratio)
      // Credit Group Fund - Equity increases
      entries.push({ fundId: alloc.fundId, isCredit: true, amount: returnAmount })
    }

    // Edge case: rounding errors in prorata. Adjust the last entry to make it balance perfectly.
    const totalGroupCredits = entries.slice(1).reduce((sum, e) => sum + e.amount, 0)
    if (totalGroupCredits !== amount) {
      const diff = amount - totalGroupCredits
      entries[entries.length - 1].amount += diff
    }

    const ledgerTx = await LedgerEngine.createTransaction({
      date: new Date(),
      type: "REPAYMENT",
      referenceId: loan.loanNumber,
      notes: `Repayment for Loan ${loan.loanNumber}`,
      entries
    }, tx)

    await tx.loanRepayment.create({
      data: {
        loanId,
        ledgerTransactionId: ledgerTx.id,
        amount,
        date: new Date(),
      }
    })

    // Update Loan Status if fully repaid
    if (amount === outstanding) {
      await tx.loan.update({ where: { id: loanId }, data: { status: "COMPLETED" } })
    }

    revalidatePath(`/loans/${loanId}`)
    return { success: true }
  })
}

export async function deleteLoanAction(id: string) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { repayments: true }
    })
    if (!loan) return { success: false, error: "Loan not found" }
    if (loan.repayments.length > 0) return { success: false, error: "Cannot delete a loan with existing repayments." }

    await prisma.loan.delete({ where: { id } })
    revalidatePath("/loans")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete loan" }
  }
}
