"use server";

import { getNow } from "@/lib/date";
import { prisma } from "@/lib/prisma";
import { loanSchema, type LoanFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { loansApi } from "@/lib/api";

/**
 * Migration Note:
 * This file is migrated to proxy Qard-e-Hasana and Repayment operations through FastAPI
 * (/api/v1/loans) while maintaining full backward compatibility for the React components.
 */

export async function getLoans() {
  if (!(await checkPermission("Loans", "View"))) return [];
  return prisma.loan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      beneficiary: { include: { member: { include: { group: true } } } },
      allocations: { include: { fund: { include: { group: true } } } },
      repayments: true,
    },
  });
}

export async function getLoan(id: string) {
  if (!(await checkPermission("Loans", "View"))) return null;
  return prisma.loan.findUnique({
    where: { id },
    include: {
      beneficiary: true,
      allocations: { include: { fund: { include: { group: true } } } },
      repayments: { include: { ledgerTransaction: true }, orderBy: { date: "desc" } },
    },
  });
}

export async function createLoanRequest(data: LoanFormValues) {
  await requirePermission("Loans", "Add");
  const parsed = loanSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };
  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    const res = await loansApi.create(
      {
        beneficiary_id: pd.beneficiaryId,
        amount: pd.amount,
        purpose: pd.purpose || "",
        duration_months: pd.totalInstallments,
        installment_type: pd.installmentType,
        installment_amount: pd.installmentAmount,
        notes: pd.notes || null,
      },
      token
    );

    revalidatePath("/loans");
    return { success: true, data: res };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create loan" };
  }
}

export async function editLoanRequest(id: string, data: LoanFormValues) {
  await requirePermission("Loans", "Edit");
  const parsed = loanSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid data" };
  const pd = parsed.data;

  try {
    const loan = await prisma.loan.update({
      where: { id },
      data: {
        amount: pd.amount,
        purpose: pd.purpose || "",
        installmentType: pd.installmentType,
        installmentAmount: pd.installmentAmount,
        notes: pd.notes,
      },
    });

    revalidatePath(`/loans/${id}`);
    revalidatePath("/loans");
    return { success: true, data: loan };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update loan" };
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
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    await loansApi.repay(
      loanId,
      {
        amount,
        repayment_date: paymentDate ? paymentDate.toISOString() : new Date().toISOString(),
        payment_method: paymentMethod,
        reference_number: referenceNumber || null,
        notes: notes || null,
      },
      token
    );

    revalidatePath(`/loans/${loanId}`);
    revalidatePath("/loans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to process repayment" };
  }
}

export async function deleteLoanAction(id: string) {
  await requirePermission("Loans", "Delete");
  try {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { repayments: true },
    });
    if (!loan) return { success: false, error: "Loan not found" };
    if (loan.repayments.length > 0) return { success: false, error: "Cannot delete a loan with existing repayments." };

    await prisma.loan.delete({ where: { id } });
    revalidatePath("/loans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete loan" };
  }
}
