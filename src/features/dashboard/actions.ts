"use server"
import { formatShortMonth } from "@/lib/format"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { FinancialService } = require("@/services/finance")

  const [
    totalMembers,
    activeMembers,
    totalGroups,
    totalBeneficiaries,
    totalActiveLoans,
    totalGrants,
    loans,
    foundationSummary,
    groupSummaries,
    contributions,
    recentContributions,
    recentLoans,
    recentGrants
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: "ACTIVE" } }),
    prisma.group.count(),
    prisma.beneficiary.count(),
    prisma.loan.count({ where: { status: "ACTIVE" } }),
    prisma.grant.count(),
    prisma.loan.findMany({ where: { status: { in: ["ACTIVE", "DEFAULTED"] } }, include: { repayments: true } }),
    FinancialService.getFoundationSummary(),
    FinancialService.getAllGroupSummaries(),
    prisma.monthlyContribution.aggregate({
      _sum: { expectedAmount: true },
      where: { status: "PAID" }
    }),
    prisma.monthlyContribution.findMany({
      where: { status: "PAID", createdAt: { gte: sixMonthsAgo } },
      select: { expectedAmount: true, createdAt: true }
    }),
    prisma.loan.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true }
    }),
    prisma.grant.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { amount: true, createdAt: true }
    })
  ])

  const currentCashBalance = foundationSummary.cashBalance
  const foundationTotalFund = currentCashBalance

  const totalGroupFunds = groupSummaries.reduce((sum: number, s: any) => sum + s.currentBalance, 0)
  
  const groupFundDistribution = groupSummaries.map((s: any) => ({
    name: s.groupName,
    value: s.currentBalance
  }))

  let outstandingLoanAmount = 0
  for (const loan of loans) {
    const repaid = loan.repayments.reduce((s: any, r: any) => s + r.amount, 0)
    outstandingLoanAmount += (loan.amount - repaid)
  }
  // Group by month
  const monthMap = new Map<string, { month: string, contributions: number, loans: number, grants: number }>()
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const monthStr = formatShortMonth(new Date(d).getUTCMonth())
    monthMap.set(monthStr, { month: monthStr, contributions: 0, loans: 0, grants: 0 })
  }

  for (const c of recentContributions) {
    const m = formatShortMonth(new Date(c.createdAt).getUTCMonth())
    if (monthMap.has(m)) monthMap.get(m)!.contributions += (c.expectedAmount)
  }
  for (const l of recentLoans) {
    const m = formatShortMonth(new Date(l.createdAt).getUTCMonth())
    if (monthMap.has(m)) monthMap.get(m)!.loans += (l.amount)
  }
  for (const g of recentGrants) {
    const m = formatShortMonth(new Date(g.createdAt).getUTCMonth())
    if (monthMap.has(m)) monthMap.get(m)!.grants += (g.amount)
  }

  return {
    totalMembers,
    activeMembers,
    inactiveMembers: totalMembers - activeMembers,
    totalGroups,
    foundationTotalFund,
    totalGroupFunds,
    currentCashBalance,
    totalContributions: contributions._sum.expectedAmount || 0,
    totalActiveLoans,
    outstandingLoanAmount,
    totalGrants,
    totalBeneficiaries,
    groupFundDistribution,
    monthlyChartData: Array.from(monthMap.values())
  }
}
