"use server"
import { getNow } from "@/lib/date";

import { prisma } from "@/lib/prisma"
import { loanSchema, type LoanFormValues } from "./schema"
import { revalidatePath } from "next/cache"
import { LedgerEngine } from "@/services/ledger"
import { requirePermission, checkPermission } from "@/lib/rbac";

export async function getLoans() {
  if (!await checkPermission("Loans", "View")) return [];
  return prisma.loan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      beneficiary: { include: { member: { include: { group: true } } } },
      allocations: { include: { fund: { include: { group: true } } } },
      repayments: true,

    }
  })
}

export async function getLoan(id: string) {
  if (!await checkPermission("Loans", "View")) return null;
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
  const year = getNow().getFullYear()
  return `L-${year}-${(count + 1).toString().padStart(4, '0')}`
}

export async function createLoanRequest(data: LoanFormValues) {
    await requirePermission("Loans", "Add");
  const parsed = loanSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  const pd = parsed.data

  try {
    const loanNumber = await generateLoanNumber()
    const loan = await prisma.$transaction(async (tx) => {


      const newLoan = await tx.loan.create({
        data: {
          loanNumber,
          beneficiaryId: pd.beneficiaryId,
          loanType: pd.loanType,
          businessType: pd.loanType === "BUSINESS" ? pd.businessType : null,
          amount: pd.amount,
          remainingBalance: pd.amount,
          totalPaidAmount: 0,
          purpose: pd.purpose || "",

          installmentType: pd.installmentType,
          installmentAmount: pd.installmentAmount,
          totalInstallments: pd.totalInstallments,
          firstInstallmentDate: pd.firstInstallmentDate,
          nextDueDate: pd.firstInstallmentDate,

          notes: pd.notes,
          status: "ACTIVE",
          disbursedDate: new Date(),
        }
      })
      

      // Fetch General Fund
      const generalFund = await tx.fund.findFirst({ where: { groupId: null } })
      if (!generalFund) throw new Error("General fund not found")

      // Fetch or Create Group Funds from allocations
      const allocations = []
      for (const alloc of pd.fundAllocations) {
        // Find group fund
        let groupFund = await tx.fund.findFirst({ where: { groupId: alloc.groupId } })
        if (!groupFund) {
          const group = await tx.group.findUnique({ where: { id: alloc.groupId } })
          if (!group) throw new Error(`Group not found for ID: ${alloc.groupId}`)
          groupFund = await tx.fund.create({
            data: {
              groupId: group.id,
              name: `${group.name} Fund`,
              description: `Auto-generated fund for ${group.name}`
            }
          })
        }
        
        // Validation for insufficient balance
        // We need to know current balance of the group fund
        // Let's compute from LedgerEntry, but in a transaction it's tricky.
        // Assuming LedgerEngine calculates balance as Sum(Credit) - Sum(Debit)
        const entries = await tx.ledgerEntry.aggregate({
          where: { fundId: groupFund.id },
          _sum: {
            amount: true
          }
        })
        const credits = await tx.ledgerEntry.aggregate({ where: { fundId: groupFund.id, isCredit: true }, _sum: { amount: true } })
        const debits = await tx.ledgerEntry.aggregate({ where: { fundId: groupFund.id, isCredit: false }, _sum: { amount: true } })
        const balance = (credits._sum.amount || 0) - (debits._sum.amount || 0)
        
        if (alloc.amount > balance) {
          throw new Error(`Insufficient balance in ${groupFund.name}. Available: ${balance}, Requested: ${alloc.amount}`)
        }

        allocations.push({ fundId: groupFund.id, amount: alloc.amount })
      }

      // Construct Ledger Entries
      // Debit General Fund? No, Loan disbursement means Cash goes OUT of General Fund, which is an asset.
      // Wait, let's stick to existing logic for ledger entry:
      // In old code: General fund isCredit: true (asset down), Group Fund isCredit: false (equity down).
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
    await requirePermission("Loans", "Edit");
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
        // We only update these fields. For remainingBalance, we should probably calculate it if amount changes but keep it simple for now or forbid editing amount if repayments exist.
        installmentType: pd.installmentType,
        installmentAmount: pd.installmentAmount,
        totalInstallments: pd.totalInstallments,
        firstInstallmentDate: pd.firstInstallmentDate,
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

export async function repayLoan(
  loanId: string, 
  amount: number, 
  paymentMethod: string, 
  referenceNumber: string,
  installmentNo?: number,
  notes?: string,
  collectedBy?: string,
  paymentDate?: Date,
  receiptUrl?: string
) {
    await requirePermission("Loans", "Manage");
  try {
    await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { id: loanId },
        include: { allocations: true, repayments: true }
      })
      if (!loan) throw new Error("Loan not found")
      if (loan.status !== "ACTIVE" && loan.status !== "DEFAULTED") throw new Error("Loan is not active")

      const outstanding = loan.remainingBalance

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
        date: paymentDate || new Date(),
        type: "REPAYMENT",
        referenceId: loan.loanNumber,
        notes: notes || `Repayment for Loan ${loan.loanNumber}`,
        entries
      }, tx)

      await tx.loanRepayment.create({
        data: {
          loanId,
          ledgerTransactionId: ledgerTx.id,
          amount,
          date: paymentDate || new Date(),
          installmentNo,
          paymentMethod,
          referenceNumber,
          notes,
          collectedBy,
          receiptUrl
        }
      })

      const newRemainingBalance = loan.remainingBalance - amount
      const newTotalPaid = loan.totalPaidAmount + amount

      // Calculate next due date simply by adding a week/month depending on type (if available)
      let nextDue = loan.nextDueDate
      if (newRemainingBalance > 0 && loan.installmentType) {
        if (!nextDue) nextDue = new Date()
        if (loan.installmentType === "DAILY") nextDue = new Date(nextDue.getTime() + 24 * 60 * 60 * 1000)
        if (loan.installmentType === "WEEKLY") nextDue = new Date(nextDue.getTime() + 7 * 24 * 60 * 60 * 1000)
        if (loan.installmentType === "MONTHLY") nextDue = new Date(nextDue.setMonth(nextDue.getMonth() + 1))
      } else if (newRemainingBalance === 0) {
        nextDue = null
      }

      // Update Loan Balances and Status
      await tx.loan.update({ 
        where: { id: loanId }, 
        data: { 
          status: newRemainingBalance === 0 ? "COMPLETED" : loan.status,
          remainingBalance: newRemainingBalance,
          totalPaidAmount: newTotalPaid,
          nextDueDate: nextDue
        } 
      })
    })

    revalidatePath(`/loans/${loanId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to process repayment" }
  }
}

export async function deleteLoanAction(id: string) {
    await requirePermission("Loans", "Delete");
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
