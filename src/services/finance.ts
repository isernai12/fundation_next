import { prisma } from "@/lib/prisma"

export class FinancialService {
  /**
   * Calculates the financial summary for a specific group fund.
   */
  static async getGroupFundSummary(groupId: string) {
    if (!groupId) return null

    const groupFund = await prisma.fund.findFirst({
      where: { groupId }
    })

    const memberCount = await prisma.member.count({
      where: { groupId, status: "ACTIVE" }
    })

    if (!groupFund) {
      return {
        currentBalance: 0,
        totalFund: 0,
        totalContributions: 0,
        totalDonations: 0,
        totalLoans: 0,
        totalLoanReturns: 0,
        totalGrants: 0,
        totalExpenses: 0,
        memberCount,
        totalTransactions: 0
      }
    }

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { fundId: groupFund.id },
      include: { transaction: true }
    })

    let totalContributions = 0
    let totalDonations = 0
    let totalLoans = 0
    let totalLoanReturns = 0
    let totalGrants = 0
    let totalExpenses = 0
    
    let totalCredits = 0
    let totalDebits = 0

    for (const entry of ledgerEntries) {
      const txType = entry.transaction.type
      
      if (entry.isCredit) {
        totalCredits += entry.amount
        if (txType === "CONTRIBUTION") totalContributions += entry.amount
        if (txType === "REPAYMENT") totalLoanReturns += entry.amount
        if (txType === "DONATION") totalDonations += entry.amount
      } else {
        totalDebits += entry.amount
        if (txType === "LOAN") totalLoans += entry.amount
        if (txType === "GRANT") totalGrants += entry.amount
        if (txType === ("EXPENSE" as any)) totalExpenses += entry.amount
      }
    }

    // Total Fund = Total Contributions + Total Donations + Other Income
    const totalFund = totalContributions + totalDonations

    // Current Balance = Total Fund - Grants - Expenses - Other Outgoing Transactions
    const currentBalance = totalFund - totalGrants - totalExpenses - totalLoans + totalLoanReturns

    const uniqueTransactions = new Set(ledgerEntries.map(e => e.transactionId)).size

    return {
      currentBalance,
      totalFund,
      totalContributions,
      totalDonations,
      totalLoans,
      totalLoanReturns,
      totalGrants,
      totalExpenses,
      memberCount,
      totalTransactions: uniqueTransactions,
    }
  }

  /**
   * Gets the general foundation fund (Cash) summary.
   */
  static async getFoundationSummary() {
    const generalFund = await prisma.fund.findFirst({
      where: { groupId: null }
    })

    if (!generalFund) return { cashBalance: 0 }

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { fundId: generalFund.id }
    })

    let cashBalance = 0
    for (const entry of ledgerEntries) {
      // General fund acts as Cash Asset: Debit increases, Credit decreases
      if (!entry.isCredit) cashBalance += entry.amount
      else cashBalance -= entry.amount
    }

    return { cashBalance }
  }

  /**
   * Retrieves aggregated summaries for all groups to use in Dashboards.
   */
  static async getAllGroupSummaries() {
    const groups = await prisma.group.findMany({
      include: {
        funds: { select: { id: true } }
      }
    })

    const groupFunds = groups.map(g => ({
      groupId: g.id,
      groupName: g.name,
      fundId: g.funds[0]?.id || null
    })).filter(g => g.fundId)

    const fundIds = groupFunds.map(g => g.fundId as string)

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { fundId: { in: fundIds } },
      include: { transaction: { select: { type: true } } }
    })

    const fundMap = new Map<string, any>()
    for (const id of fundIds) {
      fundMap.set(id, { 
        contributions: 0, donations: 0,
        grants: 0, expenses: 0,
        loans: 0, loanReturns: 0
      })
    }

    for (const entry of ledgerEntries) {
      const data = fundMap.get(entry.fundId)
      if (entry.isCredit) {
        if (entry.transaction.type === "CONTRIBUTION") data.contributions += entry.amount
        if (entry.transaction.type === "DONATION") data.donations += entry.amount
        if (entry.transaction.type === "REPAYMENT") data.loanReturns += entry.amount
      } else {
        if (entry.transaction.type === "GRANT") data.grants += entry.amount
        if (entry.transaction.type === ("EXPENSE" as any)) data.expenses += entry.amount
        if (entry.transaction.type === "LOAN") data.loans += entry.amount
      }
    }

    const summaries = groupFunds.map(g => {
      const data = fundMap.get(g.fundId as string)
      const totalFund = data.contributions + data.donations
      const currentBalance = totalFund - data.grants - data.expenses - data.loans + data.loanReturns

      return {
        groupId: g.groupId,
        groupName: g.groupName,
        currentBalance,
        totalFund,
        totalContributions: data.contributions,
        totalDonations: data.donations
      }
    })

    return summaries
  }
}
