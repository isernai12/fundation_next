"use server"
import { LedgerEngine } from "@/services/ledger"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getAuthSession } from "@/lib/auth"

import { z } from "zod"
import { requirePermission, checkPermission } from "@/lib/rbac";

// generateEntityId removed

export async function getDonors() {
  if (!await checkPermission("Donors", "View")) return [];
  return await prisma.donor.findMany({
    orderBy: { createdAt: "desc" }
  })
}

async function generateDonorId() {
  const count = await prisma.donor.count()
  return `DNR-${String(count + 1).padStart(4, '0')}`
}

export async function getDonor(id: string) {
  if (!await checkPermission("Donors", "View")) return null;
  return await prisma.donor.findUnique({
    where: { id },
    include: {
      documents: true
    }
  })
}

export async function createDonor(data: any) {
    await requirePermission("Donors", "Add");
  const session = await getAuthSession()
  // @ts-ignore
  const userId = session?.user?.id

  try {
    const newDonorId = await generateDonorId()

    const donor = await prisma.donor.create({
      data: {
        donorId: newDonorId,
        fullName: data.fullName,
        mobile: data.mobile,
        address: data.address || null,
        nationalId: data.nationalId || null,
        notes: data.notes || null,
        createdBy: userId,
      }
    })

    // Handle documents if provided
    if (data.documents && data.documents.length > 0) {
      for (const doc of data.documents) {
        await prisma.document.create({
          data: {
            documentNumber: `DOC-${Date.now()}-1`,
            title: doc.title,
            type: doc.type || "IMAGE",
            cloudinaryPublicId: doc.cloudinaryPublicId || "",
            secureUrl: doc.secureUrl,
            originalFilename: doc.originalFilename || "document",
            mimeType: doc.mimeType || "application/octet-stream",
            sizeBytes: doc.sizeBytes || 0,
            targetType: "DONOR",
            donorId: donor.id,
            createdBy: userId
          }
        })
      }
    }

    revalidatePath("/donors")
    revalidatePath("/donors/manage")
    return { success: true, donor }
  } catch (error: any) {
    console.error("Error creating donor:", error)
    return { success: false, error: error.message || "Failed to create donor" }
  }
}

export async function updateDonor(id: string, data: any) {
    await requirePermission("Donors", "Edit");
  const session = await getAuthSession()
  // @ts-ignore
  const userId = session?.user?.id

  try {
    const donor = await prisma.donor.update({
      where: { id },
      data: {
        fullName: data.fullName,
        mobile: data.mobile,
        address: data.address || null,
        nationalId: data.nationalId || null,
        notes: data.notes || null,
        updatedBy: userId,
      }
    })

    // Delete existing documents if new ones are uploaded to replace? Usually we append or manage separately.
    // For simplicity, we assume documents uploaded during edit are appended.
    if (data.documents && data.documents.length > 0) {
      for (const doc of data.documents) {
        await prisma.document.create({
          data: {
            documentNumber: `DOC-${Date.now()}-2`,
            title: doc.title,
            type: doc.type || "IMAGE",
            cloudinaryPublicId: doc.cloudinaryPublicId || "",
            secureUrl: doc.secureUrl,
            originalFilename: doc.originalFilename || "document",
            mimeType: doc.mimeType || "application/octet-stream",
            sizeBytes: doc.sizeBytes || 0,
            targetType: "DONOR",
            donorId: donor.id,
            createdBy: userId
          }
        })
      }
    }

    revalidatePath("/donors")
    revalidatePath(`/donors/${id}`)
    return { success: true, donor }
  } catch (error: any) {
    console.error("Error updating donor:", error)
    return { success: false, error: error.message || "Failed to update donor" }
  }
}

export async function deleteDonor(id: string) {
    await requirePermission("Donors", "Delete");
  try {
    // Check if there are any ledger entries (donations) for this donor
    const donations = await prisma.ledgerTransaction.findMany({
      where: {
        type: "DONATION",
        referenceId: id
      }
    })

    if (donations.length > 0) {
      return { success: false, error: "Cannot delete donor with existing donations." }
    }

    await prisma.donor.delete({
      where: { id }
    })
    
    revalidatePath("/donors")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete donor" }
  }
}

export async function getDonorLedger(donorId: string) {
    await requirePermission("Donors", "View");
  const donor = await prisma.donor.findUnique({
    where: { id: donorId }
  })
  if (!donor) throw new Error("Donor not found")

  // Find all donations (LedgerTransactions) linked to this donor
  const transactions = await prisma.ledgerTransaction.findMany({
    where: {
      type: "DONATION",
      referenceId: donorId,
    },
    include: {
      entries: {
        include: {
          fund: {
            include: {
              group: true
            }
          }
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  })

  let balance = 0
  const ledger = transactions.map(tx => {
    // Only look at the credit entry to identify the fund/group
    const creditEntry = tx.entries.find(e => e.isCredit)
    const deposit = creditEntry ? creditEntry.amount : 0
    const groupName = creditEntry?.fund?.group?.name || "General Fund"

    balance += deposit

    return {
      id: tx.id,
      date: tx.date,
      reference: tx.referenceId,
      groupName,
      description: tx.notes || "Donation",
      deposit,
      withdrawal: 0,
      balance
    }
  })

  return { donor, ledger }
}

export async function receiveDonation(data: {
  sourceType?: "MEMBER" | "DONOR",
  donorId?: string | null,
  memberId?: string | null,
  groupId: string,
  amount: number,
  date: string,
  remarks?: string
}) {
  await requirePermission("Donors", "Receive Installment");
  const session = await getAuthSession()
  const token = (session as any)?.accessToken;

  const sourceType = data.sourceType || (data.memberId ? "MEMBER" : "DONOR");
  let finalMemberId: string | null = null;
  let finalDonorId: string | null = null;

  if (sourceType === "MEMBER") {
    if (!data.memberId || data.memberId.trim() === "") {
      return { success: false, error: "Foundation Member is required." }
    }
    finalMemberId = data.memberId;
  } else if (sourceType === "DONOR") {
    if (!data.donorId || data.donorId.trim() === "") {
      return { success: false, error: "External Donor is required." }
    }
    finalDonorId = data.donorId;
  } else {
    return { success: false, error: "Invalid donation source type." }
  }

  // Strict validation: never allow both or neither
  if ((finalMemberId && finalDonorId) || (!finalMemberId && !finalDonorId)) {
    return { success: false, error: "Donation must belong to either a Member or a Donor, not both or neither." }
  }

  try {
    const { groupFund } = await LedgerEngine.getOrCreateFunds(data.groupId, prisma);

    // Call FastAPI sadaqah receipt endpoint
    const { sadaqahApi } = await import("@/lib/api");
    await sadaqahApi.receive({
      contributor_type: sourceType === "MEMBER" ? "MEMBER" : "EXTERNAL",
      member_id: finalMemberId,
      donor_id: finalDonorId,
      fund_id: groupFund.id,
      amount: data.amount,
      date: data.date,
      notes: data.remarks || "Group Donation",
    }, token);

    revalidatePath("/donors/ledger")
    revalidatePath("/donors/donations")
    if (finalDonorId) revalidatePath(`/donors/${finalDonorId}`)
    if (finalMemberId) {
      revalidatePath(`/members/${finalMemberId}`)
      revalidatePath("/members/manage")
    }
    revalidatePath("/")
    revalidatePath("/groups")
    revalidatePath("/groups/fund")
    revalidatePath(`/groups/${data.groupId}`)

    return { success: true }
  } catch (error: any) {
    console.error("Error receiving donation via FastAPI:", error)
    return { success: false, error: error.message || "Failed to receive donation" }
  }
}

export type DonationTransactionItem = {
  id: string
  date: string
  voucherNo: string
  sourceType: "MEMBER" | "DONOR"
  donorId: string | null
  donor: {
    id: string
    donorId: string
    fullName: string
    mobile: string
    address: string | null
    nationalId: string | null
  } | null
  memberId: string | null
  member: {
    id: string
    memberId: string
    fullName: string | null
    mobile: string | null
    groupName?: string | null
  } | null
  groupId: string | null
  groupName: string
  amount: number
  remarks: string
  createdBy: string
  status: string
  createdAt: string
}

export async function getReceivedDonations(): Promise<DonationTransactionItem[]> {
  await requirePermission("Donors", "View");
  const transactions = await prisma.ledgerTransaction.findMany({
    where: { type: "DONATION" },
    orderBy: { date: "desc" },
    include: {
      member: {
        include: { group: true }
      },
      donor: true,
      entries: {
        include: {
          fund: {
            include: { group: true }
          }
        }
      }
    }
  })

  // Handle legacy records where memberId/donorId in tx might be null, but referenceId exists
  const legacyRefIds = transactions.filter(tx => !tx.memberId && !tx.donorId && tx.referenceId).map(tx => tx.referenceId!)
  const [legacyDonors, legacyMembers] = legacyRefIds.length > 0 ? await Promise.all([
    prisma.donor.findMany({ where: { id: { in: legacyRefIds } } }),
    prisma.member.findMany({ where: { id: { in: legacyRefIds } }, include: { group: true } })
  ]) : [[], []]

  const donorMap = new Map(legacyDonors.map(d => [d.id, d]))
  const memberMap = new Map(legacyMembers.map(m => [m.id, m]))

  return transactions.map(tx => {
    const creditEntry = tx.entries.find(e => e.isCredit)
    const group = creditEntry?.fund?.group || null

    let sourceType: "MEMBER" | "DONOR" = "DONOR"
    let donor = tx.donor ? {
      id: tx.donor.id,
      donorId: tx.donor.donorId,
      fullName: tx.donor.fullName,
      mobile: tx.donor.mobile,
      address: tx.donor.address,
      nationalId: tx.donor.nationalId
    } : null

    let member = tx.member ? {
      id: tx.member.id,
      memberId: tx.member.memberId,
      fullName: tx.member.fullName,
      mobile: tx.member.mobile,
      groupName: tx.member.group?.name || null
    } : null

    if (tx.memberId || tx.member) {
      sourceType = "MEMBER"
    } else if (!tx.donorId && !tx.donor && tx.referenceId) {
      const legM = memberMap.get(tx.referenceId)
      if (legM) {
        sourceType = "MEMBER"
        member = {
          id: legM.id,
          memberId: legM.memberId,
          fullName: legM.fullName,
          mobile: legM.mobile,
          groupName: legM.group?.name || null
        }
      } else {
        const legD = donorMap.get(tx.referenceId)
        if (legD) {
          donor = {
            id: legD.id,
            donorId: legD.donorId,
            fullName: legD.fullName,
            mobile: legD.mobile,
            address: legD.address,
            nationalId: legD.nationalId
          }
        }
      }
    }

    return {
      id: tx.id,
      date: tx.date.toISOString(),
      voucherNo: `VCH-${tx.id.substring(0, 8).toUpperCase()}`,
      sourceType,
      donorId: tx.donorId || (sourceType === "DONOR" ? (donor?.id || tx.referenceId || null) : null),
      donor,
      memberId: tx.memberId || (sourceType === "MEMBER" ? (member?.id || tx.referenceId || null) : null),
      member,
      groupId: group?.id || null,
      groupName: group?.name || "General Fund",
      amount: creditEntry ? creditEntry.amount : 0,
      remarks: tx.notes || "",
      createdBy: tx.createdBy || "Admin",
      status: tx.status,
      createdAt: tx.createdAt.toISOString()
    }
  })
}

export async function updateDonationTransaction(transactionId: string, data: {
  sourceType?: "MEMBER" | "DONOR",
  donorId?: string | null,
  memberId?: string | null,
  groupId: string,
  amount: number,
  date: string,
  remarks?: string
}) {
  await requirePermission("Donors", "Edit");
  const session = await getAuthSession()
  // @ts-ignore
  const userId = session?.user?.id || null

  const sourceType = data.sourceType || (data.memberId ? "MEMBER" : "DONOR");
  let finalMemberId: string | null = null;
  let finalDonorId: string | null = null;

  if (sourceType === "MEMBER") {
    if (!data.memberId || data.memberId.trim() === "") {
      return { success: false, error: "Foundation Member is required." }
    }
    finalMemberId = data.memberId;
  } else if (sourceType === "DONOR") {
    if (!data.donorId || data.donorId.trim() === "") {
      return { success: false, error: "External Donor is required." }
    }
    finalDonorId = data.donorId;
  } else {
    return { success: false, error: "Invalid donation source type." }
  }

  if ((finalMemberId && finalDonorId) || (!finalMemberId && !finalDonorId)) {
    return { success: false, error: "Donation must belong to either a Member or a Donor, not both or neither." }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingTx = await tx.ledgerTransaction.findUnique({
        where: { id: transactionId },
        include: { entries: true }
      })

      if (!existingTx || existingTx.type !== "DONATION") {
        throw new Error("Donation transaction not found or invalid type.")
      }

      const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(data.groupId, tx)
      const group = await tx.group.findUnique({ where: { id: data.groupId } })

      // Remove previous entries
      await tx.ledgerEntry.deleteMany({
        where: { transactionId }
      })

      const refId = finalMemberId || finalDonorId!

      // Update ledger transaction
      await tx.ledgerTransaction.update({
        where: { id: transactionId },
        data: {
          date: new Date(data.date),
          referenceId: refId,
          memberId: finalMemberId,
          donorId: finalDonorId,
          notes: data.remarks || "Group Donation",
          updatedBy: userId,
        }
      })

      // Re-create balanced double entries inside the same transaction
      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId,
            fundId: generalFund.id,
            isCredit: false,
            amount: Number(data.amount),
            createdBy: userId,
            groupId: null,
            groupCode: null,
            groupName: null
          },
          {
            transactionId,
            fundId: groupFund.id,
            isCredit: true,
            amount: Number(data.amount),
            createdBy: userId,
            groupId: group?.id || null,
            groupCode: group?.code || null,
            groupName: group?.name || null
          }
        ]
      })

      return { success: true }
    })

    if (result.success) {
      revalidatePath("/donors/donations")
      revalidatePath("/donors/ledger")
      if (finalDonorId) revalidatePath(`/donors/${finalDonorId}`)
      if (finalMemberId) {
        revalidatePath(`/members/${finalMemberId}`)
        revalidatePath("/members/manage")
      }
      revalidatePath("/")
      revalidatePath("/groups")
      revalidatePath("/groups/fund")
      if (data.groupId) revalidatePath(`/groups/${data.groupId}`)
    }

    return result
  } catch (error: any) {
    console.error("Error updating donation transaction:", error)
    return { success: false, error: error.message || "Failed to update donation transaction" }
  }
}

export async function deleteDonationTransaction(transactionId: string) {
  await requirePermission("Donors", "Delete");
  try {
    let groupId: string | null = null
    let donorId: string | null = null
    let memberId: string | null = null

    const result = await prisma.$transaction(async (tx) => {
      const existingTx = await tx.ledgerTransaction.findUnique({
        where: { id: transactionId },
        include: { entries: { include: { fund: true } } }
      })

      if (!existingTx || existingTx.type !== "DONATION") {
        throw new Error("Donation transaction not found or invalid.")
      }

      const creditEntry = existingTx.entries.find(e => e.isCredit)
      groupId = creditEntry?.fund?.groupId || null
      donorId = existingTx.donorId || existingTx.referenceId
      memberId = existingTx.memberId

      // Delete ledger entries first inside transaction
      await tx.ledgerEntry.deleteMany({
        where: { transactionId }
      })

      // Delete ledger transaction itself
      await tx.ledgerTransaction.delete({
        where: { id: transactionId }
      })
      
      return { success: true }
    })

    if (result.success) {
      revalidatePath("/donors/donations")
      revalidatePath("/donors/ledger")
      if (donorId) revalidatePath(`/donors/${donorId}`)
      if (memberId) revalidatePath(`/members/${memberId}`)
      revalidatePath("/")
      revalidatePath("/groups")
      revalidatePath("/groups/fund")
      if (groupId) revalidatePath(`/groups/${groupId}`)
    }

    return result
  } catch (error: any) {
    console.error("Error deleting donation transaction:", error)
    return { success: false, error: error.message || "Failed to delete donation transaction" }
  }
}

export async function getMemberDonations(memberId: string) {
  if (!await checkPermission("Members", "View")) return [];
  const transactions = await prisma.ledgerTransaction.findMany({
    where: {
      type: "DONATION",
      OR: [
        { memberId },
        { referenceId: memberId }
      ]
    },
    include: {
      entries: {
        include: {
          fund: {
            include: { group: true }
          }
        }
      }
    },
    orderBy: { date: "desc" }
  })

  return transactions.map(tx => {
    const creditEntry = tx.entries.find(e => e.isCredit)
    const groupName = creditEntry?.fund?.group?.name || "General Fund"
    return {
      id: tx.id,
      date: tx.date.toISOString(),
      voucherNo: `VCH-${tx.id.substring(0, 8).toUpperCase()}`,
      groupName,
      amount: creditEntry ? creditEntry.amount : 0,
      remarks: tx.notes || "",
    }
  })
}



