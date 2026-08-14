"use server";

import { prisma } from "@/lib/prisma";
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

/**
 * Migration Note:
 * This file is migrated to proxy Financial Activity / Campaign operations through FastAPI
 * (/api/v1/financial-activities) while maintaining full backward compatibility for the React components.
 */

export async function getCampaigns() {
  if (!(await checkPermission("Fund Collection", "View"))) return [];
  return await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      contributions: true,
    },
  });
}

export async function getCampaign(id: string) {
  if (!(await checkPermission("Fund Collection", "View"))) return null;
  return await prisma.campaign.findUnique({
    where: { id },
    include: {
      contributions: {
        include: {
          member: true,
          donor: true,
        },
        orderBy: { date: "desc" },
      },
      beneficiaryPayments: {
        include: {
          beneficiary: true,
        },
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function getAllCampaignContributions() {
  await requirePermission("Fund Collection", "View");
  return await prisma.campaignContribution.findMany({
    orderBy: { date: "desc" },
    include: {
      campaign: true,
      member: {
        include: {
          group: true,
        },
      },
      donor: true,
      ledgerTransaction: {
        include: {
          entries: {
            include: {
              fund: true,
            },
          },
        },
      },
    },
  });
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
        remarks: pd.remarks,
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
  try {
    let campaignId: string | null = null;
    await prisma.$transaction(async (tx) => {
      const contribution = await tx.campaignContribution.findUnique({ where: { id } });
      if (!contribution) throw new Error("অবদান খুঁজে পাওয়া যায়নি");

      campaignId = contribution.campaignId;

      await tx.ledgerTransaction.delete({ where: { id: contribution.ledgerTransactionId } });
      await tx.campaignContribution.delete({ where: { id } });
    });

    revalidatePath("/");
    revalidatePath("/campaigns");
    revalidatePath("/campaigns/contributions");
    if (campaignId) revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath("/campaigns/manage");
    revalidatePath("/campaigns/ledger");
    revalidatePath("/ledger");

    return { success: true, error: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || "মুছে ফেলতে ব্যর্থ হয়েছে" };
  }
}

export async function updateCampaignContribution(id: string, data: Partial<CampaignContributionFormValues>) {
  await requirePermission("Fund Collection", "Edit");
  try {
    let campaignId: string | null = null;
    await prisma.$transaction(async (tx) => {
      const contribution = await tx.campaignContribution.findUnique({ where: { id }, include: { campaign: true } });
      if (!contribution) throw new Error("অবদান খুঁজে পাওয়া যায়নি");

      campaignId = contribution.campaignId;
      const amount = data.amount || contribution.amount;
      const date = data.date ? new Date(data.date) : contribution.date;
      const remarks = data.remarks !== undefined ? data.remarks : contribution.remarks;

      await tx.ledgerTransaction.update({
        where: { id: contribution.ledgerTransactionId },
        data: { date, notes: remarks },
      });

      await tx.campaignContribution.update({
        where: { id },
        data: { amount, date, remarks },
      });
    });

    revalidatePath("/");
    revalidatePath("/campaigns");
    revalidatePath("/campaigns/contributions");
    if (campaignId) revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath("/campaigns/manage");
    revalidatePath("/campaigns/ledger");
    revalidatePath("/ledger");

    return { success: true, error: undefined };
  } catch (error: any) {
    return { success: false, error: error.message || "আপডেট করতে ব্যর্থ হয়েছে" };
  }
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
