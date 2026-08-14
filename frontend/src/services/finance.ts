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

    // Use database aggregation instead of loading all entries into memory
    const [creditAgg, debitAgg, transactionCount] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where: { fundId: groupFund.id, isCredit: true },
        select: { amount: true, transaction: { select: { type: true } } }
      }),
      prisma.ledgerEntry.findMany({
        where: { fundId: groupFund.id, isCredit: false },
        select: { amount: true, transaction: { select: { type: true } } }
      }),
      prisma.ledgerEntry.findMany({
        where: { fundId: groupFund.id },
        select: { transactionId: true },
        distinct: ['transactionId']
      })
    ])

    let totalContributions = 0
    let totalDonations = 0
    let totalLoanReturns = 0
    for (const entry of creditAgg) {
      if (entry.transaction.type === "CONTRIBUTION") totalContributions += entry.amount
      if (entry.transaction.type === "REPAYMENT") totalLoanReturns += entry.amount
      if (entry.transaction.type === "DONATION") totalDonations += entry.amount
    }

    let totalLoans = 0
    let totalGrants = 0
    let totalExpenses = 0
    for (const entry of debitAgg) {
      if (entry.transaction.type === "LOAN") totalLoans += entry.amount
      if (entry.transaction.type === "GRANT") totalGrants += entry.amount
      if (entry.transaction.type === ("EXPENSE" as any)) totalExpenses += entry.amount
    }

    // Total Fund = Total Contributions + Total Donations + Other Income
    const totalFund = totalContributions + totalDonations

    // Current Balance = Total Fund - Grants - Expenses - Other Outgoing Transactions
    const currentBalance = totalFund - totalGrants - totalExpenses - totalLoans + totalLoanReturns

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
      totalTransactions: transactionCount.length,
    }
  }

  /**
   * Gets the general foundation fund (Cash) summary.
   * Uses aggregation queries instead of loading all entries into memory.
   */
  static async getFoundationSummary() {
    const generalFund = await prisma.fund.findFirst({
      where: { groupId: null }
    })

    if (!generalFund) return { cashBalance: 0 }

    // Use two aggregate queries instead of loading all entries
    const [debitSum, creditSum] = await Promise.all([
      prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: { fundId: generalFund.id, isCredit: false }
      }),
      prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: { fundId: generalFund.id, isCredit: true }
      })
    ])

    // General fund acts as Cash Asset: Debit increases, Credit decreases
    const cashBalance = (debitSum._sum.amount || 0) - (creditSum._sum.amount || 0)

    return { cashBalance }
  }

  /**
   * Retrieves aggregated summaries for all groups to use in Dashboards.
   * Selects only needed columns to minimize data transfer.
   */
  static async getAllGroupSummaries() {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
        funds: { select: { id: true } }
      }
    })

    const groupFunds = groups.map(g => ({
      groupId: g.id,
      groupName: g.name,
      fundId: g.funds[0]?.id || null
    })).filter(g => g.fundId)

    const fundIds = groupFunds.map(g => g.fundId as string)

    // Select only the columns we need instead of including full transaction objects
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { fundId: { in: fundIds } },
      select: {
        fundId: true,
        amount: true,
        isCredit: true,
        transaction: { select: { type: true } }
      }
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
