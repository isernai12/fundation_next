"use server"

import { prisma } from "@/lib/prisma"

export async function getMemberLedger(memberId: string) {
  // To get a member's ledger, we look at their contributions (and future loans/grants).
  // For now, it's contributions.
  // The ledger engine stores general entries by fundId. 
  // However, member-specific view should combine `MonthlyContribution` -> `ContributionPayment` -> `LedgerTransaction`
  const payments = await prisma.contributionPayment.findMany({
    where: {
      monthlyContribution: { memberId }
    },
    include: {
      ledgerTransaction: {
        include: {
          entries: {
            include: { fund: true }
          }
        }
      },
      monthlyContribution: true
    },
    orderBy: { paymentDate: 'desc' }
  })

  // Format into a unified ledger view
  return payments.map(p => ({
    id: p.ledgerTransactionId,
    date: p.paymentDate,
    type: p.ledgerTransaction.type,
    amount: p.amount,
    reference: p.referenceNumber || p.ledgerTransaction.referenceId,
    notes: p.notes || p.ledgerTransaction.notes,
    details: `Contribution for ${p.monthlyContribution.month}/${p.monthlyContribution.year}`
  }))
}

export async function getGroupFundSummary(groupId: string) {
  // Find the group's fund
  const fund = await prisma.fund.findFirst({
    where: { groupId },
    include: {
      ledgerLines: true
    }
  })

  if (!fund) return { totalContributions: 0, currentFund: 0, totalTransactions: 0 }

  const totalTransactions = fund.ledgerLines.length
  
  // Current Fund Balance = Sum of Credits - Sum of Debits (for Equity/Fund accounts)
  // or Sum of Debits - Sum of Credits (for Asset accounts)
  // Since Group Fund is an Equity account, it increases on Credit.
  const currentFund = fund.ledgerLines.reduce((acc, line) => {
    return acc + (line.isCredit ? line.amount : -line.amount)
  }, 0)

  // Total Contributions is just sum of credits for type CONTRIBUTION
  // (Assuming no refunds for now)
  // Since we don't have transaction type directly on line, we could query via transaction relation,
  // but for now, since it's just contributions, it's the currentFund.
  return {
    totalContributions: currentFund,
    currentFund,
    totalTransactions
  }
}

export async function getFoundationFundSummary() {
  const generalFund = await prisma.fund.findFirst({
    where: { groupId: null },
    include: { ledgerLines: true }
  })

  // General Fund is Asset (Cash). Increases on Debit.
  const totalActiveFunds = generalFund ? generalFund.ledgerLines.reduce((acc, line) => {
    return acc + (!line.isCredit ? line.amount : -line.amount)
  }, 0) : 0

  const totalMembers = await prisma.member.count({ where: { status: "ACTIVE" } })
  const totalGroups = await prisma.group.count({ where: { status: "ACTIVE" } })

  return {
    totalContributions: totalActiveFunds,
    totalActiveFunds,
    totalMembers,
    totalGroups
  }
}
