import { prisma } from "@/lib/prisma"

// Get all transactions for the Transaction Register
export async function getTransactions() {
  return prisma.ledgerTransaction.findMany({
    orderBy: { date: "desc" },
    include: {
      entries: {
        include: {
          fund: {
            include: {
              group: { select: { name: true, code: true } }
            }
          }
        }
      }
    }
  })
}

// Get all ledger entries for the General Ledger (flattened view)
export async function getGeneralLedgerEntries() {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { transaction: { date: "desc" } },
    include: {
      transaction: true,
      fund: {
        include: {
          group: { select: { name: true, code: true } }
        }
      }
    }
  })

  // To calculate running balance we normally need to process them chronologically.
  // Since we fetch desc for UI, calculating running balance in a stateless paginated 
  // UI is complex (usually requires DB window functions). We'll map them for the UI 
  // and handle logic in the table.
  return entries
}

// Get ledger entries for a specific group (Group Ledger)
export async function getGroupLedgerEntries(groupId: string) {
  return prisma.ledgerEntry.findMany({
    where: {
      fund: { groupId }
    },
    orderBy: { transaction: { date: "desc" } },
    include: {
      transaction: true,
      fund: true
    }
  })
}

// Get transactions for a member (derived from Contributions and Loans)
// A member does not have a direct "MemberFund" in our simplified schema,
// so we query transactions where the reference points to member activities.
export async function getMemberLedgerTransactions(memberId: string) {
  // Find contributions by member
  const contributions = await prisma.monthlyContribution.findMany({
    where: { memberId },
    select: { id: true }
  })
  
  const contributionIds = contributions.map(c => c.id)

  const payments = await prisma.contributionPayment.findMany({
    where: { monthlyContributionId: { in: contributionIds } },
    select: { ledgerTransactionId: true }
  })

  const txIds = payments.map(p => p.ledgerTransactionId)

  return prisma.ledgerTransaction.findMany({
    where: { id: { in: txIds } },
    orderBy: { date: "desc" },
    include: { entries: { include: { fund: true } } }
  })
}

// Get fund allocations
export async function getFundAllocations() {
  return prisma.fundAllocation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      fund: {
        include: { group: { select: { name: true, code: true } } }
      },
      // Note: prisma schema only defines `loanId` and `grantId` fields, no direct relation in FundAllocation for them.
      // We just have the IDs.
    }
  })
}

// Stubs for legacy references
export async function getGroupFundSummary(_groupId: string) {
  return { currentFund: 0, totalContributions: 0, totalTransactions: 0 };
}

export async function getMemberLedger(_memberId: string) {
  return [];
}
