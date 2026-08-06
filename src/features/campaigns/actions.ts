"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { campaignSchema, CampaignFormValues, campaignContributionSchema, CampaignContributionFormValues, beneficiaryPaymentSchema, BeneficiaryPaymentFormValues } from "./schema"
// generateEntityId removed
import { LedgerEngine } from "@/services/ledger"
import { requirePermission, checkPermission } from "@/lib/rbac";

export async function getCampaigns() {
  if (!await checkPermission("Fund Collection", "View")) return [];
  return await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      contributions: true
    }
  })
}

export async function getCampaign(id: string) {
  if (!await checkPermission("Fund Collection", "View")) return null;
  return await prisma.campaign.findUnique({
    where: { id },
    include: {
      contributions: {
        include: {
          member: true,
          donor: true,
        },
        orderBy: { date: 'desc' }
      },
      beneficiaryPayments: {
        include: {
          beneficiary: true
        },
        orderBy: { date: 'desc' }
      }
    }
  })
}

export async function getAllCampaignContributions() {
    await requirePermission("Fund Collection", "View");
  return await prisma.campaignContribution.findMany({
    orderBy: { date: 'desc' },
    include: {
      campaign: true,
      member: {
        include: {
          group: true
        }
      },
      donor: true,
      ledgerTransaction: {
        include: {
          entries: {
            include: {
              fund: true
            }
          }
        }
      }
    }
  })
}

async function generateCampaignId() {
  const count = await prisma.campaign.count()
  return `CMP-${String(count + 1).padStart(4, '0')}`
}

export async function createCampaign(data: CampaignFormValues) {
    await requirePermission("Fund Collection", "Add");
  const parsed = campaignSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" }
  
  const pd = parsed.data

  try {
    const campaignId = await generateCampaignId()
    
    await prisma.campaign.create({
      data: {
        campaignId,
        name: pd.name,
        purpose: pd.purpose,
        description: pd.description,
        targetAmount: pd.targetAmount || null,
        startDate: new Date(pd.startDate),
        endDate: pd.endDate ? new Date(pd.endDate) : null,
        status: pd.status,
        remarks: pd.remarks,
      }
    })

    revalidatePath("/campaigns")
    revalidatePath("/campaigns/manage")
    return { success: true, error: undefined }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "তহবিল কার্যক্রম তৈরি করতে ব্যর্থ হয়েছে" }
  }
}

export async function createCampaignContribution(data: CampaignContributionFormValues) {
    await requirePermission("Fund Collection", "Add");
  const parsed = campaignContributionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" }
  
  const pd = parsed.data

  try {
    let campaignId: string | null = null
    const result = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.findUnique({ where: { id: pd.campaignId } })
      if (!campaign) throw new Error("তহবিল কার্যক্রম খুঁজে পাওয়া যায়নি")
      campaignId = campaign.id

      // Ensure Campaign Fund exists
      let campaignFund = await tx.fund.findFirst({ where: { name: `Campaign: ${campaign.name}` } })
      if (!campaignFund) {
        campaignFund = await tx.fund.create({ data: { name: `Campaign: ${campaign.name}`, description: `Fund for ${campaign.name}` } })
      }

      const { generalFund } = await LedgerEngine.getOrCreateFunds(null, tx)

      let referenceId = "";
      let finalDonorId = null;

      if (pd.contributorType === "MEMBER") {
        const member = await tx.member.findUnique({ where: { id: pd.memberId! } })
        if (!member) throw new Error("সদস্য খুঁজে পাওয়া যায়নি")
        referenceId = member.id
      } else {
        // Find or create donor by mobile number
        let donor = await tx.donor.findFirst({ where: { mobile: pd.donorMobile! } })
        if (!donor) {
          const count = await tx.donor.count()
          const newDonorId = `DNR-${String(count + 1).padStart(4, '0')}`
          donor = await tx.donor.create({
            data: {
              donorId: newDonorId,
              fullName: pd.donorName!,
              mobile: pd.donorMobile!,
              address: pd.donorAddress || "",
              status: "ACTIVE"
            }
          })
        }
        referenceId = donor.id
        finalDonorId = donor.id
      }

      const ledgerTx = await LedgerEngine.createTransaction({
        date: new Date(pd.date),
        type: "CAMPAIGN",
        referenceId: referenceId,
        notes: pd.remarks || `Contribution to ${campaign.name}`,
        entries: [
          { fundId: generalFund.id, isCredit: false, amount: pd.amount }, // Debit Cash
          { fundId: campaignFund.id, isCredit: true, amount: pd.amount }  // Credit Campaign Fund
        ]
      }, tx)

      await tx.campaignContribution.create({
        data: {
          campaignId: pd.campaignId,
          memberId: pd.contributorType === "MEMBER" ? pd.memberId : null,
          donorId: pd.contributorType === "DONOR" ? finalDonorId : null,
          ledgerTransactionId: ledgerTx.id,
          amount: pd.amount,
          date: new Date(pd.date),
          remarks: pd.remarks,
        }
      })

      return { success: true, error: undefined }
    })

    if (result.success) {
      revalidatePath("/")
      revalidatePath("/campaigns")
      revalidatePath("/campaigns/contributions")
      if (campaignId) revalidatePath(`/campaigns/${campaignId}`)
      revalidatePath("/campaigns/manage")
      revalidatePath("/campaigns/ledger")
      revalidatePath("/donors/ledger")
      revalidatePath("/members/ledger")
      revalidatePath("/groups/fund")
      revalidatePath("/ledger")
    }

    return result
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "তহবিল গ্রহণ করতে ব্যর্থ হয়েছে" }
  }
}

export async function deleteCampaignContribution(id: string) {
    await requirePermission("Fund Collection", "Delete");
  try {
    let campaignId: string | null = null
    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.campaignContribution.findUnique({ where: { id } })
      if (!contribution) throw new Error("অবদান খুঁজে পাওয়া যায়নি")

      campaignId = contribution.campaignId

      // This will cascade and delete LedgerEntry because LedgerTransaction is deleted
      await tx.ledgerTransaction.delete({ where: { id: contribution.ledgerTransactionId } })
      
      await tx.campaignContribution.delete({ where: { id } })

      return { success: true, error: undefined }
    })

    if (result.success) {
      revalidatePath("/")
      revalidatePath("/campaigns")
      revalidatePath("/campaigns/contributions")
      if (campaignId) revalidatePath(`/campaigns/${campaignId}`)
      revalidatePath("/campaigns/manage")
      revalidatePath("/campaigns/ledger")
      revalidatePath("/donors/ledger")
      revalidatePath("/members/ledger")
      revalidatePath("/groups/fund")
      revalidatePath("/ledger")
    }

    return result
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "মুছে ফেলতে ব্যর্থ হয়েছে" }
  }
}

export async function updateCampaignContribution(id: string, data: Partial<CampaignContributionFormValues>) {
    await requirePermission("Fund Collection", "Edit");
  try {
    let campaignId: string | null = null
    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.campaignContribution.findUnique({ where: { id }, include: { campaign: true } })
      if (!contribution) throw new Error("অবদান খুঁজে পাওয়া যায়নি")

      campaignId = contribution.campaignId
      const amount = data.amount || contribution.amount
      const date = data.date ? new Date(data.date) : contribution.date
      const remarks = data.remarks !== undefined ? data.remarks : contribution.remarks

      if (amount !== contribution.amount) {
        // Need to update ledger entries
        const generalFundId = (await LedgerEngine.getOrCreateFunds(null, tx)).generalFund.id
        const campaignFund = await tx.fund.findFirst({ where: { name: `Campaign: ${contribution.campaign.name}` } })
        
        if (campaignFund) {
          // Delete old entries
          await tx.ledgerEntry.deleteMany({ where: { transactionId: contribution.ledgerTransactionId } })
          // Create new entries
          await tx.ledgerEntry.createMany({
            data: [
              { transactionId: contribution.ledgerTransactionId, fundId: generalFundId, isCredit: false, amount },
              { transactionId: contribution.ledgerTransactionId, fundId: campaignFund.id, isCredit: true, amount }
            ]
          })
        }
      }

      await tx.ledgerTransaction.update({
        where: { id: contribution.ledgerTransactionId },
        data: { date, notes: remarks }
      })

      await tx.campaignContribution.update({
        where: { id },
        data: { amount, date, remarks }
      })

      return { success: true, error: undefined }
    })

    if (result.success) {
      revalidatePath("/")
      revalidatePath("/campaigns")
      revalidatePath("/campaigns/contributions")
      if (campaignId) revalidatePath(`/campaigns/${campaignId}`)
      revalidatePath("/campaigns/manage")
      revalidatePath("/campaigns/ledger")
      revalidatePath("/donors/ledger")
      revalidatePath("/members/ledger")
      revalidatePath("/groups/fund")
      revalidatePath("/ledger")
    }

    return result
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "আপডেট করতে ব্যর্থ হয়েছে" }
  }
}

export async function createBeneficiaryPayment(data: BeneficiaryPaymentFormValues) {
  await requirePermission("Fund Collection", "Add");
  const parsed = beneficiaryPaymentSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" }
  
  const pd = parsed.data

  try {
    let campaignId: string | null = null
    let beneficiaryId: string | null = null

    const result = await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.findUnique({ where: { id: pd.campaignId } })
      if (!campaign) throw new Error("তহবিল কার্যক্রম খুঁজে পাওয়া যায়নি")

      campaignId = campaign.id

      const beneficiary = await tx.beneficiary.findUnique({ where: { id: pd.beneficiaryId } })
      if (!beneficiary) throw new Error("সুবিধাভোগী খুঁজে পাওয়া যায়নি")

      beneficiaryId = beneficiary.id

      let campaignFund = await tx.fund.findFirst({ where: { name: `Campaign: ${campaign.name}` } })
      if (!campaignFund) {
        campaignFund = await tx.fund.create({ data: { name: `Campaign: ${campaign.name}`, description: `Fund for ${campaign.name}` } })
      }

      const { generalFund } = await LedgerEngine.getOrCreateFunds(null, tx)

      // Calculate Current Balance
      const campaignLedgerEntries = await tx.ledgerEntry.findMany({
        where: { fundId: campaignFund.id }
      })
      const currentBalance = campaignLedgerEntries.reduce((sum, entry) => sum + (entry.isCredit ? entry.amount : -entry.amount), 0)

      if (pd.amount > currentBalance) {
        throw new Error(`অপর্যাপ্ত ব্যালেন্স। বর্তমান ব্যালেন্স: ${currentBalance}`)
      }

      const ledgerTx = await LedgerEngine.createTransaction({
        date: new Date(pd.date),
        type: "CAMPAIGN_PAYMENT",
        referenceId: pd.beneficiaryId,
        notes: pd.reason,
        entries: [
          { fundId: campaignFund.id, isCredit: false, amount: pd.amount }, // Debit Campaign Fund
          { fundId: generalFund.id, isCredit: true, amount: pd.amount }  // Credit Cash
        ]
      }, tx)

      await tx.beneficiaryPayment.create({
        data: {
          campaignId: pd.campaignId,
          beneficiaryId: pd.beneficiaryId,
          ledgerTransactionId: ledgerTx.id,
          amount: pd.amount,
          date: new Date(pd.date),
          reason: pd.reason,
          referenceNumber: pd.referenceNumber,
          comments: pd.comments
        }
      })

      return { success: true, error: undefined }
    })

    if (result.success) {
      revalidatePath("/")
      revalidatePath("/campaigns")
      revalidatePath("/campaigns/distribute")
      if (campaignId) revalidatePath(`/campaigns/${campaignId}`)
      revalidatePath("/campaigns/manage")
      revalidatePath("/campaigns/ledger")
      revalidatePath("/beneficiaries")
      if (beneficiaryId) revalidatePath(`/beneficiaries/${beneficiaryId}`)
      revalidatePath("/ledger")
    }

    return result
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "অর্থ প্রদান করতে ব্যর্থ হয়েছে" }
  }
}
