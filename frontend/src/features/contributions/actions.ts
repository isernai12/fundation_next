"use server";

import { prisma } from "@/lib/prisma";
import { contributionSchema, type ContributionFormValues, bulkContributionSchema, type BulkContributionFormValues } from "./schema";
import { LedgerEngine } from "@/services/ledger";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { duesApi } from "@/lib/api";

/**
 * Migration Note:
 * This file is migrated to proxy Monthly Membership Dues through the FastAPI backend
 * (/api/v1/dues) while preserving exact UI compatibility and transactional multi-month rules.
 */

async function updateMemberPaidUntil(memberId: string, tx: any) {
  const allPaid = await tx.monthlyContribution.findMany({
    where: { memberId: memberId, status: "PAID", isAdditional: false },
    select: { month: true, year: true },
  });

  if (allPaid.length > 0) {
    allPaid.sort((a: any, b: any) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    let cur = allPaid[0];
    let maxContiguous = cur;

    for (let i = 1; i < allPaid.length; i++) {
      const next = allPaid[i];
      if (
        (next.year === cur.year && next.month === cur.month + 1) ||
        (next.year === cur.year + 1 && next.month === 1 && cur.month === 12)
      ) {
        cur = next;
        maxContiguous = next;
      } else if (next.year === cur.year && next.month === cur.month) {
        continue;
      } else {
        break;
      }
    }

    await tx.member.update({
      where: { id: memberId },
      data: {
        paidUntilMonth: maxContiguous.month,
        paidUntilYear: maxContiguous.year,
      },
    });
  } else {
    await tx.member.update({
      where: { id: memberId },
      data: {
        paidUntilMonth: null,
        paidUntilYear: null,
      },
    });
  }
}

export async function createContribution(data: ContributionFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = contributionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };

  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    // Call FastAPI Dues Pay API
    const payRes = await duesApi.pay(
      {
        member_id: pd.memberId,
        from_month: pd.month,
        from_year: pd.year,
        to_month: pd.month,
        to_year: pd.year,
        amount: pd.amount,
        payment_method: pd.paymentMethod,
        date: pd.paymentDate,
        reference_number: pd.referenceNumber || null,
        notes: pd.notes || null,
      },
      token
    );

    revalidatePath("/contributions");
    revalidatePath(`/members/${pd.memberId}`);
    revalidatePath("/");
    return { success: true, count: 1, error: undefined };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "মাসিক চাঁদা প্রক্রিয়া করতে ব্যর্থ হয়েছে",
    };
  }
}

export async function createBulkContribution(data: BulkContributionFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = bulkContributionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };
  const pd = parsed.data;

  if (pd.fromYear > pd.toYear || (pd.fromYear === pd.toYear && pd.fromMonth > pd.toMonth)) {
    return { success: false, error: "শুরুর মাস শেষের মাসের চেয়ে বড় হতে পারে না" };
  }

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    // Call FastAPI Dues multi-month payment endpoint
    const payRes = await duesApi.pay(
      {
        member_id: pd.memberId,
        from_month: pd.fromMonth,
        from_year: pd.fromYear,
        to_month: pd.toMonth,
        to_year: pd.toYear,
        amount: pd.monthlyAmount,
        payment_method: pd.paymentMethod,
        date: pd.paymentDate,
        reference_number: pd.referenceNumber || null,
        notes: pd.notes || null,
      },
      token
    );

    revalidatePath("/contributions");
    revalidatePath(`/members/${pd.memberId}`);
    revalidatePath("/");
    return { success: true, count: payRes.paid_months_count, error: undefined };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "একাধিক মাসের চাঁদা প্রক্রিয়া করতে ব্যর্থ হয়েছে",
    };
  }
}

export async function getContributions() {
  if (!(await checkPermission("Fund Collection", "View"))) return [];
  return prisma.monthlyContribution.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: {
        select: { fullName: true, memberId: true, group: { select: { name: true, code: true } } },
      },
      payments: true,
    },
  });
}

export async function updateContribution(id: string, data: ContributionFormValues) {
  await requirePermission("Fund Collection", "Edit");
  const parsed = contributionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };
  const pd = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.monthlyContribution.findUnique({
        where: { id },
        include: { payments: true },
      });
      if (!contribution) throw new Error("চাঁদার তথ্য খুঁজে পাওয়া যায়নি");

      const member = await tx.member.findUnique({ where: { id: pd.memberId } });
      if (!member) throw new Error("সদস্য খুঁজে পাওয়া যায়নি");

      const updatedContribution = await tx.monthlyContribution.update({
        where: { id },
        data: {
          memberId: pd.memberId,
          month: pd.month,
          year: pd.year,
          expectedAmount: pd.amount,
          isAdditional: pd.isAdditional,
          status: pd.status,
        },
      });

      await updateMemberPaidUntil(pd.memberId, tx);

      return { success: true, memberGroupId: member.groupId, error: undefined };
    });

    if (result.success) {
      revalidatePath("/contributions");
      revalidatePath(`/members/${pd.memberId}`);
      if (result.memberGroupId) revalidatePath(`/groups/${result.memberGroupId}`);
      revalidatePath("/");
    }

    return result;
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "চাঁদা আপডেট করতে ব্যর্থ হয়েছে" };
  }
}

export async function deleteContribution(id: string) {
  await requirePermission("Fund Collection", "Delete");
  try {
    let memberId: string | null = null;
    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.monthlyContribution.findUnique({
        where: { id },
        include: { payments: true },
      });
      if (!contribution) throw new Error("চাঁদার তথ্য খুঁজে পাওয়া যায়নি");

      memberId = contribution.memberId;

      for (const payment of contribution.payments) {
        await tx.contributionPayment.delete({ where: { id: payment.id } });
        await tx.ledgerTransaction.delete({ where: { id: payment.ledgerTransactionId } });
      }

      await tx.monthlyContribution.delete({ where: { id } });

      await updateMemberPaidUntil(contribution.memberId, tx);

      return { success: true, error: undefined };
    });

    if (result.success) {
      revalidatePath("/");
      revalidatePath("/contributions");
      if (memberId) revalidatePath(`/members/${memberId}`);
    }

    return result;
  } catch (error: any) {
    return { success: false, error: error.message || "চাঁদা মুছে ফেলতে ব্যর্থ হয়েছে" };
  }
}

export async function getMemberPaidMonths(memberId: string) {
  if (!memberId) return [];
  const paid = await prisma.monthlyContribution.findMany({
    where: { memberId, status: "PAID", isAdditional: false },
    select: { month: true, year: true },
  });
  return paid.map((p) => `${p.month}-${p.year}`);
}
