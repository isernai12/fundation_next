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
    const groupName = creditEntry?.fund?.group?.name || "সাধারন তহবিল"

    balance += deposit

    return {
      id: tx.id,
      date: tx.date,
      reference: tx.referenceId,
      groupName,
      description: tx.notes || "অনুদান (Donation)",
      deposit,
      withdrawal: 0,
      balance
    }
  })

  return { donor, ledger }
}

export async function receiveDonation(data: {
  donorId: string,
  groupId: string,
  amount: number,
  date: string,
  remarks?: string
}) {
    await requirePermission("Donors", "Receive Installment");
  const session = await getAuthSession()
  // @ts-ignore
  const userId = session?.user?.id

  try {
    return await prisma.$transaction(async (tx) => {
      
      
      const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(data.groupId, tx)

      const ledgerTx = await LedgerEngine.createTransaction({
        date: new Date(data.date),
        type: "DONATION",
        referenceId: data.donorId,
        notes: data.remarks || "Group Donation",
        entries: [
          { fundId: generalFund.id, isCredit: false, amount: data.amount }, // Debit Cash/General
          { fundId: groupFund.id, isCredit: true, amount: data.amount }   // Credit Group Fund
        ]
      }, tx)

      revalidatePath("/donors/ledger")
      revalidatePath("/donors/donations")
      revalidatePath(`/donors/${data.donorId}`)
      revalidatePath("/")
      revalidatePath("/groups")
      revalidatePath("/groups/fund")
      revalidatePath(`/groups/${data.groupId}`)
      return { success: true }
    })
  } catch (error: any) {
    console.error("Error receiving donation:", error)
    return { success: false, error: error.message || "Failed to receive donation" }
  }
}

export type DonationTransactionItem = {
  id: string
  date: string
  voucherNo: string
  donorId: string
  donor: {
    id: string
    donorId: string
    fullName: string
    mobile: string
    address: string | null
    nationalId: string | null
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
      entries: {
        include: {
          fund: {
            include: { group: true }
          }
        }
      }
    }
  })

  const donorIds = transactions.map(tx => tx.referenceId).filter(Boolean) as string[]
  const donors = await prisma.donor.findMany({
    where: { id: { in: donorIds } }
  })
  const donorMap = new Map(donors.map(d => [d.id, d]))

  return transactions.map(tx => {
    const creditEntry = tx.entries.find(e => e.isCredit)
    const donor = tx.referenceId ? donorMap.get(tx.referenceId) || null : null
    const group = creditEntry?.fund?.group || null

    return {
      id: tx.id,
      date: tx.date.toISOString(),
      voucherNo: `VCH-${tx.id.substring(0, 8).toUpperCase()}`,
      donorId: tx.referenceId || "",
      donor: donor ? {
        id: donor.id,
        donorId: donor.donorId,
        fullName: donor.fullName,
        mobile: donor.mobile,
        address: donor.address,
        nationalId: donor.nationalId
      } : null,
      groupId: group?.id || null,
      groupName: group?.name || "সাধারন তহবিল",
      amount: creditEntry ? creditEntry.amount : 0,
      remarks: tx.notes || "",
      createdBy: tx.createdBy || "Admin",
      status: tx.status,
      createdAt: tx.createdAt.toISOString()
    }
  })
}

export async function updateDonationTransaction(transactionId: string, data: {
  donorId: string,
  groupId: string,
  amount: number,
  date: string,
  remarks?: string
}) {
    await requirePermission("Donors", "Edit");
  const session = await getAuthSession()
  // @ts-ignore
  const userId = session?.user?.id || null

  try {
    return await prisma.$transaction(async (tx) => {
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

      // Update ledger transaction
      await tx.ledgerTransaction.update({
        where: { id: transactionId },
        data: {
          date: new Date(data.date),
          referenceId: data.donorId,
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

      revalidatePath("/donors/donations")
      revalidatePath("/donors/ledger")
      if (data.donorId) revalidatePath(`/donors/${data.donorId}`)
      revalidatePath("/")
      revalidatePath("/groups")
      revalidatePath("/groups/fund")
      if (data.groupId) revalidatePath(`/groups/${data.groupId}`)
      return { success: true }
    })
  } catch (error: any) {
    console.error("Error updating donation transaction:", error)
    return { success: false, error: error.message || "Failed to update donation transaction" }
  }
}

export async function deleteDonationTransaction(transactionId: string) {
    await requirePermission("Donors", "Delete");
  try {
    return await prisma.$transaction(async (tx) => {
      const existingTx = await tx.ledgerTransaction.findUnique({
        where: { id: transactionId },
        include: { entries: { include: { fund: true } } }
      })

      if (!existingTx || existingTx.type !== "DONATION") {
        throw new Error("Donation transaction not found or invalid.")
      }

      const creditEntry = existingTx.entries.find(e => e.isCredit)
      const groupId = creditEntry?.fund?.groupId || null
      const donorId = existingTx.referenceId

      // Delete ledger entries first inside transaction
      await tx.ledgerEntry.deleteMany({
        where: { transactionId }
      })

      // Delete ledger transaction itself
      await tx.ledgerTransaction.delete({
        where: { id: transactionId }
      })

      revalidatePath("/donors/donations")
      revalidatePath("/donors/ledger")
      if (donorId) revalidatePath(`/donors/${donorId}`)
      revalidatePath("/")
      revalidatePath("/groups")
      revalidatePath("/groups/fund")
      if (groupId) revalidatePath(`/groups/${groupId}`)
      
      return { success: true }
    })
  } catch (error: any) {
    console.error("Error deleting donation transaction:", error)
    return { success: false, error: error.message || "Failed to delete donation transaction" }
  }
}


