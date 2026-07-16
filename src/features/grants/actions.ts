"use server"

import { prisma } from "@/lib/prisma"
import { grantSchema, type GrantFormValues } from "./schema"
import { LedgerEngine, LedgerEntryInput } from "@/services/ledger"
import { revalidatePath } from "next/cache"

async function generateGrantNumber() {
  const count = await prisma.grant.count()
  const year = new Date().getFullYear()
  return `GRN-${year}-${(count + 1).toString().padStart(4, '0')}`
}

export async function createGrant(data: GrantFormValues) {
  const parsed = grantSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: "Invalid data" }
  
  const pd = parsed.data

  try {
    return await prisma.$transaction(async (tx) => {
      const grantNumber = await generateGrantNumber()

      // 1. Create the Grant record
      const grant = await tx.grant.create({
        data: {
          grantNumber,
          beneficiaryId: pd.beneficiaryId,
          amount: pd.amount,
          purpose: pd.category,
          dateApproved: new Date(pd.grantDate),
          disbursedDate: new Date(pd.grantDate),
          status: "PAID", 
          notes: pd.reason,
          createdBy: pd.approvedBy, // Store approver
          // Custom mapping for missing fields from Prisma can be put into notes or similar, 
          // but we follow existing schema.
        }
      })

      // 2. Prepare Ledger Transaction
      // A Grant permanently reduces the Group Fund.
      // We need to debit the Group Equity and credit the Asset (Bank/Cash).
      // Since it's from multiple groups, we will have multiple entries.
      const ledgerEntries: LedgerEntryInput[] = []

      for (const alloc of pd.allocations) {
        const { groupFund, generalFund } = await LedgerEngine.getOrCreateFunds(alloc.groupId, tx)
        
        // Debit Group Fund (reducing equity)
        ledgerEntries.push({ fundId: groupFund.id, isCredit: false, amount: alloc.amount })
        
        // Credit General Fund (reducing cash asset)
        ledgerEntries.push({ fundId: generalFund.id, isCredit: true, amount: alloc.amount })

        // Create FundAllocation record linking the Group Fund to the Grant
        await tx.fundAllocation.create({
          data: {
            fundId: groupFund.id,
            targetType: "GRANT",
            grantId: grant.id,
            amount: alloc.amount,
          }
        })
      }

      // 3. Create the actual Ledger Transaction
      await LedgerEngine.createTransaction({
        date: new Date(pd.grantDate),
        type: "GRANT",
        referenceId: pd.referenceNumber,
        notes: pd.remarks,
        createdBy: pd.approvedBy,
        entries: ledgerEntries
      }, tx)

      revalidatePath("/grants")
      return { success: true, data: grant, error: undefined }
    })
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create grant" }
  }
}

export async function getGrants() {
  return prisma.grant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      beneficiary: {
        select: { firstName: true, lastName: true, beneficiaryId: true }
      },
      allocations: {
        include: {
          fund: {
            include: { group: { select: { name: true, code: true } } }
          }
        }
      }
    }
  })
}

export async function deleteGrant(id: string) {
  // Real implementation for delete
  try {
    const grant = await prisma.grant.findUnique({
      where: { id },
      include: { allocations: true }
    })
    
    if (!grant) return { success: false, error: "Grant not found" }
    
    // Check constraint: Cannot delete if Ledger Entry exists
    // The LedgerTransaction reference is polymorphic and could be queried, 
    // but the rules say "if Ledger Entry already exists". 
    // Since we create it synchronously in our transaction, it always exists unless we implement soft delete or reversal.
    // For now, let's just use the rule.
    return { success: false, error: "Cannot delete grant because Ledger Entries already exist. Please issue a reversal adjustment instead." }
    
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete grant" }
  }
}
