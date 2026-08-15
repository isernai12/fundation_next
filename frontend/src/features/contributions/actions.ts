"use server";

import { contributionSchema, type ContributionFormValues, bulkContributionSchema, type BulkContributionFormValues } from "./schema";
import { revalidatePath } from "next/cache";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { duesApi } from "@/lib/api";

export async function createContribution(data: ContributionFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = contributionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };

  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    await duesApi.pay(
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

export async function getContributions(): Promise<any[]> {
  if (!(await checkPermission("Fund Collection", "View"))) return [];
  return [];
}

export async function updateContribution(id: string, data: ContributionFormValues): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Fund Collection", "Edit");
  revalidatePath("/contributions");
  return { success: true, error: undefined };
}

export async function deleteContribution(id: string): Promise<{ success: boolean; error?: string }> {
  await requirePermission("Fund Collection", "Delete");
  revalidatePath("/contributions");
  return { success: true, error: undefined };
}

export async function getMemberPaidMonths(memberId: string) {
  if (!memberId) return [];
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const summary = await duesApi.getSummary(memberId, token);
    const months = [];
    if (summary?.paid_until_year && summary?.paid_until_month) {
      for (let m = 1; m <= summary.paid_until_month; m++) {
        months.push(`${m}-${summary.paid_until_year}`);
      }
    }
    return months;
  } catch {
    return [];
  }
}
