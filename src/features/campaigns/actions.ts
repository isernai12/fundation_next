"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { campaignSchema, CampaignFormValues, campaignContributionSchema, CampaignContributionFormValues } from "./schema"
// generateEntityId removed
import { LedgerEngine } from "@/services/ledger"

export async function getCampaigns() {
  return await prisma.campaign.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      contributions: true
    }
  })
}

export async function getCampaign(id: string) {
  return await prisma.campaign.findUnique({
    where: { id },
    include: {
      contributions: {
        include: {
          member: true,
          donor: true,
        },
        orderBy: { date: 'desc' }
      }
    }
  })
}

export async function getAllCampaignContributions() {
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
  const parsed = campaignContributionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "ভুল তথ্য প্রদান করা হয়েছে" }
  
  const pd = parsed.data

  try {
    return await prisma.$transaction(async (tx) => {
      const campaign = await tx.campaign.findUnique({ where: { id: pd.campaignId } })
      if (!campaign) throw new Error("তহবিল কার্যক্রম খুঁজে পাওয়া যায়নি")

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

      revalidatePath("/")
      revalidatePath("/campaigns")
      revalidatePath("/campaigns/contributions")
      revalidatePath(`/campaigns/${campaign.id}`)
      revalidatePath("/campaigns/manage")
      revalidatePath("/campaigns/ledger")
      revalidatePath("/donors/ledger")
      revalidatePath("/members/ledger")
      revalidatePath("/groups/fund")
      revalidatePath("/ledger")
      return { success: true, error: undefined }
    })
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "তহবিল গ্রহণ করতে ব্যর্থ হয়েছে" }
  }
}

export async function deleteCampaignContribution(id: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const contribution = await tx.campaignContribution.findUnique({ where: { id } })
      if (!contribution) throw new Error("অবদান খুঁজে পাওয়া যায়নি")

      // This will cascade and delete LedgerEntry because LedgerTransaction is deleted
      await tx.ledgerTransaction.delete({ where: { id: contribution.ledgerTransactionId } })
      
      await tx.campaignContribution.delete({ where: { id } })

      revalidatePath("/")
      revalidatePath("/campaigns")
      revalidatePath("/campaigns/contributions")
      revalidatePath(`/campaigns/${contribution.campaignId}`)
      revalidatePath("/campaigns/manage")
      revalidatePath("/campaigns/ledger")
      revalidatePath("/donors/ledger")
      revalidatePath("/members/ledger")
      revalidatePath("/groups/fund")
      revalidatePath("/ledger")
      return { success: true, error: undefined }
    })
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "মুছে ফেলতে ব্যর্থ হয়েছে" }
  }
}

export async function updateCampaignContribution(id: string, data: Partial<CampaignContributionFormValues>) {
  try {
    return await prisma.$transaction(async (tx) => {
      const contribution = await tx.campaignContribution.findUnique({ where: { id }, include: { campaign: true } })
      if (!contribution) throw new Error("অবদান খুঁজে পাওয়া যায়নি")

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

      revalidatePath("/")
      revalidatePath("/campaigns")
      revalidatePath("/campaigns/contributions")
      revalidatePath(`/campaigns/${contribution.campaignId}`)
      revalidatePath("/campaigns/manage")
      revalidatePath("/campaigns/ledger")
      revalidatePath("/donors/ledger")
      revalidatePath("/members/ledger")
      revalidatePath("/groups/fund")
      revalidatePath("/ledger")
      return { success: true, error: undefined }
    })
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "আপডেট করতে ব্যর্থ হয়েছে" }
  }
}
