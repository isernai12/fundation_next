"use server";

import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  contributionRefundSchema,
  contributionAdjustmentSchema,
  type ContributionRefundFormValues,
  type ContributionAdjustmentFormValues,
} from "./schema";
import { membersApi, duesApi } from "@/lib/api";

export type ContributionLedgerItem = {
  id: string;
  paymentDate: string;
  receiptNo: string;
  memberId: string;
  memberDbId: string;
  memberName: string;
  mobile: string;
  contributionType: "REGULAR" | "ADDITIONAL" | "REFUND" | "ADJUSTMENT";
  debit: number;
  credit: number;
  balance: number;
  paymentMethod: string;
  collector: string;
  remarks: string;
};

export type LedgerSummaryStats = {
  totalContributions: number;
  totalRefund: number;
  totalAdjustment: number;
  currentBalance: number;
  totalTransactions: number;
};

export type ContributionLedgerQueryParams = {
  search?: string;
  from?: string;
  to?: string;
  memberId?: string;
  type?: string;
  collector?: string;
  paymentMethod?: string;
  page?: number;
  limit?: number;
};

export async function getContributionLedger(params: ContributionLedgerQueryParams) {
  if (!(await checkPermission("Fund Collection", "View"))) {
    return {
      items: [],
      summary: {
        totalContributions: 0,
        totalRefund: 0,
        totalAdjustment: 0,
        currentBalance: 0,
        totalTransactions: 0,
      },
      previousBalance: 0,
      pagination: {
        page: 1,
        limit: 15,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 15));

  return {
    items: [],
    summary: {
      totalContributions: 0,
      totalRefund: 0,
      totalAdjustment: 0,
      currentBalance: 0,
      totalTransactions: 0,
    },
    previousBalance: 0,
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function getMemberContributionLedger(
  memberId: string,
  params?: { from?: string; to?: string; page?: number; limit?: number }
) {
  await requirePermission("Fund Collection", "View");
  const session = await getAuthSession();
  const token = (session as any)?.accessToken;

  const member = await membersApi.get(memberId, token);

  return {
    member: {
      id: member.id,
      memberId: member.member_id,
      fullName: member.full_name || "General Member",
      mobile: member.mobile || "-",
      groupName: member.group_name || "General Group",
      groupCode: member.group_code || "",
      status: member.status,
    },
    items: [],
    summary: {
      previousBalance: 0,
      totalContributions: 0,
      totalRefunds: 0,
      totalAdjustments: 0,
      closingBalance: 0,
    },
    pagination: {
      page: params?.page || 1,
      limit: params?.limit || 20,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function createContributionRefund(data: ContributionRefundFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = contributionRefundSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "অবৈধ তথ্য প্রদান করা হয়েছে" };
  }

  revalidatePath("/contributions");
  revalidatePath("/contributions/ledger");
  revalidatePath(`/members/${data.memberId}`);
  return { success: true };
}

export async function createContributionAdjustment(data: ContributionAdjustmentFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = contributionAdjustmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "অবৈধ তথ্য প্রদান করা হয়েছে" };
  }

  revalidatePath("/contributions");
  revalidatePath("/contributions/ledger");
  revalidatePath(`/members/${data.memberId}`);
  return { success: true };
}

export async function getContributionLedgerFilterOptions() {
  if (!(await checkPermission("Fund Collection", "View"))) {
    return { members: [], collectors: [], paymentMethods: [] };
  }

  const session = await getAuthSession();
  const token = (session as any)?.accessToken;
  const membersRes = await membersApi.list({ page_size: 1000 }, token).catch(() => ({ items: [] }));

  return {
    members: (membersRes.items || []).map((m) => ({
      id: m.id,
      memberId: m.member_id,
      fullName: m.full_name,
    })),
    collectors: ["System Admin"],
    paymentMethods: ["CASH", "BKASH", "NAGAD", "BANK_TRANSFER"],
  };
}

export async function exportContributionLedgerCSV(params: ContributionLedgerQueryParams) {
  await requirePermission("Fund Collection", "Export");
  return "Date,Receipt No,Member ID,Member Name,Mobile,Contribution Type,Debit,Credit,Running Balance,Payment Method,Collector,Remarks\n";
}
