"use server";

import { loanSchema, type LoanFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { loansApi } from "@/lib/api";

export async function getLoans(): Promise<any[]> {
  if (!(await checkPermission("Loans", "View"))) return [];
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const res = await loansApi.list({ page_size: 1000 }, token);
    return (res.items || []).map((l) => ({
      id: l.id,
      loanId: l.loan_id,
      loanNumber: l.loan_id,
      amount: l.amount,
      balance: l.remaining_balance,
      remainingBalance: l.remaining_balance,
      totalPaidAmount: l.total_repaid,
      totalRepaid: l.total_repaid,
      purpose: l.purpose,
      loanType: "BUSINESS",
      businessType: "",
      installmentType: l.installment_type || "MONTHLY",
      installmentAmount: l.installment_amount || 0,
      totalInstallments: l.duration_months || 12,
      status: l.status,
      notes: l.notes,
      disbursementDate: new Date(l.disbursement_date),
      firstInstallmentDate: new Date(l.disbursement_date),
      nextDueDate: l.repayment_deadline ? new Date(l.repayment_deadline) : null,
      lastPaymentDate: null,
      createdAt: new Date(l.created_at),
      beneficiary: {
        id: l.beneficiary_id,
        name: l.beneficiary_name || "Beneficiary",
        fullName: l.beneficiary_name || "Beneficiary",
      },
      documents: [] as any[],
      repayments: [] as any[],
      allocations: [] as any[],
    }));
  } catch (error) {
    console.error("[Loans] Failed to fetch loans:", error);
    return [];
  }
}

export async function getLoan(id: string): Promise<any> {
  if (!(await checkPermission("Loans", "View"))) return null;
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const l = await loansApi.get(id, token);
    return {
      id: l.id,
      loanId: l.loan_id,
      loanNumber: l.loan_id,
      amount: l.amount,
      balance: l.remaining_balance,
      remainingBalance: l.remaining_balance,
      totalPaidAmount: l.total_repaid,
      totalRepaid: l.total_repaid,
      purpose: l.purpose,
      loanType: "BUSINESS",
      businessType: "",
      installmentType: l.installment_type || "MONTHLY",
      installmentAmount: l.installment_amount || 0,
      totalInstallments: l.duration_months || 12,
      status: l.status,
      notes: l.notes,
      disbursementDate: new Date(l.disbursement_date),
      firstInstallmentDate: new Date(l.disbursement_date),
      nextDueDate: l.repayment_deadline ? new Date(l.repayment_deadline) : null,
      lastPaymentDate: null,
      createdAt: new Date(l.created_at),
      beneficiary: {
        id: l.beneficiary_id,
        name: l.beneficiary_name || "Beneficiary",
        fullName: l.beneficiary_name || "Beneficiary",
      },
      documents: [] as any[],
      repayments: [] as any[],
      allocations: [] as any[],
    };
  } catch (error) {
    console.error("[Loans] Failed to fetch loan:", error);
    return null;
  }
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

  revalidatePath(`/loans/${id}`);
  revalidatePath("/loans");
  return { success: true };
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

export async function deleteLoanAction(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Loans", "Delete");
  revalidatePath("/loans");
  return { success: true, error: undefined };
}

export async function deleteLoanDocument(loanId: string, title: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Loans", "Delete");
  revalidatePath(`/loans/${loanId}`);
  revalidatePath(`/loans/${loanId}/edit`);
  return { success: true, error: undefined };
}
