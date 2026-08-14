"use server"
import { FinancialService } from "@/services/finance"
import { formatShortMonth } from "@/lib/format"

import { prisma } from "@/lib/prisma"
import { getNow, toDhakaTime } from "@/lib/date"
import { requirePermission } from "@/lib/rbac";

export async function getDashboardStats() {
  const now = getNow()
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  

  // Batch 1: Core counts and aggregations (concurrent queries)
  const [
    memberCounts,
    totalGroups,
    totalBeneficiaries,
    totalGrants,
    totalActiveLoans,
    loanAmountAgg,
    repaymentAgg
  ] = await Promise.all([
    prisma.member.groupBy({ by: ['status'], _count: true }),
    prisma.group.count(),
    prisma.beneficiary.count(),
    prisma.grant.count(),
    prisma.loan.count({ where: { status: "ACTIVE" } }),
    prisma.loan.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["ACTIVE", "DEFAULTED"] } }
    }),
    prisma.loanRepayment.aggregate({
      _sum: { amount: true },
      where: { loan: { status: { in: ["ACTIVE", "DEFAULTED"] } } }
    })
  ])

  // Batch 2: Financial aggregations (approx 5 concurrent queries)
  const [
    foundationSummary,
    groupSummaries,
    contributions
  ] = await Promise.all([
    FinancialService.getFoundationSummary(),
    FinancialService.getAllGroupSummaries(),
    prisma.monthlyContribution.aggregate({
      _sum: { expectedAmount: true },
      where: { status: "PAID" }
    })
  ])

  // Batch 3: Chart recent data (3 concurrent queries)
  const [
    recentContributions,
    recentLoans,
    recentGrants
  ] = await Promise.all([
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

  let totalMembers = 0
  let activeMembers = 0
  for (const statusCount of memberCounts) {
    totalMembers += statusCount._count
    if (statusCount.status === "ACTIVE") activeMembers += statusCount._count
  }

  const currentCashBalance = foundationSummary.cashBalance
  const foundationTotalFund = currentCashBalance

  const totalGroupFunds = groupSummaries.reduce((sum: number, s: any) => sum + s.currentBalance, 0)
  
  const groupFundDistribution = groupSummaries.map((s: any) => ({
    name: s.groupName,
    value: s.currentBalance
  }))

  const totalLoanAmount = loanAmountAgg._sum.amount || 0
  const totalRepaid = repaymentAgg._sum.amount || 0
  const outstandingLoanAmount = totalLoanAmount - totalRepaid
  // Group by month
  const monthMap = new Map<string, { month: string, contributions: number, loans: number, grants: number }>()
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const monthStr = formatShortMonth(d.getMonth())
    monthMap.set(monthStr, { month: monthStr, contributions: 0, loans: 0, grants: 0 })
  }

  for (const c of recentContributions) {
    const dhakaDate = toDhakaTime(c.createdAt)
    const m = formatShortMonth(dhakaDate.getMonth())
    if (monthMap.has(m)) monthMap.get(m)!.contributions += (c.expectedAmount)
  }
  for (const l of recentLoans) {
    const dhakaDate = toDhakaTime(l.createdAt)
    const m = formatShortMonth(dhakaDate.getMonth())
    if (monthMap.has(m)) monthMap.get(m)!.loans += (l.amount)
  }
  for (const g of recentGrants) {
    const dhakaDate = toDhakaTime(g.createdAt)
    const m = formatShortMonth(dhakaDate.getMonth())
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
