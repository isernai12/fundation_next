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
    }
  })
}

export async function getLoan(id: string) {
  return prisma.loan.findUnique({
    where: { id },
    include: {
      beneficiary: true,
      allocations: { include: { fund: { include: { group: true } } } },
      installments: { orderBy: { dueDate: 'asc' } },
      repayments: { include: { ledgerTransaction: true }, orderBy: { date: 'desc' } }
    }
  })
}

async function generateLoanNumber() {
  const count = await prisma.loan.count()
  const year = new Date().getFullYear()
  return `L-${year}-${(count + 1).toString().padStart(4, '0')}`
}

export async function createLoanRequest(data: LoanFormValues) {
  const parsed = loanSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  const pd = parsed.data

  const loanNumber = await generateLoanNumber()
  const installmentAmount = Math.floor(pd.amount / pd.installmentCount) // Simple division for zero interest

  try {
    const loan = await prisma.loan.create({
      data: {
        loanNumber,
        beneficiaryId: pd.beneficiaryId,
        amount: pd.amount,
        purpose: pd.purpose,
        installmentCount: pd.installmentCount,
        installmentAmount,
        notes: pd.notes,
        status: "PENDING",
      }
    })
    
    // Create Installment Schedule (Draft)
    const installments = Array.from({ length: pd.installmentCount }).map((_, i) => {
      const dueDate = new Date()
      dueDate.setMonth(dueDate.getMonth() + i + 1)
      return {
        loanId: loan.id,
        amount: (i === pd.installmentCount - 1) ? (pd.amount - (installmentAmount * (pd.installmentCount - 1))) : installmentAmount,
        dueDate,
      }
    })
    
    await prisma.loanInstallment.createMany({ data: installments })

    revalidatePath("/loans")
    return { success: true, data: loan }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create loan" }
  }
}

export async function approveLoan(id: string) {
  await prisma.loan.update({
    where: { id },
    data: { status: "APPROVED", dateApproved: new Date() }
  })
  revalidatePath(`/loans/${id}`)
  revalidatePath("/loans")
  return { success: true }
}

export async function disburseLoan(id: string, allocations: { fundId: string; amount: number }[]) {
  return await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({ where: { id } })
    if (!loan) throw new Error("Loan not found")
    if (loan.status !== "APPROVED") throw new Error("Loan must be approved before disbursement")

    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0)
    if (totalAllocated !== loan.amount) throw new Error("Total allocations must exactly match the loan amount")

    // Fetch General Fund
    const generalFund = await tx.fund.findFirst({ where: { groupId: null } })
    if (!generalFund) throw new Error("General fund not found")

    // Construct Ledger Entries
    const entries = [
      // Credit Cash (General Fund) - Asset reduction
      { fundId: generalFund.id, isCredit: true, amount: loan.amount }
    ]

    // Debit Group Funds - Equity reduction
    for (const alloc of allocations) {
      entries.push({ fundId: alloc.fundId, isCredit: false, amount: alloc.amount })
    }

    // Create Ledger Transaction
    const ledgerTx = await LedgerEngine.createTransaction({
      date: new Date(),
      type: "LOAN",
      referenceId: loan.loanNumber,
      notes: `Disbursement for Loan ${loan.loanNumber}`,
      entries
    }, tx)

    // Create Allocations
    await tx.fundAllocation.createMany({
      data: allocations.map(a => ({
        fundId: a.fundId,
        targetType: "LOAN",
        loanId: loan.id,
        amount: a.amount
      }))
    })

    // Update Loan Status
    await tx.loan.update({
      where: { id },
      data: { status: "ACTIVE", disbursedDate: new Date() }
    })

    revalidatePath(`/loans/${id}`)
    revalidatePath("/loans")
    return { success: true }
  })
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
