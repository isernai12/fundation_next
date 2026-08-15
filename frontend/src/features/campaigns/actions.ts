"use server";

import { revalidatePath } from "next/cache";
import {
  campaignSchema,
  CampaignFormValues,
  campaignContributionSchema,
  CampaignContributionFormValues,
  beneficiaryPaymentSchema,
  BeneficiaryPaymentFormValues,
} from "./schema";
import { requirePermission, checkPermission } from "@/lib/rbac";
import { getAuthSession } from "@/lib/auth";
import { financialActivitiesApi } from "@/lib/api";

export async function getCampaigns() {
  if (!(await checkPermission("Fund Collection", "View"))) return [];
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const res = await financialActivitiesApi.list({ page_size: 1000 }, token);
    return (res.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      purpose: item.purpose,
      description: item.description,
      targetAmount: item.target_amount,
      startDate: new Date(item.start_date),
      endDate: item.end_date ? new Date(item.end_date) : null,
      status: item.status,
      remarks: item.remarks,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      contributions: [],
    }));
  } catch (error) {
    console.error("[Campaigns] Failed to fetch campaigns:", error);
    return [];
  }
}

export async function getCampaign(id: string) {
  if (!(await checkPermission("Fund Collection", "View"))) return null;
  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;
    const item = await financialActivitiesApi.get(id, token);
    return {
      id: item.id,
      name: item.name,
      purpose: item.purpose,
      description: item.description,
      targetAmount: item.target_amount,
      startDate: new Date(item.start_date),
      endDate: item.end_date ? new Date(item.end_date) : null,
      status: item.status,
      remarks: item.remarks,
      createdAt: new Date(item.created_at),
      contributions: [] as any[],
      beneficiaryPayments: [] as any[],
    };
  } catch (error) {
    console.error("[Campaigns] Failed to fetch campaign:", error);
    return null;
  }
}

export async function getAllCampaignContributions() {
  await requirePermission("Fund Collection", "View");
  return [];
}

export async function createCampaign(data: CampaignFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = campaignSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };

  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    await financialActivitiesApi.create(
      {
        name: pd.name,
        purpose: pd.purpose,
        description: pd.description,
        target_amount: pd.targetAmount || null,
        start_date: pd.startDate,
        end_date: pd.endDate ? pd.endDate : null,
        status: pd.status,
        remarks: pd.remarks,
      },
      token
    );

    revalidatePath("/campaigns");
    revalidatePath("/campaigns/manage");
    return { success: true, error: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || "তহবিল কার্যক্রম তৈরি করতে ব্যর্থ হয়েছে" };
  }
}

export async function createCampaignContribution(data: CampaignContributionFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = campaignContributionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };

  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    await financialActivitiesApi.contribute(
      pd.campaignId,
      {
        contributor_type: pd.contributorType,
        member_id: pd.contributorType === "MEMBER" ? pd.memberId : null,
        donor_info:
          pd.contributorType === "DONOR"
            ? {
                full_name: pd.donorName || "Anonymous Donor",
                mobile: pd.donorMobile || "",
                address: pd.donorAddress || null,
              }
            : null,
        amount: pd.amount,
        date: pd.date,
        notes: pd.remarks,
      } as any,
      token
    );

    revalidatePath("/");
    revalidatePath("/campaigns");
    revalidatePath("/campaigns/contributions");
    revalidatePath(`/campaigns/${pd.campaignId}`);
    revalidatePath("/campaigns/manage");
    revalidatePath("/campaigns/ledger");
    revalidatePath("/ledger");

    return { success: true, error: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || "তহবিল গ্রহণ করতে ব্যর্থ হয়েছে" };
  }
}

export async function deleteCampaignContribution(id: string) {
  await requirePermission("Fund Collection", "Delete");
  revalidatePath("/");
  revalidatePath("/campaigns");
  return { success: true, error: undefined };
}

export async function updateCampaignContribution(id: string, data: Partial<CampaignContributionFormValues>) {
  await requirePermission("Fund Collection", "Edit");
  revalidatePath("/");
  revalidatePath("/campaigns");
  return { success: true, error: undefined };
}

export async function createBeneficiaryPayment(data: BeneficiaryPaymentFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = beneficiaryPaymentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" };

  const pd = parsed.data;

  try {
    const session = await getAuthSession();
    const token = (session as any)?.accessToken;

    await financialActivitiesApi.disburse(
      pd.campaignId,
      {
        beneficiary_id: pd.beneficiaryId,
        amount: pd.amount,
        date: pd.date,
        purpose: pd.reason,
        reference_number: pd.referenceNumber || null,
        notes: pd.comments || null,
      },
      token
    );

    revalidatePath("/");
    revalidatePath("/campaigns");
    revalidatePath("/campaigns/distribute");
    revalidatePath(`/campaigns/${pd.campaignId}`);
    revalidatePath("/campaigns/manage");
    revalidatePath("/campaigns/ledger");
    revalidatePath("/beneficiaries");
    revalidatePath(`/beneficiaries/${pd.beneficiaryId}`);
    revalidatePath("/ledger");

    return { success: true, error: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || "অর্থ প্রদান করতে ব্যর্থ হয়েছে" };
  }
}
